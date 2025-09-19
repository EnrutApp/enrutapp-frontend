import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";

const RoleRedirect = () => {
    const { user } = useAuth();

    if (user?.role === "Administrador") return <Navigate to="/admin/" replace />;
    if (user?.role === "Conductor") return <Navigate to="/conductor/" replace />;
    if (user?.role === "Cliente") return <Navigate to="/usuario/" replace />;
    return <Navigate to="/login" replace />;
};

export default RoleRedirect;
