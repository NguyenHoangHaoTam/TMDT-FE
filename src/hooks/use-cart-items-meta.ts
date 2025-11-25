import { useEffect, useMemo, useRef, useState } from "react";
import type { TCartItem } from "@/types/cart";
import { getProductDetail } from "@/service/home/service";
import type { TProductDetail } from "@/types/home.type";

type CartItemMeta = {
  productId: number;
  finalPrice: number;
  stockQuantity: number | null;
  discountRate: number;
};

export type EnhancedCartItem = TCartItem & {
  originalPrice: number;
  stockQuantity: number | null;
  discountRate: number;
};

export const useCartItemsMeta = (items?: TCartItem[] | null) => {
  const cacheRef = useRef<Map<number, CartItemMeta>>(new Map());
  const [version, setVersion] = useState(0);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadMeta() {
      if (!items || items.length === 0) {
        return;
      }
      const uniqueIds = Array.from(new Set(items.map((item) => item.productId)));
      const missingIds = uniqueIds.filter((id) => !cacheRef.current.has(id));
      if (missingIds.length === 0) {
        return;
      }
      setIsLoadingMeta(true);
      try {
        await Promise.all(
          missingIds.map(async (id) => {
            try {
              const product = await getProductDetail(String(id));
              if (cancelled || !product) return;
              cacheRef.current.set(id, extractMeta(product));
            } catch (error) {
              console.error("cart-meta: failed to load product", id, error);
              if (!cancelled) {
                cacheRef.current.set(id, {
                  productId: id,
                  finalPrice: NaN,
                  stockQuantity: null,
                  discountRate: 0,
                });
              }
            }
          })
        );
        if (!cancelled) setVersion((prev) => prev + 1);
      } finally {
        if (!cancelled) setIsLoadingMeta(false);
      }
    }
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const enhancedItems: EnhancedCartItem[] = useMemo(() => {
    if (!items || items.length === 0) return [];
    return items.map((item) => {
      const meta = cacheRef.current.get(item.productId);
      const safeQuantity = Math.max(1, item.quantity ?? 0);
      const finalUnitPrice =
        meta && Number.isFinite(meta.finalPrice) && meta.finalPrice > 0
          ? meta.finalPrice
          : Math.max(0, item.price ?? 0);
      const subtotal = finalUnitPrice * safeQuantity;
      return {
        ...item,
        originalPrice: item.price,
        price: finalUnitPrice,
        quantity: safeQuantity,
        subtotal,
        stockQuantity: meta?.stockQuantity ?? null,
        discountRate: meta?.discountRate ?? 0,
      };
    });
  }, [items, version]);

  const computedTotal = useMemo(
    () => enhancedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [enhancedItems]
  );

  const getItemMeta = (productId: number) => cacheRef.current.get(productId);

  return {
    enhancedItems,
    computedTotal,
    isLoadingMeta,
    getItemMeta,
  };
};

function extractMeta(product: TProductDetail): CartItemMeta {
  const discountRate = product.discountRate ?? 0;
  const finalPrice =
    discountRate > 0
      ? product.price * (1 - discountRate)
      : product.price ?? 0;
  return {
    productId: product.id,
    finalPrice,
    stockQuantity: product.stockQuantity ?? null,
    discountRate,
  };
}

