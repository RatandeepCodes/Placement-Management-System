import { Navigate } from "react-router-dom";
import { getRole, getToken } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "student" | "admin";
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getRole();

  if (role && userRole !== role) {
    return <Navigate to={userRole === "admin" ? "/admin" : "/student"} replace />;
  }

  return <>{children}</>;
}
