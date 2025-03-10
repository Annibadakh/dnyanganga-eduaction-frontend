import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";

const ProtectedRoute = () => {
    const { user } = useAuth();
    return user ? <Outlet /> : <Navigate to="/login" />;
};


const ProtectedRoleBasedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();
    return user.role === allowedRoles ? <Outlet /> : <Navigate to="/login" />;
};

export { ProtectedRoute, ProtectedRoleBasedRoute };
