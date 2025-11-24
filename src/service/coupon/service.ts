import type { ApiResponse } from "@/types/response-api.type";
import ApiEndPoint from "../api";
import { api } from "../config-api";
import type { CouponDTO } from "@/types/coupon.type";
import toast from "react-hot-toast";

/**
 * Lấy thông tin mã giảm giá theo code
 */
export async function getCouponInfo(code: string): Promise<CouponDTO | null> {
  try {
    const res = await api.get<ApiResponse<CouponDTO>>(
      ApiEndPoint.COUPON_INFO(code)
    );
    if (res?.data?.code === 200 && res.data.data) {
      return res.data.data;
    }
    return null;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Không thể lấy thông tin mã giảm giá";
    if (error?.response?.status !== 404) {
      toast.error(message);
    }
    return null;
  }
}

/**
 * Áp dụng mã giảm giá (tính toán giảm giá)
 * Note: Backend không có endpoint riêng cho apply, nó được xử lý trong OrderService
 * Hàm này chỉ để validate và tính toán phía client
 */
export function calculateCouponDiscount(
  coupon: CouponDTO,
  orderTotal: number
): { discountAmount: number; finalTotal: number } {
  let discountAmount = 0;

  if (coupon.isPercent) {
    // Giảm theo phần trăm
    discountAmount = orderTotal * (coupon.discountValue / 100);
  } else {
    // Giảm theo số tiền cố định
    discountAmount = coupon.discountValue;
  }

  // Đảm bảo không giảm quá tổng tiền
  if (discountAmount > orderTotal) {
    discountAmount = orderTotal;
  }

  const finalTotal = Math.max(0, orderTotal - discountAmount);

  return { discountAmount, finalTotal };
}

/**
 * Validate coupon có hợp lệ không
 */
export function validateCoupon(coupon: CouponDTO): {
  valid: boolean;
  message: string;
} {
  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const validTo = new Date(coupon.validTo);

  // Kiểm tra thời gian hiệu lực
  if (now < validFrom) {
    return {
      valid: false,
      message: "Mã giảm giá chưa có hiệu lực",
    };
  }

  if (now > validTo) {
    return {
      valid: false,
      message: "Mã giảm giá đã hết hạn",
    };
  }

  // Kiểm tra số lượt sử dụng
  if (coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      message: "Mã giảm giá đã hết lượt sử dụng",
    };
  }

  return {
    valid: true,
    message: "Mã giảm giá hợp lệ",
  };
}

