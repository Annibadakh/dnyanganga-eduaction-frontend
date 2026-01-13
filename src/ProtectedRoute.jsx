import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";

const ProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname }}
    />
  );
};

const ProtectedRoleBasedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // logged in but role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, ProtectedRoleBasedRoute };
