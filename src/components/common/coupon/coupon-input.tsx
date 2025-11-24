import { useState } from "react";
import { Loader2, X, CheckCircle2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCouponInfo, validateCoupon, calculateCouponDiscount } from "@/service/coupon/service";
import type { CouponDTO } from "@/types/coupon.type";
import toast from "react-hot-toast";

interface CouponInputProps {
  orderTotal: number;
  onCouponApplied?: (coupon: CouponDTO | null, discountAmount: number) => void;
  initialCoupon?: CouponDTO | null;
}

export function CouponInput({
  orderTotal,
  onCouponApplied,
  initialCoupon = null,
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDTO | null>(initialCoupon);
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsLoading(true);
    try {
      const coupon = await getCouponInfo(couponCode.trim().toUpperCase());
      
      if (!coupon) {
        toast.error("Mã giảm giá không tồn tại");
        setCouponCode("");
        return;
      }

      // Validate coupon
      const validation = validateCoupon(coupon);
      if (!validation.valid) {
        toast.error(validation.message);
        setCouponCode("");
        return;
      }

      // Tính toán giảm giá
      const { discountAmount: discount } = calculateCouponDiscount(coupon, orderTotal);

      setAppliedCoupon(coupon);
      setDiscountAmount(discount);
      setCouponCode("");

      toast.success("Áp dụng mã giảm giá thành công!");
      onCouponApplied?.(coupon, discount);
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Không thể áp dụng mã giảm giá. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    onCouponApplied?.(null, 0);
    toast.success("Đã xóa mã giảm giá");
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplyCoupon();
                }
              }}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleApplyCoupon}
            disabled={isLoading || !couponCode.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Đang kiểm tra...</span>
              </>
            ) : (
              "Áp dụng"
            )}
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900">
                  Mã giảm giá đã áp dụng
                </span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <span className="font-medium">Mã:</span> {appliedCoupon.code}
                </p>
                {appliedCoupon.description && (
                  <p>{appliedCoupon.description}</p>
                )}
                <p className="text-green-600 font-semibold">
                  Giảm: {formatCurrency(discountAmount)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveCoupon}
              className="h-8 w-8 text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

