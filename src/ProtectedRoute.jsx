import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";

const ProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role === "videoUser") return <Navigate to="/video" replace />;
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
};

const ProtectedRoleBasedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // logged in but role not allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const StudentProtectedRoute = () => {
  const { user } = useAuth();

  // not logged in
  if (!user) {
    return <Navigate to="/student-login" replace />;
  }

  // logged in but not a student
  if (user.role !== "student") {
    return <Navigate to={user.role === "videoUser" ? "/video" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

// Video platform: only video users (admins preview videos from the dashboard)
const VideoProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/video/login" replace state={{ from: location.pathname }} />;
  }
  if (user.role !== "videoUser") {
    return <Navigate to={user.role === "student" ? "/student" : "/dashboard"} replace />;
  }
  return <Outlet />;
};

export { ProtectedRoute, ProtectedRoleBasedRoute, StudentProtectedRoute, VideoProtectedRoute };
