import OrderManageKeys from "@/service/admin/order/endpoint";
import { getAllOrder, updateStatusOrder } from "@/service/admin/order/service";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useManageOrder(
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const queryClient = useQueryClient();

  const { data: allOrder, isPending } = useQuery({
    queryKey: [OrderManageKeys.GET_ORDER],
    queryFn: () => getAllOrder(),
  });
  const { mutate: editStatusOrder, isPending: isPendingEdit } = useMutation({
    mutationKey: [OrderManageKeys.GET_ORDER],
    mutationFn: (id: number) => updateStatusOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [OrderManageKeys.GET_ORDER],
      });
      toast.success("Cập nhật trạng thái đơn hàng thành công");
      setIsOpen?.(false);
    },
  });

  return { allOrder, isPending, editStatusOrder, isPendingEdit };
}
