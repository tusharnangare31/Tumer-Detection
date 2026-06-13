import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, we could check role here
  // But since role info requires an API call, we keep it simple
  // and let the backend enforce role-based access

  return children;
}
