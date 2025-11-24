import type {
  ResponseLogin,
  ResponseRegister,
  TPayLoadLogin,
  TPayLoadRegister,
} from "@/types/auth.type";
import type { ApiResponse } from "@/types/response-api.type";
import { publicApi, api } from "../config-api";
import ApiEndPoint from "../api";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/use-auth.store";




// Hàm xóa cookie cũ (nếu có)
function clearCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
}

export async function Login({ username, password }: TPayLoadLogin) {
  try {
    if (!username || !password) {
      toast.error("Login missing information");
      return Promise.reject(new Error("Login missing information"));
    }

    // Xóa cookie cũ trước khi login để tránh xung đột
    clearCookie("refresh_token");

    const body = {
      username: username,
      password: password,
    };

    // Log request info without sensitive data

    const res = await publicApi.post<ApiResponse<ResponseLogin>>(
      `${ApiEndPoint.LOGIN}`,
      body,
      {
        withCredentials: true,
      }
    );

    // Log response without sensitive data

    if (res?.data?.code === 200) {
      return res.data.data;
    }

    toast.error(res?.data?.message || "Error: Login error");
    return Promise.reject(new Error(res?.data?.message || "Error: Login error"));
  } catch (e: any) {
    console.error("Login error:", e);
    console.error("Error response:", e?.response?.data);
    console.error("Error status:", e?.response?.status);
    console.error("Error message:", e?.message);
    
    const errorMessage = 
      e?.response?.data?.message || 
      e?.response?.status === 403 
        ? "Không có quyền truy cập. Vui lòng kiểm tra lại cấu hình CORS hoặc endpoint."
        : e?.response?.status === 401
        ? "Sai tên đăng nhập hoặc mật khẩu"
        : e?.message || "Đăng nhập thất bại";
    
    toast.error(errorMessage);
    return Promise.reject(e);
  }
}

export async function register(body: TPayLoadRegister) {
  try {
    if (!body) {
      toast.error("REGISTER missing information");
      return Promise.reject(new Error("REGISTER missing information"));
    }

    if (body.password !== body.rePassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return Promise.reject(new Error("Mật khẩu nhập lại không khớp"));
    }

    const res = await publicApi.post<ApiResponse<ResponseRegister>>(
      `${ApiEndPoint.REGISTER}`,
      body,
      {
        withCredentials: true,
      }
    );

    if (res?.data?.code === 200) {
      toast.success("Đăng ký thành công");
      return res.data.data;
    }

    toast.error("đăng ký thất bại");
    return Promise.reject(new Error("đăng ký thất bại"));
  } catch (e) {
    toast.error("Đăng ký thất bại");

    return Promise.reject(e);
  }
}

export async function forgotPassword({ email }: { email?: string }) {
  try {
    if (!email) {
      toast.error("Chưa nhập email");
      return Promise.reject(new Error("Lỗi chưa nhaaoj email"));
    }
    const res = await publicApi.post<ApiResponse<ResponseRegister>>(
      `${ApiEndPoint.FORGOT_PASSWORD}`,
      email
    );
    if (res?.data?.code === 200) {
      toast.success("Gửi email thành công");
      return res.data.data;
    }

    toast.error("lỗi ");
    return Promise.reject(new Error("lỗi"));
  } catch (e) {
    toast.error("thất bại");

    return Promise.reject(e);
  }
}

export async function logout(token: string | null, refreshToken: string | null = null) {
  
  try {
    if (token) {
      try {
        await api.post<ApiResponse<string>>(
          `${ApiEndPoint.LOGOUT}`,
          { 
            token,
            refreshToken: refreshToken || null
          },
          { withCredentials: true }
        );
      } catch (e: any) {
        // Nếu API logout thất bại, vẫn tiếp tục xóa token ở frontend
        console.warn("Logout API error:", e);
      }
    }
    
    // Xóa cookie một lần nữa sau khi gọi API (để đảm bảo)
    clearCookie("refresh_token");
    
    return true;
  } catch (e) {
    console.error("Logout error:", e);
    // Vẫn xóa cookie ngay cả khi có lỗi
    clearCookie("refresh_token");
    return false;
  }
}
