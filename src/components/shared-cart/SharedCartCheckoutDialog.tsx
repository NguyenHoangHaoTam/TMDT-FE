import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSharedCartStore } from "@/store/use-shared-cart.store";
import { Loader2, CreditCard, Wallet } from "lucide-react";
import { formatMoney } from "@/utils/helper";
import type { SharedCartDetail } from "@/types/shared-cart.type";
import { getSharedOrderHistory } from "@/service/order/service";

interface SharedCartCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sharedCart: SharedCartDetail;
}

export function SharedCartCheckoutDialog({
  open,
  onOpenChange,
  sharedCart,
}: SharedCartCheckoutDialogProps) {
  const navigate = useNavigate();
  const { checkout, fetchCartList } = useSharedCartStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"VNPAY" | "COD" | "MOMO">("VNPAY");
  const [isLoading, setIsLoading] = useState(false);

  const paymentOptions: Array<{
    id: "VNPAY" | "COD" | "MOMO";
    label: string;
    desc: string;
    icon: React.ReactNode;
    disabled?: boolean;
  }> = [
    {
      id: "VNPAY",
      label: "VNPay - Thẻ nội địa/QR",
      desc: "Thanh toán an toàn qua cổng VNPay. Chúng tôi sẽ chuyển bạn sang VNPay để hoàn tất.",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "COD",
      label: "Thanh toán khi nhận hàng (COD)",
      desc: "Thanh toán trực tiếp cho shipper khi nhận hàng.",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      id: "MOMO",
      label: "MoMo (Sắp có)",
      desc: "Thanh toán qua ví MoMo. Tính năng đang được phát triển.",
      icon: <Wallet className="h-5 w-5" />,
      disabled: true,
    },
  ];

  const handleCheckout = async () => {
    if (!sharedCart || sharedCart.items.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      // CRITICAL: Ensure items are cached BEFORE checkout
      // The sharedCart prop is a snapshot when dialog opens, so it should have items
      // But we need to make sure they're cached before backend potentially deletes them
      console.log(`🛒 Checkout dialog: Cart ${sharedCart.id} has ${sharedCart.items.length} items`);
      
      const paymentUrl = await checkout({
        sharedCartId: sharedCart.id,
        paymentMethod: selectedPaymentMethod,
      });

      // Nếu là COD, paymentUrl sẽ là null (đã thành công)
      if (!paymentUrl) {
        // COD thành công, tìm order mới nhất và redirect đến order detail
        try {
          // Đợi một chút để backend tạo order xong
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Fetch shared order history để tìm order mới nhất
          const orderHistory = await getSharedOrderHistory();
          if (orderHistory?.orders && orderHistory.orders.length > 0) {
            // Tìm order mới nhất (đã được sắp xếp theo createdAt desc)
            const latestOrder = orderHistory.orders[0];
            // Đóng dialog và redirect đến order detail
            onOpenChange(false);
            navigate(`/orders/${latestOrder.id}`);
            return;
          }
          
          // Nếu không tìm thấy order, fallback về refresh cart list
          console.warn("Could not find order after checkout, refreshing cart list");
          await fetchCartList();
          onOpenChange(false);
        } catch (error) {
          console.error("Failed to find order after COD checkout:", error);
          // Fallback: refresh cart list và đóng dialog
          try {
            await fetchCartList();
          } catch (e) {
            console.error("Failed to refresh cart list:", e);
          }
          onOpenChange(false);
        }
        return;
      }

      // Nếu là VNPay, lưu sharedCartId vào sessionStorage để VNPayReturnPage xử lý
      // và chuyển hướng đến payment URL
      if (paymentUrl && paymentUrl !== "success") {
        sessionStorage.setItem("checkoutSharedCartId", sharedCart.id.toString());
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // Error đã được xử lý trong service (toast)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Thanh toán giỏ hàng chung</DialogTitle>
          <DialogDescription>
            Chọn phương thức thanh toán để hoàn tất đơn hàng. Chỉ chủ sở hữu mới có thể thanh toán.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Summary */}
          <div className="rounded-lg border bg-gray-50 p-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-700">Tóm tắt đơn hàng</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng sản phẩm:</span>
              <span className="font-semibold">{sharedCart.totalItems} sản phẩm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng tiền:</span>
              <span className="font-semibold text-green-600 text-lg">
                {formatMoney(sharedCart.totalAmount)}đ
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Chọn phương thức thanh toán</Label>
            {paymentOptions.map((method) => {
              const isActive = selectedPaymentMethod === method.id;
              return (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    isActive
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  } ${method.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    className="mt-1 h-4 w-4 text-orange-500"
                    checked={isActive}
                    onChange={() => !method.disabled && setSelectedPaymentMethod(method.id)}
                    disabled={method.disabled || isLoading}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <p className="font-semibold text-gray-900">{method.label}</p>
                      {method.id === "VNPAY" && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          Khuyên dùng
                        </span>
                      )}
                      {method.disabled && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                          Sắp có
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{method.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Info Message */}
          {selectedPaymentMethod === "VNPAY" && (
            <div className="rounded-lg bg-green-50 border border-green-100 p-4 text-sm text-green-700">
              Chúng tôi sẽ chuyển hướng bạn tới trang VNPay để hoàn tất thanh toán. Vui lòng không đóng trình duyệt trong quá trình này.
            </div>
          )}

          {selectedPaymentMethod === "COD" && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
              Bạn sẽ thanh toán trực tiếp cho shipper khi nhận hàng. Vui lòng chuẩn bị đúng số tiền.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleCheckout}
            disabled={isLoading || sharedCart.items.length === 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {selectedPaymentMethod === "COD" ? "Đang tạo đơn hàng..." : "Đang chuyển đến VNPay..."}
              </>
            ) : (
              "TIẾN HÀNH THANH TOÁN"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

