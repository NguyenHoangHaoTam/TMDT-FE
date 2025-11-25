import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCartStore } from "@/store/use-cart.store";
import { useCartItemsMeta, type EnhancedCartItem } from "@/hooks/use-cart-items-meta";
import type { TCartItem } from "@/types/cart";
import toast from "react-hot-toast";

const FREE_SHIPPING_THRESHOLD = 300_000;

const formatCurrency = (value?: number) =>
  (value ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    cart,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    isLoading,
  } = useCartStore();

  const { enhancedItems, computedTotal } = useCartItemsMeta(cart?.items);
  type DisplayCartItem = EnhancedCartItem | TCartItem;
  const displayItems: DisplayCartItem[] = enhancedItems.length
    ? enhancedItems
    : cart?.items ?? [];
  const total = computedTotal ?? cart?.totalAmount ?? 0;
  const hasItems = displayItems.length > 0;
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);
  const reachedFreeShipping = total >= FREE_SHIPPING_THRESHOLD;

  const handleIncrement = (productId: number, current: number, max?: number | null) => {
    const nextQuantity = current + 1;
    if (max && nextQuantity > max) {
      toast.error(`Chỉ còn ${max} sản phẩm trong kho.`);
      return;
    }
    updateQuantity(productId, nextQuantity);
  };

  const handleCheckout = () => {
    closeDrawer();
    navigate("/checkout");
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex transition-opacity duration-200 ${
        isDrawerOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="flex-1 bg-black/40"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        className={`w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="p-5 border-b flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Giỏ hàng
            </p>
            <h3 className="text-2xl font-semibold text-gray-900">Sản phẩm</h3>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Đóng giỏ hàng"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="px-5 py-4">
          <p
            className={`text-sm font-medium ${
              reachedFreeShipping ? "text-green-600" : "text-gray-600"
            }`}
          >
            {reachedFreeShipping
              ? "Đơn hàng đủ điều kiện giao hàng miễn phí!"
              : `Bạn cần mua thêm ${formatCurrency(
                  Math.max(0, FREE_SHIPPING_THRESHOLD - total)
                )} để được freeship.`}
          </p>
          <Progress value={progress} className="mt-2 h-2 bg-gray-200" />
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {!hasItems && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">Giỏ hàng của bạn đang trống</p>
              <p className="text-sm mt-2">
                Hãy thêm sản phẩm yêu thích để bắt đầu mua sắm nhé!
              </p>
            </div>
          )}

          {hasItems && (
            <ul className="space-y-4">
              {displayItems.map((item) => {
                const originalPrice =
                  "originalPrice" in item ? item.originalPrice : item.price;
                const hasDiscount = originalPrice > item.price;
                const maxStock =
                  "stockQuantity" in item ? item.stockQuantity : null;
                return (
                <li
                  key={item.productId}
                  className="flex gap-3 border rounded-xl p-3 shadow-sm"
                >
                  <img
                    src={
                      item.productImageUrl || "/assets/img/img-placeholder.png"
                    }
                    alt={item.productName}
                    className="h-20 w-20 rounded-lg object-cover bg-gray-50"
                  />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold leading-tight line-clamp-2">
                          {item.productName}
                        </p>
                        <div className="text-sm text-muted-foreground mt-1">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.price)}
                          </p>
                          {hasDiscount && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatCurrency(originalPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center border rounded-full">
                        <button
                          type="button"
                          className="p-2 disabled:opacity-40"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || isLoading}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="p-2 disabled:opacity-40"
                          onClick={() =>
                            handleIncrement(
                              item.productId,
                              item.quantity,
                              maxStock
                            )
                          }
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
            </ul>
          )}
        </div>

        <footer className="border-t p-5 space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tạm tính</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(total)}
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              asChild
              variant="outline"
              className="w-full border-green-600 text-green-700 hover:bg-green-50"
              disabled={!hasItems}
              onClick={closeDrawer}
            >
              <Link to="/cart">Xem giỏ hàng</Link>
            </Button>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-lg"
              disabled={!hasItems}
              onClick={handleCheckout}
            >
              Thanh toán
            </Button>
          </div>
        </footer>
      </aside>
    </div>
  );
};

export default CartDrawer;
