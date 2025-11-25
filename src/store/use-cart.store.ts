import { create } from "zustand";
import type { AddToCartPayload, TCart, TCartItem } from "@/types/cart";
import {
  addItemToCart,
  clearCartItems,
  fetchCart as fetchCartApi,
  removeItemFromCart,
} from "@/service/cart/service";
import { useAuthStore } from "./use-auth.store";
import toast from "react-hot-toast";

const sanitizeCartItem = (item: TCartItem): TCartItem => {
  const safeQuantity = Math.max(1, item.quantity ?? 0);
  const safePrice = Math.max(0, item.price ?? 0);
  const providedSubtotal = typeof item.subtotal === "number" ? item.subtotal : safePrice * safeQuantity;
  const safeSubtotal = Math.max(providedSubtotal, safePrice * safeQuantity, 0);
  return {
    ...item,
    quantity: safeQuantity,
    price: safePrice,
    subtotal: safeSubtotal,
  };
};

const sanitizeCart = (cart: TCart | null): TCart | null => {
  if (!cart) return null;
  const items = (cart.items ?? []).map(sanitizeCartItem);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return {
    ...cart,
    items,
    totalAmount,
    totalItems,
  };
};

interface CartState {
  cart: TCart | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  initialized: boolean;
  fetchCart: () => Promise<TCart | null>;
  addItem: (payload: AddToCartPayload) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, nextQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  finalizeCartAfterCheckout: () => Promise<void>;
  resetCartState: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  isDrawerOpen: false,
  initialized: false,

  async fetchCart() {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ cart: null, initialized: true });
      return null;
    }
    set({ isLoading: true });
    try {
      const cart = await fetchCartApi();
      const safeCart = sanitizeCart(cart ?? null);
      set({ cart: safeCart, initialized: true });
      return safeCart;
    } catch (error: any) {
      // Handle errors gracefully - set cart to null instead of throwing
      console.error("fetchCart error in store:", error);
      set({ cart: null, initialized: true });
      // Only throw if it's an authentication error (401/403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw error;
      }
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  async addItem(payload) {
    const token = useAuthStore.getState().token;
    if (!token) {
      toast.error("Vui lòng đăng nhập để sử dụng giỏ hàng");
      throw new Error("UNAUTHENTICATED");
    }
    set({ isLoading: true });
    try {
      const cart = await addItemToCart(payload);
      set({ cart: sanitizeCart(cart), isDrawerOpen: true });
      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } finally {
      set({ isLoading: false });
    }
  },

  async removeItem(productId) {
    set({ isLoading: true });
    try {
      await removeItemFromCart(productId);
      const cart = await fetchCartApi();
      set({ cart: sanitizeCart(cart ?? null) });
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } finally {
      set({ isLoading: false });
    }
  },

  async updateQuantity(productId, nextQuantity) {
    const currentCart = get().cart;
    const item = currentCart?.items.find((i) => i.productId === productId);
    if (!item) return;

    const safeQuantity = Math.max(0, nextQuantity);
    if (safeQuantity === item.quantity) {
      return;
    }
    if (safeQuantity === 0) {
      await get().removeItem(productId);
      return;
    }

    const delta = safeQuantity - item.quantity;
    set({ isLoading: true });
    try {
      const cart = await addItemToCart({
        productId,
        quantity: delta,
      });
      set({ cart: sanitizeCart(cart) });
    } finally {
      set({ isLoading: false });
    }
  },

  async clearCart() {
    set({ isLoading: true });
    try {
      await clearCartItems();
      const cart = await fetchCartApi();
      set({ cart: sanitizeCart(cart ?? null) });
      toast.success("Đã xóa giỏ hàng");
    } finally {
      set({ isLoading: false });
    }
  },

  async finalizeCartAfterCheckout() {
    try {
      await clearCartItems();
    } catch (error) {
      console.error("finalizeCartAfterCheckout", error);
    } finally {
      set({ cart: null });
    }
  },

  resetCartState() {
    set({ cart: null });
  },

  openDrawer() {
    set({ isDrawerOpen: true });
  },
  closeDrawer() {
    set({ isDrawerOpen: false });
  },
  setDrawerOpen(open) {
    set({ isDrawerOpen: open });
  },
}));
