import { Navigate, useLocation } from "react-router-dom";

// Helper to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false; // bypass non-JWT tokens (e.g. mock OAuth tokens)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch (error) {
    return true; // if error parsing, consider expired or invalid
  }
};

// Helper to check if user is authenticated with a valid token
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    return false;
  }
  return true;
};

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Only remove auth credentials, preserving theme and client settings
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;