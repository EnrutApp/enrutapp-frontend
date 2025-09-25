import { Navigate } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";

const RoleRedirect = () => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.rol?.nombreRol;

    if (userRole === "Administrador") return <Navigate to="/admin/" replace />;
    if (userRole === "Conductor") return <Navigate to="/conductor/" replace />;
    if (userRole === "Cliente") return <Navigate to="/usuario/" replace />;

    // Si el rol no coincide con ninguno de los esperados, ir al dashboard genérico
    return <Navigate to="/dashboard" replace />;
};

export default RoleRedirect;
