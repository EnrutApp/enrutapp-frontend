import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import {
  getDashboardRoute,
  hasAccessToRoute,
  getBreadcrumb,
  getPageTitle,
  getNavigationRoutes,
} from '../utils/routeUtils';

export const useRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = user?.rol?.nombreRol;

  useEffect(() => {
    const title = getPageTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);

  const goToDashboard = () => {
    if (userRole) {
      const dashboardRoute = getDashboardRoute(userRole);
      navigate(dashboardRoute);
    }
  };

  const canAccessRoute = path => {
    return hasAccessToRoute(path, userRole);
  };

  const safeNavigate = (path, options = {}) => {
    if (canAccessRoute(path)) {
      navigate(path, options);
    } else {
      goToDashboard();
    }
  };

  const currentBreadcrumb = getBreadcrumb(location.pathname);

  const navigationRoutes = getNavigationRoutes(userRole);

  const isRouteActive = path => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  return {
    currentPath: location.pathname,
    currentBreadcrumb,
    navigationRoutes,
    userRole,
    isAuthenticated,

    navigate,
    goToDashboard,
    safeNavigate,

    canAccessRoute,
    isRouteActive,

    pageTitle: getPageTitle(location.pathname),
  };
};

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
        navigate('/login', {
          state: { from: location.pathname },
          replace: true,
        });
      } else if (!hasRequiredRole) {
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
