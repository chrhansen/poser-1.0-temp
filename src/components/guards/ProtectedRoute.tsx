import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/shared/PageLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, requires the user to be an internal/admin user */
  requireInternal?: boolean;
}

// TODO_BACKEND_HOOKUP: Check real roles from backend for requireInternal
export function ProtectedRoute({ children, requireInternal }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    // Redirect to home with a return URL; the LoginDialog will handle sign-in
    return <Navigate to={`/?login=true&returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireInternal) {
    // TODO_BACKEND_HOOKUP: Replace with real role check
    // For now mock: only allow if plan === "team" (stand-in for admin)
    if (user.plan !== "team") {
      return <Navigate to="/404" replace />;
    }
  }

  return <>{children}</>;
}
