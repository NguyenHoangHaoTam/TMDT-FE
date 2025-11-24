import UserManageKeys from "@/service/admin/user/endpoint";
import {
  blockUsers,
  getAllUsers,
  unBlockUsers,
} from "@/service/admin/user/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useUserManager() {
  const queryClient = useQueryClient();
  const { data: users } = useQuery({
    queryKey: [UserManageKeys.GET_USERS],
    queryFn: () => getAllUsers(),
    refetchOnWindowFocus: false,
  });
  const { mutate: blockUser, isPending: isPendingBlock } = useMutation({
    mutationKey: [UserManageKeys.BLOCK_USER],
    mutationFn: (id: number) => blockUsers({ id }),
    onSuccess: () => {
      toast.success("Khóa người dùng thành công");

      queryClient.invalidateQueries({
        queryKey: [UserManageKeys.GET_USERS],
      });
    },
  });
  const { mutate: unblockUser, isPending: isPendingUnBlock } = useMutation({
    mutationKey: [UserManageKeys.UNBLOCK_USER],
    mutationFn: (id: number) => unBlockUsers({ id }),
    onSuccess: () => {
      toast.success("Mở khóa người dùng thành công");
      queryClient.invalidateQueries({
        queryKey: [UserManageKeys.GET_USERS],
      });
    },
  });

  return { users, blockUser, isPendingBlock, unblockUser, isPendingUnBlock };
}
