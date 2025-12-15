// src/components/ProtectedRoute/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const role = localStorage.getItem("role");

  // If not logged in as Owner, redirect to login page
  if (role !== "Owner") {
    return <Navigate to="/owner-login" replace />;
  }

  // Otherwise render the protected page
  return children;
};

export default ProtectedRoute;
