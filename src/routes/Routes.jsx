import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

import { ROUTES, USER_ROLES } from './constants/routeConstants';
import { withErrorBoundary } from './components/RouteErrorBoundary';
import { withLazyLoading } from './components/LazyLoadingFallback';
import ProtectedRoute from './components/ProtectedRoute';

import { adminRoutes, ADMIN_REQUIRED_ROLE } from './modules/adminRoutes';
import {
  conductorRoutes,
  CONDUCTOR_REQUIRED_ROLE,
} from './modules/conductorRoutes';
import { usuarioRoutes, USUARIO_REQUIRED_ROLE } from './modules/usuarioRoutes';

const Layout = withLazyLoading(
  lazy(() => import('../components/Layout')),
  'Cargando aplicación...'
);

const Login = withLazyLoading(
  lazy(() => import('../features/auth/LoginPage')),
  'Cargando inicio de sesión...'
);

const NotFound = withLazyLoading(
  lazy(() => import('../features/notFound/NotFound')),
  'Página no encontrada...'
);

const RoleRedirect = withLazyLoading(
  lazy(() => import('./components/RoleRedirect')),
  'Redirigiendo...'
);

const LayoutWithErrorBoundary = withErrorBoundary(Layout, {
  title: 'Error de la Aplicación',
  message:
    'Ha ocurrido un error en la aplicación. Por favor, recarga la página.',
});

const LoginWithErrorBoundary = withErrorBoundary(Login, {
  title: 'Error de Inicio de Sesión',
  message: 'No se pudo cargar el formulario de inicio de sesión.',
});

const createProtectedRoute = (element, allowedRoles) => {
  const route = {
    element: (
      <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>
    ),
  };

  return route;
};

const mapRoutesWithProtection = (routes, requiredRoles) => {
  return routes.map(route => ({
    path: route.path,
    ...createProtectedRoute(route.element, requiredRoles),
    handle: route.handle,
  }));
};

const Routes = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: <LoginWithErrorBoundary />,
    errorElement: <div>Error cargando login</div>,
  },

  {
    path: ROUTES.ROOT,
    element: <LayoutWithErrorBoundary />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <RoleRedirect />,
      },

      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        ),
      },

      ...mapRoutesWithProtection(adminRoutes, ADMIN_REQUIRED_ROLE),

      ...mapRoutesWithProtection(conductorRoutes, CONDUCTOR_REQUIRED_ROLE),

      ...mapRoutesWithProtection(usuarioRoutes, USUARIO_REQUIRED_ROLE),
    ],
  },

  {
    path: '*',
    element: <NotFound />,
  },
]);

export default Routes;

export { ROUTES, USER_ROLES } from './constants/routeConstants';
