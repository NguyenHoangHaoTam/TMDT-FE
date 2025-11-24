import ApiEndPoint from "@/service/api";
import { api } from "@/service/config-api";
import type { ApiResponse } from "@/types/response-api.type";
import type { User } from "@/types/user";
import toast from "react-hot-toast";
export async function getAllUsers() {
  try {
    const res = await api.get<ApiResponse<User[]>>(`${ApiEndPoint.USERS}`);
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    toast.error(res?.data?.message || "lỗi không thể lấy danh sach user ");
    return Promise.reject(new Error("lỗi không thể lấy  danh sach user "));
  } catch (e) {
    toast.error("lỗi không thể lấy danh sach user ");

    return Promise.reject(e);
  }
}
export async function blockUsers({ id }: { id: number }) {
  try {
    if (!id) {
      return Promise.reject(new Error("ID không hợp lệ"));
    }
    const res = await api.put<ApiResponse<string>>(
      `${ApiEndPoint.USERS}/${id}/block`
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    toast.error(res?.data?.message || "lỗi không thể chặn người dùng ");
    return Promise.reject(new Error("lỗi không thể chặn người dùng"));
  } catch (e) {
    toast.error("lỗi không thể chặn người dùng ");

    return Promise.reject(e);
  }
}
export async function unBlockUsers({ id }: { id: number }) {
  try {
    if (!id) {
      return Promise.reject(new Error("ID không hợp lệ"));
    }
    const res = await api.put<ApiResponse<string>>(
      `${ApiEndPoint.USERS}/${id}/unblock`
    );
    if (res?.data?.code === 200) {
      return res.data.data;
    }

    toast.error(res?.data?.message || "lỗi không thể bỏ chặn người dùng ");
    return Promise.reject(new Error("lỗi không thể bỏ chặn người dùng"));
  } catch (e) {
    toast.error("lỗi không thể bỏ chặn người dùng ");

    return Promise.reject(e);
  }
}
