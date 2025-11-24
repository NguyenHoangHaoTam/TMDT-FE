import { Trash2, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReviewWithProduct } from "@/service/admin/review/service";
import { useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { format } from "date-fns";

interface ReviewTableProps {
  reviews?: ReviewWithProduct[];
  onDelete: (id: number) => void;
  searchTerm?: string;
  isPendingDelete?: boolean;
}

export default function ReviewTable({
  reviews,
  onDelete,
  searchTerm = "",
  isPendingDelete = false,
}: Readonly<ReviewTableProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    if (!searchTerm.trim()) return reviews;

    const searchLower = searchTerm.toLowerCase().trim();
    return reviews.filter((review) => {
      const userNameMatch = review.userName?.toLowerCase().includes(searchLower);
      const commentMatch = review.comment?.toLowerCase().includes(searchLower);
      const productNameMatch = review.productName?.toLowerCase().includes(searchLower);

      return userNameMatch || commentMatch || productNameMatch;
    });
  }, [reviews, searchTerm]);

  const handleDeleteClick = (id: number) => {
    setSelectedReviewId(id);
    setIsOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedReviewId) {
      onDelete(selectedReviewId);
      setIsOpen(false);
      setSelectedReviewId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating}/5
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <div className="space-y-3">
        {filteredReviews.length === 0 || !filteredReviews ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              {reviews?.length === 0
                ? "Không có đánh giá nào"
                : "Không tìm thấy đánh giá phù hợp"}
            </p>
            <p className="text-slate-400 text-sm">
              {reviews?.length === 0
                ? "Chưa có đánh giá nào từ khách hàng"
                : "Thử tìm kiếm với từ khóa khác"}
            </p>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
            <div className="overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Người đánh giá
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Đánh giá
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Bình luận
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                      Hành động
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredReviews.map((review) => (
                    <tr
                      key={review.id}
                      className="hover:bg-emerald-50 transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {review.userName || `User #${review.userId}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {review.userId}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <p className="font-medium text-slate-900">
                            {review.productName || `Sản phẩm #${review.productId}`}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {review.productId}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {renderStars(review.rating)}
                      </td>

                      <td className="px-6 py-4 max-w-md">
                        <p className="text-sm text-slate-700 line-clamp-2">
                          {review.comment || (
                            <span className="text-slate-400 italic">
                              Không có bình luận
                            </span>
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">
                          {formatDate(review.createdAt)}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(review.id)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all text-slate-600"
                          title="Xóa"
                          disabled={isPendingDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPendingDelete}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPendingDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPendingDelete ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

