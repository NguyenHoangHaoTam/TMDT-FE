import { api } from "@/service/config-api";
import type { ApiResponse } from "@/types/response-api.type";
import type { Review } from "@/types/review.type";
import toast from "react-hot-toast";
import ReviewEndPoint from "./endpoint";

export interface ReviewWithProduct extends Review {
  productId: number;
  productName: string;
}

export type ReviewsResponse = {
  content: ReviewWithProduct[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export async function getAllReviews(
  page: number = 0,
  size: number = 10,
  sortBy: string = "createdAt",
  sortDir: string = "DESC"
): Promise<ReviewsResponse | null> {
  try {
    const res = await api.get<ApiResponse<ReviewsResponse>>(
      ReviewEndPoint.GET_ALL,
      {
        params: {
          page,
          size,
          sortBy,
          sortDir,
        },
      }
    );
    if (res?.data?.code === 200) {
      return res.data.data || null;
    }

    toast.error("Lỗi không thể lấy danh sách đánh giá");
    return null;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Lỗi không thể lấy danh sách đánh giá";
    toast.error(message);
    console.error("Lỗi khi lấy danh sách đánh giá:", error);
    return null;
  }
}

export async function deleteReview(
  id: number
): Promise<{ message: string } | null> {
  try {
    const res = await api.put<ApiResponse<{ message: string }>>(
      ReviewEndPoint.ADMIN_ACTION,
      {
        reviewId: id,
        action: "DELETE",
      }
    );
    if (res?.data?.code === 200) {
      return res.data.data || null;
    }

    toast.error("Lỗi không thể xóa đánh giá");
    return null;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Lỗi không thể xóa đánh giá";
    toast.error(message);
    console.error("Lỗi khi xóa đánh giá:", error);
    return null;
  }
}

