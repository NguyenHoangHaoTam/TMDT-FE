import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
import LoadingBtn from "@/components/common/loading-btn";
import type { CouponDTO, CouponPageResponse } from "@/types/coupon.type";

type CouponTableProps = {
  data?: CouponPageResponse;
  isLoading?: boolean;
  onEdit: (coupon: CouponDTO) => void;
  onDelete: (coupon: CouponDTO) => Promise<unknown>;
  isDeleting?: boolean;
};

type CouponStatus = "ACTIVE" | "UPCOMING" | "EXPIRED" | "USED_UP";

const statusConfig: Record<
  CouponStatus,
  { label: string; badgeClass: string; description: string }
> = {
  ACTIVE: {
    label: "Đang chạy",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "Trong thời gian hiệu lực",
  },
  UPCOMING: {
    label: "Sắp diễn ra",
    badgeClass: "bg-blue-100 text-blue-700",
    description: "Chưa tới ngày bắt đầu",
  },
  EXPIRED: {
    label: "Hết hạn",
    badgeClass: "bg-gray-200 text-gray-600",
    description: "Đã quá thời gian áp dụng",
  },
  USED_UP: {
    label: "Hết lượt",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "Đã đạt giới hạn lượt dùng",
  },
};

function formatDate(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatus(coupon: CouponDTO): CouponStatus {
  if (coupon.usedCount >= coupon.usageLimit) {
    return "USED_UP";
  }
  const now = new Date();
  const start = new Date(coupon.validFrom);
  const end = new Date(coupon.validTo);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "EXPIRED";
  }

  if (now < start) {
    return "UPCOMING";
  }

  if (now > end) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

export default function CouponTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  isDeleting,
}: CouponTableProps) {
  const [selectedCoupon, setSelectedCoupon] = useState<CouponDTO | null>(null);
  const coupons = data?.content ?? [];

  const summary = useMemo(() => {
    return coupons.reduce(
      (acc, coupon) => {
        const status = getStatus(coupon);
        acc[status] += 1;
        return acc;
      },
      { ACTIVE: 0, UPCOMING: 0, EXPIRED: 0, USED_UP: 0 } as Record<
        CouponStatus,
        number
      >
    );
  }, [coupons]);

  const handleConfirmDelete = async () => {
    if (!selectedCoupon) return;
    try {
      await onDelete(selectedCoupon);
      setSelectedCoupon(null);
    } catch (error) {
      // keep dialog open so user can retry or cancel
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {(["ACTIVE", "UPCOMING", "USED_UP", "EXPIRED"] as CouponStatus[]).map(
          (status) => (
            <div
              key={status}
              className="min-w-[140px] rounded-xl border bg-card px-4 py-3"
            >
              <p className="text-xs text-muted-foreground">
                {statusConfig[status].label}
              </p>
              <p className="text-2xl font-semibold">{summary[status] ?? 0}</p>
            </div>
          )
        )}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full border-collapse">
          <thead className="bg-muted/60">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">Mã</th>
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium">Hình thức</th>
              <th className="px-4 py-3 font-medium">Sử dụng</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-t">
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-2 w-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Skeleton className="ml-auto h-8 w-20" />
                  </td>
                </tr>
              ))}

            {!isLoading && coupons.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Chưa có mã giảm giá nào, hãy tạo mới ngay nhé.
                </td>
              </tr>
            )}

            {!isLoading &&
              coupons.map((coupon) => {
                const status = getStatus(coupon);
                return (
                  <tr key={coupon.id} className="border-t text-sm">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{coupon.code}</div>
                      <p className="text-xs text-muted-foreground">
                        {coupon.description || "Không có mô tả"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">
                        Bắt đầu: {formatDate(coupon.validFrom)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Kết thúc: {formatDate(coupon.validTo)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="mb-1">
                        {coupon.isPercent
                          ? `${coupon.discountValue}%`
                          : `${coupon.discountValue.toLocaleString("vi-VN")} ₫`}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {coupon.isPercent
                          ? "Giảm theo phần trăm"
                          : "Giảm theo số tiền"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>{coupon.usedCount}</span>
                        <span>{coupon.usageLimit}</span>
                      </div>
                      <Progress
                        value={
                          coupon.usageLimit === 0
                            ? 0
                            : (coupon.usedCount / coupon.usageLimit) * 100
                        }
                        className="mt-1 h-2"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusConfig[status].badgeClass}>
                        {statusConfig[status].label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {statusConfig[status].description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setSelectedCoupon(coupon)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={Boolean(selectedCoupon)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCoupon(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa mã{" "}
              <strong>{selectedCoupon?.code}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <LoadingBtn />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

