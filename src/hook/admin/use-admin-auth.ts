import AuthKeys from "@/service/auth/endpoint";
import { Login } from "@/service/auth/service";
import { useAdminAuthStore } from "@/store/use-admin-auth.store";
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

export function useAdminLogin() {
  const { setToken, setRefreshToken, setAdmin } = useAdminAuthStore();
  const navigate = useNavigate();

  const { mutateAsync: login, isPending } = useMutation<
    ResponseLogin,
    Error,
    TPayLoadLogin
  >({
    mutationKey: [AuthKeys.LOGIN, "admin"],
    mutationFn: Login,
    onSuccess: async (data) => {
      if (!data) return;

      const decoded: DecodedToken = jwtDecode(data.token);
      
      // Kiểm tra nếu user không phải admin thì từ chối
      if (!decoded?.scope || !decoded.scope.includes("ROLE_ADMIN")) {
        toast.error("Tài khoản này không có quyền truy cập admin");
        return;
      }

      setToken(data?.token);
      setRefreshToken(data?.refreshToken);

      // Lấy thông tin admin từ API
      // Đảm bảo dùng admin token bằng cách set header trực tiếp
      try {
        const res = await api.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        });
        const userData = res.data?.data;
        if (userData) {
          setAdmin({
            id: userData.id,
            // Ưu tiên fullName, sau đó name, cuối cùng mới username
            name: userData.fullName || userData.name || userData.username || "Admin",
            email: userData.email || "",
          });
        }
      } catch (error) {
        console.warn("Không thể lấy thông tin admin từ /api/users/me", error);
        // Nếu không lấy được từ API, dùng thông tin từ token
        if (decoded?.sub) {
          setAdmin({
            id: decoded.sub,
            name: decoded.sub,
            email: "",
          });
        }
      }

      navigate("/admin");
      toast.success("Đăng nhập admin thành công");
    },
    onError: () => {
      toast.error("Đăng nhập thất bại, vui lòng thử lại!");
    },
  });

  return { login, isPending };
}

