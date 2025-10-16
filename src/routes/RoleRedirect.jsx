import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";

const RoleRedirect = () => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        // Evitar duplicar loaders: usar barra global del Layout
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.rol?.nombreRol;

    if (userRole === "Administrador") return <Navigate to="/admin/" replace />;
    if (userRole === "Conductor") return <Navigate to="/conductor/" replace />;
    if (userRole === "Cliente") return <Navigate to="/usuario/" replace />;

    return <Navigate to="/dashboard" replace />;
};

export default RoleRedirect;
