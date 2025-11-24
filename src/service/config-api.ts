import axios from "axios";
import ApiEndPoint from "./api";
import { useAuthStore } from "@/store/use-auth.store";
import { useAdminAuthStore } from "@/store/use-admin-auth.store";

// In development, use backend URL directly or Vite proxy
// In production, use VITE_API_PUBLIC if set
const API_PUBLIC = import.meta.env.VITE_API_PUBLIC || 
  (import.meta.env.DEV ? "http://localhost:8080" : "");

export const publicApi = axios.create({
  baseURL: API_PUBLIC,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const api = axios.create({
  baseURL: API_PUBLIC,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Xác định route hiện tại để chọn đúng token
    const currentPath = window.location.pathname;
    const isAdminPath = currentPath.startsWith("/admin");
    
    const adminToken = useAdminAuthStore.getState().token;
    const userToken = useAuthStore.getState().token;
    
    // Logic chọn token:
    // 1. Nếu đang ở route admin (kể cả /admin/login) và có admin token → dùng admin token
    // 2. Nếu không phải route admin → dùng user token
    // 3. Nếu đang ở route admin nhưng không có admin token → dùng user token (fallback)
    let token: string | null = null;
    if (isAdminPath && adminToken) {
      token = adminToken;
    } else if (!isAdminPath && userToken) {
      token = userToken;
    } else if (isAdminPath && !adminToken && userToken) {
      // Fallback: nếu ở admin route nhưng chưa có admin token, dùng user token
      token = userToken;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Xác định route hiện tại để chọn đúng token
      const currentPath = window.location.pathname;
      const isAdminRoute = currentPath.startsWith("/admin") && currentPath !== "/admin/login";
      
      const adminToken = useAdminAuthStore.getState().token;
      const userToken = useAuthStore.getState().token;
      const isAdmin = isAdminRoute && !!adminToken;

      try {
        const refreshToken = isAdmin 
          ? useAdminAuthStore.getState().refreshToken
          : useAuthStore.getState().refreshToken;
        
        if (!refreshToken) {
          // Clear auth nếu không có refresh token
          if (isAdmin) {
            useAdminAuthStore.getState().clearAuth();
          } else {
            useAuthStore.getState().clearAuth();
          }
          return Promise.reject(error);
        }

        const refreshUrl = API_PUBLIC 
          ? `${API_PUBLIC}${ApiEndPoint.REFRESH_TOKEN}`
          : ApiEndPoint.REFRESH_TOKEN;
        const res = await axios.post(
          refreshUrl,
          { refreshToken },
          { withCredentials: true }
        );

        const newToken = res.data?.data?.token;
        const newRefreshToken = res.data?.data?.refreshToken;
        if (!newToken) return;

        // Lưu token vào đúng store
        if (isAdmin) {
          useAdminAuthStore.getState().setToken(newToken);
          // Cập nhật refresh token mới nếu có (khi backend rotate refresh token)
          if (newRefreshToken) {
            useAdminAuthStore.getState().setRefreshToken(newRefreshToken);
          }
        } else {
          useAuthStore.getState().setToken(newToken);
          // Cập nhật refresh token mới nếu có (khi backend rotate refresh token)
          if (newRefreshToken) {
            useAuthStore.getState().setRefreshToken(newRefreshToken);
          }
        }

        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (err) {
        console.error("Refresh token failed:", err);
        // Clear auth khi refresh thất bại
        if (isAdmin) {
          useAdminAuthStore.getState().clearAuth();
        } else {
          useAuthStore.getState().clearAuth();
        }
      }
    }
    return Promise.reject(error);
  }
);
