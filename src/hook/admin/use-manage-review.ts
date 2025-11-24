import { ReviewManageKeys } from "@/service/admin/review/endpoint";
import { getAllReviews, deleteReview } from "@/service/admin/review/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useManageReview() {
  const queryClient = useQueryClient();

  const { data: allReviews, isPending } = useQuery({
    queryKey: [ReviewManageKeys.GET_ALL_REVIEWS],
    queryFn: () => getAllReviews(0, 100), // Lấy 100 reviews đầu tiên
    refetchOnWindowFocus: false,
  });

  const { mutate: deleteReviewFn, isPending: isPendingDelete } = useMutation({
    mutationKey: [ReviewManageKeys.DELETE_REVIEW],
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ReviewManageKeys.GET_ALL_REVIEWS],
      });
      toast.success("Xóa đánh giá thành công");
    },
    onError: () => {
      toast.error("Xóa đánh giá thất bại");
    },
  });

  return {
    allReviews,
    isPending,
    deleteReviewFn,
    isPendingDelete,
  };
}

