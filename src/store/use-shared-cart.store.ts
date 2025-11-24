import { create } from "zustand";
import type {
  SharedCartDetail,
  SharedCartListItem,
  SharedCartItemDetail,
  SharedCartCreateRequest,
  SharedCartAddItemRequest,
  SharedCartUpdateQuantityRequest,
  SharedCartRemoveItemRequest,
  SharedCartInviteRequest,
  SharedCartUpdateContributionRequest,
  SharedCartUpdateInfoRequest,
  SharedCartCheckoutRequest,
} from "@/types/shared-cart.type";
import {
  createSharedCart,
  getSharedCartList,
  getSharedCartDetail,
  updateSharedCartInfo,
  closeSharedCart,
  cancelSharedCart,
  addItemToSharedCart,
  updateSharedCartItemQuantity,
  removeItemFromSharedCart,
  inviteToSharedCart,
  updateParticipantContribution,
  leaveSharedCart,
  removeParticipant,
  checkoutSharedCart,
} from "@/service/shared-cart";
import { useAuthStore } from "./use-auth.store";

// Helper functions for localStorage cache
const CACHE_KEY = "shared_cart_items_cache";

function loadItemsCacheFromStorage(): Map<number, SharedCartItemDetail[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const map = new Map<number, SharedCartItemDetail[]>();
      Object.entries(parsed).forEach(([key, value]) => {
        map.set(Number(key), value as SharedCartItemDetail[]);
      });
      return map;
    }
  } catch (error) {
    console.error("Failed to load items cache from storage:", error);
  }
  return new Map();
}

function saveItemsCacheToStorage(cache: Map<number, SharedCartItemDetail[]>) {
  try {
    const obj = Object.fromEntries(cache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch (error) {
    console.error("Failed to save items cache to storage:", error);
  }
}

function setCacheItem(cartId: number, items: SharedCartItemDetail[]) {
  const cache = loadItemsCacheFromStorage();
  cache.set(cartId, items);
  saveItemsCacheToStorage(cache);
}

function getCacheItem(cartId: number): SharedCartItemDetail[] | undefined {
  const cache = loadItemsCacheFromStorage();
  return cache.get(cartId);
}

function hasCacheItem(cartId: number): boolean {
  const cache = loadItemsCacheFromStorage();
  return cache.has(cartId);
}

interface SharedCartState {
  // List state
  cartList: SharedCartListItem[];
  isLoadingList: boolean;
  
  // Detail state
  currentCart: SharedCartDetail | null;
  isLoadingDetail: boolean;
  
  // Cache items before checkout to restore if backend doesn't return them after COMPLETED
  itemsCache: Map<number, SharedCartItemDetail[]>;
  
  // Pending invitations: Map<cartId, Map<identifier, userId | null>>
  // Lưu danh sách identifiers (email/username) đã mời nhưng chưa join
  // userId có thể null nếu chưa biết (sẽ được map khi fetch detail)
  pendingInvitations: Map<number, Map<string, number | null>>;
  
  // Actions
  fetchCartList: () => Promise<void>;
  fetchCartDetail: (id: number | string) => Promise<void>;
  createCart: (payload: Omit<SharedCartCreateRequest, "ownerId">) => Promise<boolean>;
  updateCartInfo: (payload: SharedCartUpdateInfoRequest) => Promise<void>;
  closeCart: (id: number | string) => Promise<void>;
  cancelCart: (id: number | string) => Promise<void>;
  addItem: (payload: Omit<SharedCartAddItemRequest, "addByUserId">) => Promise<void>;
  updateQuantity: (payload: SharedCartUpdateQuantityRequest) => Promise<void>;
  removeItem: (payload: SharedCartRemoveItemRequest) => Promise<void>;
  invite: (payload: SharedCartInviteRequest) => Promise<void>;
  updateContribution: (payload: SharedCartUpdateContributionRequest) => Promise<void>;
  leave: (id: number | string) => Promise<void>;
  removeParticipant: (cartId: number | string, participantUserId: number | string) => Promise<void>;
  checkout: (payload: SharedCartCheckoutRequest) => Promise<string | null>;
  clearCurrentCart: () => void;
}

export const useSharedCartStore = create<SharedCartState>((set, get) => ({
  cartList: [],
  isLoadingList: false,
  currentCart: null,
  isLoadingDetail: false,
  itemsCache: loadItemsCacheFromStorage(),
  pendingInvitations: new Map<number, Map<string, number | null>>(),

  async fetchCartList() {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ cartList: [] });
      return;
    }
    set({ isLoadingList: true });
    try {
      const list = await getSharedCartList();
      
      // Fetch detail for completed carts that don't have paymentInfo to get paymentInfo
      // This is needed because backend may not return paymentInfo in list API
      const updatedList = await Promise.all(
        list.map(async (cart) => {
          // If cart is completed but doesn't have paymentInfo, fetch detail
          if (cart.status === "COMPLETED" && !cart.paymentInfo) {
            try {
              const detail = await getSharedCartDetail(cart.id);
              if (detail?.paymentInfo) {
                return {
                  ...cart,
                  paymentInfo: detail.paymentInfo,
                };
              }
            } catch (error) {
              console.error(`Failed to fetch payment info for cart ${cart.id}:`, error);
            }
          }
          return cart;
        })
      );
      
      set({ cartList: updatedList });
    } catch (error) {
      console.error("fetchCartList error:", error);
      set({ cartList: [] });
    } finally {
      set({ isLoadingList: false });
    }
  },

  async fetchCartDetail(id) {
    set({ isLoadingDetail: true });
    try {
      const detail = await getSharedCartDetail(id);
      if (detail) {
        // Cache items if cart is OPEN and has items (for later use if backend doesn't return items after COMPLETED)
        if (detail.status === "OPEN" && detail.items.length > 0) {
          get().itemsCache.set(detail.id, detail.items);
          setCacheItem(detail.id, detail.items);
        }
        
        // If cart is COMPLETED and items are empty or missing,
        // restore items from cache (backend may not return items after checkout)
        // This is critical: shared cart should show items even after checkout (like order history)
        // This ensures users can see what was ordered, similar to personal cart order history
        if (detail.status === "COMPLETED") {
          console.log(`📦 Fetching COMPLETED cart ${detail.id}: backend returned ${detail.items.length} items, totalItems=${detail.totalItems}`);
          
          // If backend doesn't return items but totalItems > 0, restore from cache
          if (detail.items.length === 0 && detail.totalItems > 0) {
            let cachedItems: SharedCartItemDetail[] | undefined;
            
            // Try memory cache first (fastest)
            if (get().itemsCache.has(detail.id)) {
              cachedItems = get().itemsCache.get(detail.id);
              console.log(`💾 Found ${cachedItems?.length || 0} items in memory cache for cart ${detail.id}`);
            }
            
            // If not in memory, try localStorage (important for when user returns from VNPay in new tab/window)
            // or when page is refreshed
            if (!cachedItems && hasCacheItem(detail.id)) {
              cachedItems = getCacheItem(detail.id);
              console.log(`💾 Found ${cachedItems?.length || 0} items in localStorage cache for cart ${detail.id}`);
              // Also restore to memory cache for faster access next time
              if (cachedItems) {
                get().itemsCache.set(detail.id, cachedItems);
              }
            }
            
            if (cachedItems && cachedItems.length > 0) {
              detail.items = cachedItems;
              console.log(`✅ RESTORED ${cachedItems.length} items from cache for COMPLETED cart ${detail.id} (like order history)`);
            } else {
              // Warn if we expected items but cache is missing
              console.error(`❌ CRITICAL: Cart ${detail.id} is COMPLETED with totalItems=${detail.totalItems} but NO items found in cache! Backend may have deleted items or cache was cleared.`);
              console.error(`   Memory cache has cart ${detail.id}:`, get().itemsCache.has(detail.id));
              console.error(`   localStorage cache has cart ${detail.id}:`, hasCacheItem(detail.id));
            }
          }
          // If backend returns items, update cache to ensure it's fresh
          else if (detail.items.length > 0) {
            // Update cache with items from backend (in case backend does return items)
            get().itemsCache.set(detail.id, detail.items);
            setCacheItem(detail.id, detail.items);
            console.log(`✅ Backend returned ${detail.items.length} items for COMPLETED cart ${detail.id}, updated cache`);
          }
          // If backend returns empty items and totalItems is 0, that's normal (empty cart)
          else if (detail.totalItems === 0) {
            console.log(`ℹ️ Cart ${detail.id} is COMPLETED with 0 items (empty cart)`);
          }
        }
        
        // Loại bỏ pending invitations đã join và map identifier -> userId
        const cartId = detail.id;
        const currentPending = get().pendingInvitations.get(cartId);
        if (currentPending && currentPending.size > 0) {
          const joinedUserIds = new Set<number>();
          const identifierToUserId = new Map<string, number>();
          
          // Thu thập userId của những người đã join
          // Và map identifier (email/username) -> userId từ participants
          detail.participants.forEach((p) => {
            joinedUserIds.add(p.userId);
            // Map email -> userId
            if (p.userEmail) {
              identifierToUserId.set(p.userEmail.toLowerCase(), p.userId);
            }
            // Map username -> userId
            if (p.userName) {
              identifierToUserId.set(p.userName.toLowerCase(), p.userId);
            }
          });
          
          // Cập nhật pending invitations:
          // 1. Map identifier -> userId nếu chưa có
          // 2. Loại bỏ những identifier/userId đã join
          const updatedPending = new Map<string, number | null>();
          currentPending.forEach((userId, identifier) => {
            const lowerIdentifier = identifier.toLowerCase();
            
            // Nếu chưa có userId, thử map từ participants
            let mappedUserId = userId;
            if (mappedUserId === null && identifierToUserId.has(lowerIdentifier)) {
              mappedUserId = identifierToUserId.get(lowerIdentifier)!;
            }
            
            // Kiểm tra xem user đã join chưa (so sánh bằng userId)
            const isJoined = mappedUserId !== null && joinedUserIds.has(mappedUserId);
            
            if (!isJoined) {
              // Nếu đã map được userId thì lưu userId, nếu không thì giữ null
              updatedPending.set(identifier, mappedUserId);
            }
          });
          
          // Cập nhật pending invitations
          if (updatedPending.size === 0) {
            const newPendingMap = new Map(get().pendingInvitations);
            newPendingMap.delete(cartId);
            set({ pendingInvitations: newPendingMap });
          } else {
            const newPendingMap = new Map(get().pendingInvitations);
            newPendingMap.set(cartId, updatedPending);
            set({ pendingInvitations: newPendingMap });
          }
        }
        
        set({ currentCart: detail });
      } else {
        set({ currentCart: null });
      }
    } catch (error) {
      console.error("fetchCartDetail error:", error);
      set({ currentCart: null });
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  async createCart(payload) {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new Error("UNAUTHENTICATED");
    }
    try {
      const newCart = await createSharedCart(payload);
      if (newCart) {
        // Refresh list
        await get().fetchCartList();
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  },

  async updateCartInfo(payload) {
    try {
      await updateSharedCartInfo(payload);
      // Refresh current cart if it's the one being updated
      if (get().currentCart?.id === payload.sharedCartId) {
        await get().fetchCartDetail(payload.sharedCartId);
      }
      // Refresh list
      await get().fetchCartList();
    } catch (error) {
      throw error;
    }
  },

  async closeCart(id) {
    // Xóa pending invitations khi cart bị đóng
    const cartId = Number(id);
    const newPendingMap = new Map(get().pendingInvitations);
    newPendingMap.delete(cartId);
    set({ pendingInvitations: newPendingMap });
    try {
      await closeSharedCart(id);
      // Refresh current cart if it's the one being closed
      if (get().currentCart?.id === id) {
        await get().fetchCartDetail(id);
      }
      // Refresh list
      await get().fetchCartList();
    } catch (error) {
      throw error;
    }
  },

  async cancelCart(id) {
    // Xóa pending invitations khi cart bị hủy
    const cartId = Number(id);
    const newPendingMap = new Map(get().pendingInvitations);
    newPendingMap.delete(cartId);
    set({ pendingInvitations: newPendingMap });
    try {
      await cancelSharedCart(id);
      // Refresh current cart if it's the one being cancelled
      if (get().currentCart?.id === id) {
        await get().fetchCartDetail(id);
      }
      // Refresh list
      await get().fetchCartList();
    } catch (error) {
      throw error;
    }
  },

  async addItem(payload) {
    try {
      await addItemToSharedCart(payload);
      // Refresh current cart if it's the one being updated
      if (get().currentCart?.id === payload.sharedCartId) {
        await get().fetchCartDetail(payload.sharedCartId);
      }
      // Refresh list
      await get().fetchCartList();
    } catch (error) {
      throw error;
    }
  },

  async updateQuantity(payload) {
    try {
      await updateSharedCartItemQuantity(payload);
      // Refresh current cart if it's the one being updated
      if (get().currentCart?.id === payload.sharedCartId) {
        await get().fetchCartDetail(payload.sharedCartId);
      }
      // Refresh list
      await get().fetchCartList();
    } catch (error) {
      throw error;
    }
  },

  async removeItem(payload) {
    try {
      await removeItemFromSharedCart(payload);
      // Refresh current cart if it's the one being updated
      if (get().currentCart?.id === payload.sharedCartId) {
        await get().fetchCartDetail(payload.sharedCartId);
      }
      // Refresh list
      await get().fetchCartList();
    } catch (error) {
      throw error;
    }
  },

  async invite(payload) {
    try {
      const response = await inviteToSharedCart(payload);
      
      // Lưu danh sách identifiers đã mời vào pending invitations
      // Map identifier -> userId từ response nếu có
      const cartId = payload.sharedCartId;
      const currentPending = get().pendingInvitations.get(cartId) || new Map<string, number | null>();
      
      // Tạo map từ response: identifier -> userId
      const responseMap = new Map<string, number>();
      if (response && response.length > 0) {
        // Response có thể chứa userId của những user đã được mời
        // Tuy nhiên, response chỉ có userId khi user đã join, nên ta sẽ map sau khi fetch detail
        // Ở đây ta chỉ lưu identifier với userId = null
      }
      
      // Lưu tất cả identifiers với userId = null (sẽ được map khi fetch detail)
      payload.identifiers.forEach((identifier) => {
        const trimmed = identifier.trim();
        if (trimmed && !currentPending.has(trimmed)) {
          currentPending.set(trimmed, null);
        }
      });
      
      const newPendingMap = new Map(get().pendingInvitations);
      newPendingMap.set(cartId, currentPending);
      set({ pendingInvitations: newPendingMap });
      
      // Refresh current cart if it's the one being updated
      // fetchCartDetail sẽ tự động map identifier -> userId từ participants
      if (get().currentCart?.id === payload.sharedCartId) {
        await get().fetchCartDetail(payload.sharedCartId);
      }
      // Refresh list
      await get().fetchCartList();
    } catch (error) {
      throw error;
    }
  },

  async updateContribution(payload) {
    try {
      await updateParticipantContribution(payload);
      // Refresh current cart if it's the one being updated
      if (get().currentCart?.id === payload.sharedCartId) {
        await get().fetchCartDetail(payload.sharedCartId);
      }
    } catch (error) {
      throw error;
    }
  },

  async leave(id) {
    try {
      await leaveSharedCart(id);
      // Clear current cart if leaving it
      if (get().currentCart?.id === id) {
        set({ currentCart: null });
      }
      // Refresh list
      await get().fetchCartList();
    } catch (error) {
      throw error;
    }
  },

  async removeParticipant(cartId, participantUserId) {
    try {
      await removeParticipant(cartId, participantUserId);
      // Refresh current cart if it's the one being updated
      if (get().currentCart?.id === cartId) {
        await get().fetchCartDetail(cartId);
      }
    } catch (error) {
      throw error;
    }
  },

  async checkout(payload) {
    try {
      // CRITICAL: Cache items BEFORE checkout in case backend deletes them after checkout
      // This is essential because backend may delete items after checkout
      // Shared cart should keep items even after checkout (like order history)
      console.log(`🛒 Starting checkout for cart ${payload.sharedCartId}...`);
      
      const currentCart = get().currentCart;
      let itemsToCache: SharedCartItemDetail[] | undefined;
      
      // Strategy 1: Use currentCart items if available and valid
      if (currentCart?.id === payload.sharedCartId && currentCart.items && currentCart.items.length > 0) {
        itemsToCache = currentCart.items;
        console.log(`✅ Found ${itemsToCache.length} items in currentCart for cart ${payload.sharedCartId}`);
      } 
      // Strategy 2: Try to get from existing cache
      else if (hasCacheItem(payload.sharedCartId)) {
        itemsToCache = getCacheItem(payload.sharedCartId);
        if (itemsToCache && itemsToCache.length > 0) {
          console.log(`✅ Found ${itemsToCache.length} items in cache for cart ${payload.sharedCartId}`);
        }
      }
      
      // Strategy 3: If still no items, fetch detail to get items BEFORE checkout
      // This is CRITICAL because backend may delete items immediately after checkout
      // We MUST have items cached before calling checkout API
      if (!itemsToCache || itemsToCache.length === 0) {
        console.log(`⚠️ No items found, fetching detail for cart ${payload.sharedCartId} before checkout...`);
        try {
          const detail = await getSharedCartDetail(payload.sharedCartId);
          if (detail?.items && detail.items.length > 0) {
            itemsToCache = detail.items;
            console.log(`✅ Fetched ${itemsToCache.length} items from backend for cart ${payload.sharedCartId}`);
            // Also update currentCart if it's the same cart
            if (currentCart?.id === payload.sharedCartId) {
              set({ currentCart: detail });
            }
          } else {
            console.warn(`⚠️ Cart ${payload.sharedCartId} has no items before checkout! totalItems=${detail?.totalItems || 0}`);
          }
        } catch (error) {
          console.error(`❌ Failed to fetch items before checkout for cart ${payload.sharedCartId}:`, error);
        }
      }
      
      // CRITICAL: Save items to cache BEFORE calling checkout API
      // Backend may delete items immediately after checkout, so we must cache first
      if (itemsToCache && itemsToCache.length > 0) {
        get().itemsCache.set(payload.sharedCartId, itemsToCache);
        setCacheItem(payload.sharedCartId, itemsToCache);
        console.log(`💾 Cached ${itemsToCache.length} items for cart ${payload.sharedCartId} BEFORE checkout`);
      } else {
        console.error(`❌ CRITICAL: No items to cache for cart ${payload.sharedCartId} before checkout!`);
        console.error(`   This means items will be lost after checkout. Check if backend is deleting items too early.`);
      }
      
      // Now call checkout API (backend may delete items after this)
      const paymentUrl = await checkoutSharedCart(payload);
      console.log(`✅ Checkout API called, paymentUrl: ${paymentUrl || 'null (COD)'}`);
      
      // For COD: paymentUrl is null, cart is immediately COMPLETED
      // For VNPay: paymentUrl is a URL, cart will be COMPLETED after payment
      // In both cases, we need to refresh to show items from cache
      
      // Refresh current cart if it's the one being checked out
      // This ensures items are restored from cache if backend doesn't return them
      if (get().currentCart?.id === payload.sharedCartId) {
        // Small delay to ensure backend has processed the checkout
        setTimeout(async () => {
          try {
            console.log(`🔄 Refreshing cart ${payload.sharedCartId} after checkout...`);
            await get().fetchCartDetail(payload.sharedCartId);
            console.log(`✅ Cart ${payload.sharedCartId} refreshed after checkout`);
          } catch (error) {
            console.error(`❌ Failed to refresh shared cart after checkout:`, error);
          }
        }, 500);
      }
      
      // Refresh list to update status and paymentInfo
      await get().fetchCartList();
      
      return paymentUrl;
    } catch (error) {
      console.error(`❌ Checkout error for cart ${payload.sharedCartId}:`, error);
      throw error;
    }
  },

  clearCurrentCart() {
    set({ currentCart: null });
  },
}));

