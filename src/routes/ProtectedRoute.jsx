import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../shared/context/AuthContext";
import { ROUTES } from "./routeConstants";
import { useEffect } from "react";

// Eliminado loader local: dejamos que el Layout muestre la barra global

const UnauthorizedAccess = ({ userRole, requiredRoles }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="text-red-500 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        Acceso No Autorizado
      </h2>

      <p className="text-gray-600 mb-4">
        No tienes permisos para acceder a esta página.
      </p>

      <div className="text-sm text-gray-500 mb-4">
        <p><strong>Tu rol:</strong> {userRole || 'No asignado'}</p>
        <p><strong>Roles requeridos:</strong> {requiredRoles?.join(', ') || 'No especificado'}</p>
      </div>

      <button
        onClick={() => window.history.back()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
      >
        Volver atrás
      </button>
    </div>
  </div>
);

const ProtectedRoute = ({
  allowedRoles,
  children,
  requireAuth = true,
  fallbackPath = ROUTES.DASHBOARD,
  loadingMessage = "Verificando acceso..."
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Log de acceso para debugging (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('ProtectedRoute check:', {
        path: location.pathname,
        isAuthenticated,
        user: user,
        userRole: user?.rol?.nombreRol,
        allowedRoles,
        isLoading,
        fullUserData: JSON.stringify(user, null, 2)
      });
    }
  }, [location.pathname, isAuthenticated, user, allowedRoles, isLoading]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    // No renderizamos nada aquí para evitar doble loader. El Layout muestra una barra global.
    return null;
  }

  // Si requiere autenticación y no está autenticado, redirigir al login
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Si no requiere autenticación, renderizar directamente
  if (!requireAuth) {
    return children;
  }

  // Verificar roles si se especifican
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.rol?.nombreRol;

    if (!userRole || !allowedRoles.includes(userRole)) {
      // Si no tiene el rol correcto, mostrar página de acceso no autorizado
      // o redirigir según el rol del usuario
      if (userRole) {
        return <UnauthorizedAccess userRole={userRole} requiredRoles={allowedRoles} />;
      } else {
        // Si no tiene rol asignado, redirigir al dashboard
        return <Navigate to={fallbackPath} replace />;
      }
    }
  }

  // Si pasa todas las verificaciones, renderizar el componente
  return children;
};

export default ProtectedRoute;
