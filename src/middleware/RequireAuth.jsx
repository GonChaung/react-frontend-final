// RequireAuth.jsx — Redirect to login if user is not authenticated

import { useUser } from "../contexts/UserProvider";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { user } = useUser();

  // If user is not logged in, redirect to login page
  if (!user.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
