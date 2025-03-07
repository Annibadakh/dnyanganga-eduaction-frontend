import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";


const ProtectedRoute = () => {
    // const token = localStorage.getItem("token");
    const { user } = useAuth();
    console.log("user: ",user);
    // return token ? <Outlet /> : <Navigate to="/login" />;
    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
