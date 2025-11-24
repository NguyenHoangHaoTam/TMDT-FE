import { useEffect, useMemo, useState } from "react";
import { Search, TicketPercent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useManageCoupons } from "@/hook/admin/use-manage-coupon";
import CouponTable from "../components/coupon/coupon-table";
import CouponForm from "../components/coupon/coupon-form";
import Pagination from "../components/pagination";
import type {
  CouponDTO,
  CouponFormValues,
  CouponStatusFilter,
} from "@/types/coupon.type";

type StatusFilter = "ALL" | CouponStatusFilter;

const statusFilters: { label: string; value: StatusFilter }[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Đang chạy", value: "ACTIVE" },
  { label: "Sắp diễn ra", value: "UPCOMING" },
  { label: "Hết lượt", value: "USED_UP" as StatusFilter },
  { label: "Hết hạn", value: "EXPIRED" },
];

export default function CouponManagementPage() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponDTO | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const filters = useMemo(
    () => ({
      page: currentPage - 1,
      size: pageSize,
      search: debouncedSearch || undefined,
      status:
        statusFilter === "ALL" || statusFilter === "USED_UP"
          ? undefined
          : (statusFilter as CouponStatusFilter),
    }),
    [currentPage, pageSize, debouncedSearch, statusFilter]
  );

  const {
    coupons,
    isLoading,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    isCreating,
    isUpdating,
    isDeleting,
  } = useManageCoupons(filters);

  const tableData = useMemo(() => {
    if (!coupons) return undefined;
    if (statusFilter !== "USED_UP") return coupons;
    return {
      ...coupons,
      content: coupons.content.filter(
        (coupon) => coupon.usedCount >= coupon.usageLimit
      ),
    };
  }, [coupons, statusFilter]);

  const totalPages = Math.max(coupons?.totalPages ?? 1, 1);
  const isFormSubmitting = isCreating || isUpdating;

  const handleOpenForm = (coupon?: CouponDTO | null) => {
    setEditingCoupon(coupon ?? null);
    setIsFormOpen(true);
  };

  const handleCreateCoupon = async (values: CouponFormValues) => {
    try {
      await createCoupon(values);
      setIsFormOpen(false);
    } catch (error) {
      // toast handled inside hook/service
    }
  };

  const handleUpdateCoupon = async (id: number, values: CouponFormValues) => {
    try {
      await updateCoupon(id, values);
      setIsFormOpen(false);
    } catch (error) {
      // toast handled inside hook/service
    }
  };

  const handleDeleteCoupon = async (coupon: CouponDTO) => {
    await deleteCoupon(coupon.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <TicketPercent className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium uppercase tracking-wide">
              Quản lý khuyến mại
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Mã giảm giá
          </h1>
          <p className="text-sm text-muted-foreground">
            Tạo, theo dõi và tối ưu các chiến dịch khuyến mãi.
          </p>
        </div>
        <Button onClick={() => handleOpenForm(null)}>Tạo mã mới</Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Tìm kiếm theo mã hoặc mô tả..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === filter.value
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <CouponTable
          data={tableData}
          isLoading={isLoading}
          onEdit={(coupon) => handleOpenForm(coupon)}
          onDelete={handleDeleteCoupon}
          isDeleting={isDeleting}
        />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </Card>

      <CouponForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        coupon={editingCoupon}
        onCreate={handleCreateCoupon}
        onUpdate={handleUpdateCoupon}
        isSubmitting={isFormSubmitting}
      />
    </div>
  );
}

