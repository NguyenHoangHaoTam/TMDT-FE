import type { ApiResponse } from "@/types/response-api.type";
import ReviewEndPoint from "./endpoint";
import { api } from "../config-api";
import type {
  ReviewCreateRequest,
  ReviewCreateResponse,
  ProductReviewListResponse,
} from "@/types/review.type";
import toast from "react-hot-toast";

export async function createReview(
  payload: ReviewCreateRequest
): Promise<ReviewCreateResponse | null> {
  try {
    const res = await api.post<ApiResponse<ReviewCreateResponse>>(
      ReviewEndPoint.CREATE,
      payload
    );
    if (res?.data?.code === 200) {
      toast.success(res.data.message || "Đánh giá đã được gửi thành công!");
      return res.data.data || null;
    }
    toast.error(res.data?.message || "Không thể gửi đánh giá");
    return null;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Không thể gửi đánh giá";
    toast.error(message);
    console.error("Lỗi khi tạo đánh giá:", error);
    return null;
  }
}

export async function getProductReviews(
  productId: number | string
): Promise<ProductReviewListResponse | null> {
  try {
    const res = await api.get<ApiResponse<ProductReviewListResponse>>(
      ReviewEndPoint.GET_BY_PRODUCT(productId)
    );
    if (res?.data?.code === 200) {
      return res.data.data || null;
    }
    return null;
  } catch (error: any) {
    // Log chi tiết lỗi để debug
    if (error?.response?.status === 404) {
      console.warn(
        "API review chưa được implement trên backend:",
        ReviewEndPoint.GET_BY_PRODUCT(productId)
      );
    } else {
      console.error("Lỗi khi lấy danh sách đánh giá:", {
        message: error?.response?.data?.message,
        status: error?.response?.status,
        endpoint: ReviewEndPoint.GET_BY_PRODUCT(productId),
        error: error?.response?.data,
      });
    }
    return null;
  }
}

