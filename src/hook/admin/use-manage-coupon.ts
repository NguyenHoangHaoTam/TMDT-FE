import CouponManageKeys from "@/service/admin/coupon/endpoint";
import {
  createCoupon as createCouponRequest,
  deleteCoupon as deleteCouponRequest,
  fetchAdminCoupons,
  updateCoupon as updateCouponRequest,
} from "@/service/admin/coupon/service";
import type { CouponFormValues, CouponListParams } from "@/types/coupon.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useManageCoupons(filters: CouponListParams) {
  const queryClient = useQueryClient();

  const couponsQuery = useQuery({
    queryKey: [CouponManageKeys.LIST, filters],
    queryFn: () => fetchAdminCoupons(filters),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const createMutation = useMutation({
    mutationKey: [CouponManageKeys.CREATE],
    mutationFn: (values: CouponFormValues) => createCouponRequest(values),
    onSuccess: () => {
      toast.success("Tạo mã giảm giá thành công");
      queryClient.invalidateQueries({ queryKey: [CouponManageKeys.LIST] });
    },
  });

  const updateMutation = useMutation({
    mutationKey: [CouponManageKeys.UPDATE],
    mutationFn: ({ id, values }: { id: number; values: CouponFormValues }) =>
      updateCouponRequest(id, values),
    onSuccess: () => {
      toast.success("Cập nhật mã giảm giá thành công");
      queryClient.invalidateQueries({ queryKey: [CouponManageKeys.LIST] });
    },
  });

  const deleteMutation = useMutation({
    mutationKey: [CouponManageKeys.DELETE],
    mutationFn: (id: number) => deleteCouponRequest(id),
    onSuccess: () => {
      toast.success("Xóa mã giảm giá thành công");
      queryClient.invalidateQueries({ queryKey: [CouponManageKeys.LIST] });
    },
  });

  return {
    coupons: couponsQuery.data,
    isLoading: couponsQuery.isPending,
    refetchCoupons: couponsQuery.refetch,
    createCoupon: createMutation.mutateAsync,
    updateCoupon: (id: number, values: CouponFormValues) =>
      updateMutation.mutateAsync({ id, values }),
    deleteCoupon: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

