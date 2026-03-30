import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import type { UserRole } from "../../api/auth";

interface Props {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  // Not logged in → go to auth
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Wrong role → redirect to their correct home
  if (user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === "Sales User" ? "/saler-home" : "/buyer-home"}
        replace
      />
    );
  }

  return <>{children}</>;
}