import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { getCurrentUser } from "@/store/auth";

export default function RequireAuth() {
  const user = getCurrentUser();
  const loc = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }
  return <Outlet />;
}
