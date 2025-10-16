import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import {
  getDashboardRoute,
  hasAccessToRoute,
  getBreadcrumb,
  getPageTitle,
  getNavigationRoutes,
} from "../routeUtils";

/**
 * Hook personalizado para manejo avanzado de rutas
 */
export const useRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.rol?.nombreRol;

  // Actualizar título de la página automáticamente
  useEffect(() => {
    const title = getPageTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);

  /**
   * Navega a la ruta de dashboard del usuario
   */
  const goToDashboard = () => {
    if (userRole) {
      const dashboardRoute = getDashboardRoute(userRole);
      navigate(dashboardRoute);
    }
  };

  /**
   * Verifica si el usuario actual tiene acceso a una ruta
   */
  const canAccessRoute = (path) => {
    return hasAccessToRoute(path, userRole);
  };

  /**
   * Navega a una ruta si el usuario tiene acceso
   */
  const safeNavigate = (path, options = {}) => {
    if (canAccessRoute(path)) {
      navigate(path, options);
    } else {
      console.warn(`Usuario ${userRole} no tiene acceso a la ruta ${path}`);
      goToDashboard();
    }
  };

  /**
   * Obtiene el breadcrumb de la ruta actual
   */
  const currentBreadcrumb = getBreadcrumb(location.pathname);

  /**
   * Obtiene las rutas de navegación del usuario actual
   */
  const navigationRoutes = getNavigationRoutes(userRole);

  /**
   * Verifica si la ruta actual es activa
   */
  const isRouteActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return {
    // Estado actual
    currentPath: location.pathname,
    currentBreadcrumb,
    navigationRoutes,
    userRole,
    isAuthenticated,

    // Funciones de navegación
    navigate,
    goToDashboard,
    safeNavigate,

    // Funciones de verificación
    canAccessRoute,
    isRouteActive,

    // Información de la ruta actual
    pageTitle: getPageTitle(location.pathname),
  };
};

/**
 * Hook para protección de rutas en componentes
 */
export const useRouteProtection = (requiredRoles = []) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.rol?.nombreRol;
  const hasRequiredRole =
    requiredRoles.length === 0 || requiredRoles.includes(userRole);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirigir al login si no está autenticado
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        });
      } else if (!hasRequiredRole) {
        // Redirigir al dashboard si no tiene el rol requerido
        const dashboardRoute = getDashboardRoute(userRole);
        navigate(dashboardRoute, { replace: true });
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    hasRequiredRole,
    userRole,
    navigate,
    location.pathname,
  ]);

  return {
    isAuthorized: isAuthenticated && hasRequiredRole,
    isLoading,
    userRole,
  };
};

export default useRoutes;
