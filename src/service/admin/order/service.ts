import ApiEndPoint from "@/service/api";
import { api } from "@/service/config-api";
import type { ApiResponse } from "@/types/response-api.type";
import toast from "react-hot-toast";

export type OrderItem = {
  id: number;
  totalAmount: number;
  status: "PAID" | "PENDING" | "SHIPPED" | "COMPLETED" | "CANCELLED"; // nếu còn trạng thái khác thì thêm vào
  orderType: "SINGLE" | "SHARED_CART";
  firstProductThumbnail: string;
  createdAt: string; // hoặc Date nếu bạn convert
  paymentMethod?: string; // COD, VNPAY, MOMO
};

// Raw response type từ backend (có thể có payment object)
type RawOrderItem = {
  id: number;
  totalAmount: number;
  status: "PAID" | "PENDING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  orderType: "SINGLE" | "SHARED_CART";
  firstProductThumbnail: string;
  createdAt: string;
  paymentMethod?: string; // Có thể có trực tiếp
  payment?: {
    paymentMethod?: string; // Hoặc nằm trong payment object
  };
};

type RawOrdersResponse = {
  content: RawOrderItem[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type OrdersResponse = {
  content: OrderItem[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

// Helper function để map raw order sang OrderItem
function mapRawOrderToOrderItem(rawOrder: RawOrderItem): OrderItem {
  return {
    id: rawOrder.id,
    totalAmount: rawOrder.totalAmount,
    status: rawOrder.status,
    orderType: rawOrder.orderType,
    firstProductThumbnail: rawOrder.firstProductThumbnail,
    createdAt: rawOrder.createdAt,
    // Ưu tiên paymentMethod trực tiếp, nếu không có thì lấy từ payment.paymentMethod
    paymentMethod: rawOrder.paymentMethod || rawOrder.payment?.paymentMethod,
  };
}

export async function getAllOrder() {
  try {
    const res = await api.get<ApiResponse<RawOrdersResponse>>(
      `${ApiEndPoint.GET_ORDER}`
    );
    if (res?.data?.code === 200) {
      // Map raw response sang OrderItem với paymentMethod được extract đúng cách
      const rawData = res.data.data;
      return {
        ...rawData,
        content: rawData.content.map(mapRawOrderToOrderItem),
      };
    }

    toast.error("lỗi không thể lấy danh sách đơn hàng ");
    return Promise.reject(new Error("lỗi không thể lấy danh sách đơn hàng "));
  } catch (e) {
    toast.error("lỗi không thể lấy danh sách đơn hàng ");

    return Promise.reject(e);
  }
}
export async function updateStatusOrder(id: number) {
  try {
    const res = await api.put<ApiResponse<string>>(
      `${ApiEndPoint.EDIT_STATUS_ORDER}/${id}/status`,
      {
        status: "SHIPPED",
      }
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    toast.error("lỗi không thể thay đổi trạng thái đơn hàng ");
    return Promise.reject(
      new Error("lỗi không thể thay đổi trạng thái đơn hàng ")
    );
  } catch (e) {
    toast.error("lỗi không thể thay đổi trạng thái đơn hàng ");

    return Promise.reject(e);
  }
}
