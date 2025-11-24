import AuthKeys from "@/service/auth/endpoint";
import { forgotPassword, Login, logout, register } from "@/service/auth/service";
import { useAuthStore } from "@/store/use-auth.store";
import type { ResponseLogin, TPayLoadLogin } from "@/types/auth.type";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "@/service/config-api";

interface DecodedToken {
  sub: string;
  scope: string;
  iss: string;
  exp: number;
  iat: number;
  type: string;
  jti: string;
}

export function useLogin() {
  const { setToken, setRefreshToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  const { mutateAsync: login, isPending } = useMutation<
    ResponseLogin,
    Error,
    TPayLoadLogin
  >({
    mutationKey: [AuthKeys.LOGIN],
    mutationFn: Login,
    onSuccess: async (data) => {
      if (!data) return;

      setToken(data?.token);
      setRefreshToken(data?.refreshToken);

      const decoded: DecodedToken = jwtDecode(data.token);
      // Nếu user là admin, yêu cầu đăng nhập qua trang admin
      if (decoded?.scope && decoded.scope.includes("ROLE_ADMIN")) {
        toast.error("Vui lòng đăng nhập qua trang admin tại /admin/login");
        return;
      }

      try {
        const res = await api.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        const userData = res.data?.data;
        if (userData) {
          setUser({
            id: userData.id,
            // Ưu tiên fullName, sau đó name, cuối cùng mới username
            name: userData.fullName || userData.name || userData.username,
            email: userData.email,
          });
        }
      } catch {
        console.warn("Không thể lấy thông tin người dùng từ /api/users/me");
      }

      try {
      } catch {}
      navigate("/");

      toast.success("Đăng nhập thành công");
    },
    onError: () => {
      toast.error("Đăng nhập thất bại, vui lòng thử lại!");
    },
  });

  return { login, isPending };
}

export function useRegister() {
  const navigate = useNavigate();

  const { mutate: handleRegister, isPending } = useMutation({
    mutationKey: [AuthKeys.REGISTER],
    mutationFn: register,
    onSuccess: () => {
      toast.success("Đăng ký thành công");
      navigate("/login");
    },
    onError: () => {
      toast.error("Đăng ký thất bại");
    },
  });

  return { handleRegister, isPending };
}

export function useForgotPassword() {
  const navigate = useNavigate();

  const { mutate: handleForgotPass, isPending } = useMutation({
    mutationKey: [AuthKeys.FORGOT_PASSWORD],
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("Đã gửi email đặt lại mật khẩu");
      navigate("/login");
    },
    onError: () => {
      toast.error("Gửi yêu cầu thất bại");
    },
  });

  return { handleForgotPass, isPending };
}
export function useLogout() {
  const { token, refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const { mutate: handleLogout, isPending } = useMutation({
    mutationKey: [AuthKeys.LOG_OUT],
    mutationFn: ()=>logout(token, refreshToken),
    onSuccess: () => {
      toast.success("Đăng xuất thành công");
      clearAuth();
      navigate("/login");
    },
  });

  return { handleLogout, isPending };
}


