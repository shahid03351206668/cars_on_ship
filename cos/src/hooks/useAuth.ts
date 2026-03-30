import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth";
import type { LoginPayload, RegisterPayload, UserRole } from "../api/auth";
import { useAuthStore } from "../store/auth";

// ─── Helpers ──────────────────────────────────────────────────

const roleToRoute = (role: UserRole): string =>
  role === "Sales User" ? "/saler-home" : "/buyer-home";

// ─── useLogin ─────────────────────────────────────────────────

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (user) => {
      setUser(user);
      navigate(roleToRoute(user.role), { replace: true });
    },
  });
};

// ─── useRegister ──────────────────────────────────────────────

export const useRegister = () => {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: (user) => {
      setUser(user);
      navigate(roleToRoute(user.role), { replace: true });
    },
  });
};

// ─── useLogout ────────────────────────────────────────────────

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return () => {
    logout();
    navigate("/", { replace: true });
  };
};