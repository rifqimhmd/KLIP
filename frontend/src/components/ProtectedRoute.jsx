import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("auth_token");
  const location = useLocation();
  
  return token ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
