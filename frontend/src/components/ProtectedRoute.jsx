import { Navigate } from "react-router-dom";

// Helper to check if token is expired
const isTokenExpired = (token) => {
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

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.clear();
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;