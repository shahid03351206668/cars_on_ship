import { create } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";
import type { AuthUser } from "../api/auth";

// ─── State Interface ──────────────────────────────────────────
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

// ─── Type for the state setter ────────────────────────────────
type SetState = (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void;

// ─── Zustand Store ───────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set: SetState) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: AuthUser) =>
        set({ user, isAuthenticated: true }),

      logout: () => {
        // Clear Frappe session cookie
        fetch("/api/method/logout").catch(() => {});
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "cos-auth", // key in localStorage
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    } as PersistOptions<AuthState>
  )
);