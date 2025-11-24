import ApiEndPoint from "@/service/api";
import { api } from "@/service/config-api";
import type { ApiResponse } from "@/types/response-api.type";
import toast from "react-hot-toast";

export type RevenueData = {
  date: string;
  revenue: number;
};
export type OrdersStatus = {
  summary: {
    ordersStatus: {
      totalOrders: number;
      completedOrders: number;
      pendingOrders: number;
      paidOrders: number;
      shippedOrders: number;
    };
  };
};
export type NewUserByDate = {
  date: string;
  newUsers: number;
};
export type OrdersByDate = {
  date: string;
  orders: number;
};

export type TopSellingProduct = {
  productId: number;
  productName: string;
  unitsSold: number;
  revenue: number;
};

export type CategorySales = {
  categoryName: string;
  productsSold: number;
};

export async function getRevenueChart(body: {
  fromDate: string;
  toDate: string;
}) {
  try {
    if (!body) {
      toast.error("không tim thấy ngày bắt đầu , ngày kết thúc");
      return Promise.reject(
        new Error("không tim thấy ngày bắt đầu , ngày kết thúc ")
      );
    }
    const res = await api.post<ApiResponse<RevenueData[]>>(
      `${ApiEndPoint.REVENUE_CHART}`,
      body
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message = res?.data?.message || "lỗi không thể lấy chart revenue";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (e: any) {
    const message = e?.response?.data?.message || "lỗi không thể lấy chart revenue";
    if (e?.response?.status !== 403) {
      toast.error(message);
    }
    return Promise.reject(e);
  }
}
export async function getPieOrderChart(body: {
  fromDate: string;
  toDate: string;
}) {
  try {
    if (!body) {
      toast.error("không tim thấy ngày bắt đầu , ngày kết thúc");
      return Promise.reject(
        new Error("không tim thấy ngày bắt đầu , ngày kết thúc ")
      );
    }
    const res = await api.post<ApiResponse<OrdersStatus>>(
      `${ApiEndPoint.PIE_ORDER_CHART}`,
      body
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message = res?.data?.message || "lỗi không thể lấy Pire order";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (e: any) {
    const message = e?.response?.data?.message || "lỗi không thể lấy Pire order";
    if (e?.response?.status !== 403) {
      toast.error(message);
    }
    return Promise.reject(e);
  }
}
export async function getAreaUserChart(body: {
  fromDate: string;
  toDate: string;
}) {
  try {
    if (!body) {
      toast.error("không tim thấy ngày bắt đầu , ngày kết thúc");
      return Promise.reject(
        new Error("không tim thấy ngày bắt đầu , ngày kết thúc ")
      );
    }
    const res = await api.post<ApiResponse<NewUserByDate[]>>(
      `${ApiEndPoint.AREA_USER_CHART}`,
      body
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message = res?.data?.message || "lỗi không thể lấy Area user";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (e: any) {
    const message = e?.response?.data?.message || "lỗi không thể lấy Area user";
    if (e?.response?.status !== 403) {
      toast.error(message);
    }
    return Promise.reject(e);
  }
}
export async function getAreaOrderChart(body: {
  fromDate: string;
  toDate: string;
}) {
  try {
    if (!body) {
      toast.error("không tim thấy ngày bắt đầu , ngày kết thúc");
      return Promise.reject(
        new Error("không tim thấy ngày bắt đầu , ngày kết thúc ")
      );
    }
    const res = await api.post<ApiResponse<OrdersByDate[]>>(
      `${ApiEndPoint.AREA_ORDER_CHART}`,
      body
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message = res?.data?.message || "lỗi không thể lấy Area order";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (e: any) {
    const message = e?.response?.data?.message || "lỗi không thể lấy Area order";
    if (e?.response?.status !== 403) {
      toast.error(message);
    }
    return Promise.reject(e);
  }
}
export async function getTopProduct() {
  try {
    const res = await api.post<ApiResponse<TopSellingProduct[]>>(
      `${ApiEndPoint.TOP_PRODUCT}`
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message = res?.data?.message || "lỗi không thể lấy top product";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (e: any) {
    const message = e?.response?.data?.message || "lỗi không thể lấy top product";
    if (e?.response?.status !== 403) {
      toast.error(message);
    }
    return Promise.reject(e);
  }
}
export async function getTopCategory() {
  try {
    const res = await api.post<ApiResponse<CategorySales[]>>(
      `${ApiEndPoint.TOP_CATEGORY}`
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message = res?.data?.message || "lỗi không thể lấy top category";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (e: any) {
    const message = e?.response?.data?.message || "lỗi không thể lấy top category";
    if (e?.response?.status !== 403) {
      toast.error(message);
    }
    return Promise.reject(e);
  }
}
