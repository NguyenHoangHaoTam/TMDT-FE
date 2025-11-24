import ApiEndPoint from "@/service/api";
import { api } from "@/service/config-api";
import type { ApiResponse } from "@/types/response-api.type";
import type {
  CouponCreateResponse,
  CouponDTO,
  CouponFormValues,
  CouponListParams,
  CouponPageResponse,
} from "@/types/coupon.type";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

const DEFAULT_PAGE_SIZE = 10;

function toIsoString(value: string) {
  if (!value) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

function normalizePayload(values: CouponFormValues) {
  return {
    code: values.code.trim().toUpperCase(),
    description: values.description?.trim() ?? "",
    validFrom: toIsoString(values.validFrom),
    validTo: toIsoString(values.validTo),
    discountValue: Number(values.discountValue),
    isPercent: values.isPercent,
    usageLimit: Number(values.usageLimit),
  };
}

export async function fetchAdminCoupons(params: CouponListParams = {}) {
  const { page, size, search, status } = params;
  const queryParams: Record<string, string | number> = {
    page: page ?? 0,
    size: size ?? DEFAULT_PAGE_SIZE,
  };

  if (search && search.trim().length > 0) {
    queryParams.search = search.trim();
  }

  if (status) {
    queryParams.status = status;
  }

  try {
    const res = await api.get<ApiResponse<CouponPageResponse>>(
      ApiEndPoint.ADMIN_COUPONS,
      { params: queryParams }
    );

    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message =
      res?.data?.message || "Không thể lấy danh sách mã giảm giá";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message || "Không thể lấy danh sách mã giảm giá"
      : "Không thể lấy danh sách mã giảm giá";
    toast.error(message);
    return Promise.reject(error);
  }
}

export async function createCoupon(values: CouponFormValues) {
  try {
    const res = await api.post<ApiResponse<CouponCreateResponse>>(
      ApiEndPoint.COUPON_CREATE,
      normalizePayload(values)
    );

    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message =
      res?.data?.message || "Không thể tạo mã giảm giá, vui lòng thử lại";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message ||
        "Không thể tạo mã giảm giá, vui lòng thử lại"
      : "Không thể tạo mã giảm giá, vui lòng thử lại";
    toast.error(message);
    return Promise.reject(error);
  }
}

export async function updateCoupon(id: number, values: CouponFormValues) {
  try {
    const res = await api.put<ApiResponse<CouponDTO>>(
      ApiEndPoint.COUPON_UPDATE(id),
      normalizePayload(values)
    );

    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message =
      res?.data?.message || "Không thể cập nhật mã giảm giá, vui lòng thử lại";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message ||
        "Không thể cập nhật mã giảm giá, vui lòng thử lại"
      : "Không thể cập nhật mã giảm giá, vui lòng thử lại";
    toast.error(message);
    return Promise.reject(error);
  }
}

export async function deleteCoupon(id: number) {
  try {
    const res = await api.delete<ApiResponse<string>>(
      ApiEndPoint.COUPON_DELETE(id)
    );

    if (res?.data?.code === 200) {
      return res.data.data;
    }

    const message =
      res?.data?.message || "Không thể xóa mã giảm giá, vui lòng thử lại";
    toast.error(message);
    return Promise.reject(new Error(message));
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message ||
        "Không thể xóa mã giảm giá, vui lòng thử lại"
      : "Không thể xóa mã giảm giá, vui lòng thử lại";
    toast.error(message);
    return Promise.reject(error);
  }
}

