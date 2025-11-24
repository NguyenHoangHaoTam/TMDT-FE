import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import ReviewTable from "../components/review/review-table";
import { useManageReview } from "@/hook/admin/use-manage-review";

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { allReviews, isPending, deleteReviewFn, isPendingDelete } =
    useManageReview();

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Quản Lý Đánh Giá</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý và theo dõi các đánh giá từ khách hàng
            </p>
          </div>
        </div>

        {/* Stats */}
        {!isPending && allReviews && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                  <p className="text-2xl font-bold">
                    {allReviews.totalElements || 0}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-emerald-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đánh giá hiển thị</p>
                  <p className="text-2xl font-bold">
                    {allReviews.content?.length || 0}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trang hiện tại</p>
                  <p className="text-2xl font-bold">
                    {allReviews.number !== undefined ? allReviews.number + 1 : 1} / {allReviews.totalPages || 1}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên người dùng, sản phẩm hoặc bình luận..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Review Table */}
        <Card className="border-0 py-0">
          {isPending ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Đang tải đánh giá...</p>
              </div>
            </div>
          ) : (
            <ReviewTable
              reviews={allReviews?.content}
              onDelete={deleteReviewFn}
              searchTerm={searchTerm}
              isPendingDelete={isPendingDelete}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

