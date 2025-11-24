export interface CouponDTO {
  id: number;
  code: string;
  description: string;
  validFrom: string; // ISO date string
  validTo: string; // ISO date string
  discountValue: number;
  isPercent: boolean; // true = giảm theo %, false = giảm theo số tiền
  usageLimit: number; // số lượt tối đa
  usedCount: number; // số lượt đã sử dụng
}

export interface ApplyCouponRequest {
  code: string; // mã người dùng nhập
  orderTotal: number; // tổng giá trị đơn hàng trước khi giảm
}

export interface ApplyCouponResponse {
  code: string;
  valid: boolean;
  message: string;
  discountAmount: number; // số tiền được giảm
  finalTotal: number; // tổng tiền sau khi giảm
}

export type CouponStatusFilter = "ACTIVE" | "UPCOMING" | "EXPIRED";

export interface CouponPageResponse {
  content: CouponDTO[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CouponFormValues {
  code: string;
  description: string;
  validFrom: string; // datetime-local
  validTo: string; // datetime-local
  discountValue: string;
  isPercent: boolean;
  usageLimit: string;
}

export interface CouponListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: CouponStatusFilter;
}

export interface CouponCreateResponse {
  id: number;
  code: string;
  message: string;
  createdAt: string;
}

