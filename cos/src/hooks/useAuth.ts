import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth";
import type { LoginPayload, RegisterPayload, AuthUser } from "../api/auth";
import { useAuthStore } from "../store/auth";


// ─── Helpers ──────────────────────────────────────────────────


// ─── useLogin ─────────────────────────────────────────────────

export const useLogin = () => {
  const setUser = useAuthStore((s: { setUser: (user: AuthUser) => void }) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload & { phone: string }) => loginUser(payload),
    onSuccess: (user: AuthUser) => {
      setUser(user);
      // Backend doesn't return role — check username or navigate to a common landing page
      // Adjust this logic based on how your app tracks roles post-login
      navigate(user.role === "Sales User" ? "/seller" : "/buyer", { replace: true });
    },
  });
};

// ─── useRegister ──────────────────────────────────────────────

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: () => {
      // After registration, send user to login — no session is created yet
      navigate("/login", { replace: true });
    },
  });
};

// ─── useLogout ────────────────────────────────────────────────

export const useLogout = () => {
  const logout = useAuthStore((s: { logout: () => void }) => s.logout);
  const navigate = useNavigate();

  return () => {
    logout();
    navigate("/", { replace: true });
  };
};