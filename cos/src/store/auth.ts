import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../api/auth";

export interface AuthState {
  user: AuthUser | null;
  sid: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

type SetState = (
  partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)
) => void;

export const useAuthStore = create<AuthState>()(
  persist(
    (set: SetState) => ({
      user: null,
      sid: null,
      isAuthenticated: false,

      setUser: (user: AuthUser) =>
        set({ user, sid: user.sid, isAuthenticated: true }),

      logout: () => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/method/logout`, {
          credentials: "include",
        }).catch(() => {});
        set({ user: null, sid: null, isAuthenticated: false });
      },
    }),
    {
      name: "cos-auth",
      partialize: (state: AuthState): Partial<AuthState> => ({
        user: state.user,
        sid: state.sid,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);