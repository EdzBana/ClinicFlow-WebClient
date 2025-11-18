import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

interface Props {
  children: ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({
  children,
  redirectTo = "/dashboard",
}: Props) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // If the user is authenticated → redirect to dashboard
  if (user) return <Navigate to={redirectTo} replace />;

  return children;
}
