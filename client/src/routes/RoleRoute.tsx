import { Outlet, Navigate } from "react-router-dom";

interface RoleRouteProps {
  allowedRoles: string[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const userRaw = localStorage.getItem("user");
  const role = userRaw ? JSON.parse(userRaw).role : undefined;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
