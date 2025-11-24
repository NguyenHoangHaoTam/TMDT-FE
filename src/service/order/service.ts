import type { ApiResponse } from "@/types/response-api.type";
import ApiEndPoint from "../api";
import { api } from "../config-api";
import toast from "react-hot-toast";

export type OrderType = "SINGLE" | "GROUP";
export type PaymentMethod = "VNPAY" | "COD" | "MOMO";

export interface CheckoutPayload {
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  amount?: number;
  couponCode?: string | null;
  cartItems?: Array<{
    id: number;
    productId: number;
    quantity: number;
  }>;
  directItems?: Array<{
    productId: number;
    qty: number;
    unitPrice?: number;
  }>;
}

export interface CheckoutVNPayPayload extends CheckoutPayload {
  paymentMethod: Extract<PaymentMethod, "VNPAY">;
}

export async function checkoutWithVNPay(payload: CheckoutVNPayPayload) {
  try {
    const res = await api.post<ApiResponse<string>>(
      ApiEndPoint.ORDERS_CHECKOUT_VNPAY,
      payload
    );
    if (res?.data?.code === 200 && res.data.data) {
      return res.data.data;
    }
    toast.error("Không lấy được URL thanh toán VNPay");
    throw new Error("Missing payment URL");
  } catch (error) {
    toast.error("Không thể khởi tạo thanh toán VNPay");
    throw error;
  }
}

export async function verifyVNPayReturn(params: Record<string, string>) {
  try {
    const res = await api.get<ApiResponse<string>>(
      ApiEndPoint.ORDERS_VNPAY_RETURN,
      { params }
    );
    return res.data;
  } catch (error) {
    toast.error("Không thể xác thực kết quả thanh toán");
    throw error;
  }
}

export async function checkoutWithCOD(
  payload: Omit<CheckoutPayload, "paymentMethod">
) {
  try {
    const res = await api.post<ApiResponse<any>>(
      ApiEndPoint.ORDERS_CHECKOUT_VNPAY,
      {
        ...payload,
        paymentMethod: "COD",
      }
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }
    toast.error("Không thể tạo đơn hàng COD");
    throw new Error("Failed to create COD order");
  } catch (error) {
    toast.error("Không thể tạo đơn hàng COD");
    throw error;
  }
}

// Order Detail Types
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";

export interface OrderItemDetail {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productThumbnail: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentDetail {
  id: number;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt: string | null;
}

export interface AddressDetail {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
  createdAt: string;
}

export interface OrderDetail {
  id: number;
  userId: number;
  userEmail: string;
  totalAmount: number;
  status: OrderStatus;
  orderType: string;
  couponId: number | null;
  couponCode: string | null;
  discountAmount: number | null;
  sharedCartId: number | null;
  sharedCartTitle: string | null;
  createdAt: string;
  payment: PaymentDetail | null;
  items: OrderItemDetail[];
  shippingAddress: AddressDetail | null;
}

export interface OrderSummary {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  orderType: string;
  firstProductThumbnail: string | null;
  createdAt: string;
  paymentMethod?: string; // Optional: COD, VNPAY, MOMO
}

export interface OrderHistory {
  orders: OrderSummary[];
}

// Service Functions
export async function getOrderDetail(orderId: number | string): Promise<OrderDetail | null> {
  try {
    const res = await api.get<ApiResponse<OrderDetail>>(
      ApiEndPoint.ORDER_DETAIL(orderId)
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }
    toast.error("Không thể lấy chi tiết đơn hàng");
    return null;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Không thể lấy chi tiết đơn hàng";
    toast.error(message);
    return null;
  }
}

export async function cancelOrder(orderId: number | string): Promise<boolean> {
  try {
    const res = await api.put<ApiResponse<any>>(
      ApiEndPoint.ORDER_CANCEL(orderId)
    );
    if (res?.data?.code === 200) {
      toast.success("Hủy đơn hàng thành công");
      return true;
    }
    toast.error("Không thể hủy đơn hàng");
    return false;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Không thể hủy đơn hàng";
    toast.error(message);
    return false;
  }
}

export async function confirmReceived(orderId: number | string): Promise<boolean> {
  try {
    const res = await api.put<ApiResponse<any>>(
      ApiEndPoint.ORDER_CONFIRM_RECEIVED(orderId)
    );
    if (res?.data?.code === 200) {
      toast.success("Xác nhận đã nhận hàng thành công");
      return true;
    }
    toast.error("Không thể xác nhận đã nhận hàng");
    return false;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Không thể xác nhận đã nhận hàng";
    toast.error(message);
    return false;
  }
}

export async function getPersonalOrderHistory(): Promise<OrderHistory | null> {
  try {
    const res = await api.get<ApiResponse<OrderHistory>>(
      ApiEndPoint.ORDER_HISTORY_PERSONAL
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }
    toast.error("Không thể lấy lịch sử đơn hàng");
    return null;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Không thể lấy lịch sử đơn hàng";
    toast.error(message);
    return null;
  }
}

export async function getSharedOrderHistory(): Promise<OrderHistory | null> {
  try {
    const res = await api.get<ApiResponse<OrderHistory>>(
      ApiEndPoint.ORDER_HISTORY_SHARED
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }
    toast.error("Không thể lấy lịch sử đơn hàng");
    return null;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Không thể lấy lịch sử đơn hàng";
    toast.error(message);
    return null;
  }
}
