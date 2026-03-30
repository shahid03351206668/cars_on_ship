import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../api/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      logout: () => {
        // Clear Frappe session cookie
        fetch("/api/method/logout").catch(() => {});
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "cos-auth", // key in localStorage
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);