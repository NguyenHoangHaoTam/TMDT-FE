import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AdminAuthState {
  token: string | null;
  refreshToken: string | null;
  admin: {
    id: string;
    name: string;
    email: string;
  } | null;

  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setAdmin: (admin: { id: string; name: string; email: string }) => void;
  clearAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      refreshToken: null,

      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setAdmin: (admin) => set({ admin }),
      clearAuth: () => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("admin-auth-storage");
          localStorage.removeItem("admin-auth-storage");
        }
        set({ token: null, admin: null, refreshToken: null });
      },
    }),
    {
      name: "admin-auth-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

