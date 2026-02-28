import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

import { ROUTES, USER_ROLES } from './constants/routeConstants';
import { withErrorBoundary } from './components/RouteErrorBoundary';
import { withLazyLoading } from './components/LazyLoadingFallback';

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

// eslint-disable-next-line unused-imports/no-unused-vars
const NotFound = withLazyLoading(
  lazy(() => import('../features/notFound/NotFound')),
  'Página no encontrada...'
);

// eslint-disable-next-line unused-imports/no-unused-vars
const RoleRedirect = withLazyLoading(
  lazy(() => import('./components/RoleRedirect')),
  'Redirigiendo...'
);

// eslint-disable-next-line unused-imports/no-unused-vars
const CompletarPerfilRouter = withLazyLoading(
  lazy(() => import('./components/CompletarPerfilRouter')),
  'Cargando...'
);

const Landing = withLazyLoading(
  lazy(() => import('../features/landingPage/Landing')),
  'Cargando landing...'
);

const ResultadosBusqueda = withLazyLoading(
  lazy(() => import('../features/landingPage/ResultadosBusqueda')),
  'Cargando resultados de búsqueda...'
);

// eslint-disable-next-line unused-imports/no-unused-vars
const LayoutWithErrorBoundary = withErrorBoundary(Layout, {
  title: 'Error de la Aplicación',
  message:
    'Ha ocurrido un error en la aplicación. Por favor, recarga la página.',
});

// eslint-disable-next-line unused-imports/no-unused-vars
const LoginWithErrorBoundary = withErrorBoundary(Login, {
  title: 'Error de Inicio de Sesión',
  message: 'No se pudo cargar el formulario de inicio de sesión.',
});

// eslint-disable-next-line unused-imports/no-unused-vars
const LandingWithErrorBoundary = withErrorBoundary(Landing, {
  title: 'Error de Landing',
  message: 'No se pudo cargar la página principal.',
});

// eslint-disable-next-line unused-imports/no-unused-vars
const ResultadosBusquedaWithErrorBoundary = withErrorBoundary(
  ResultadosBusqueda,
  {
    title: 'Error de Resultados',
    message: 'No se pudieron cargar los resultados de búsqueda.',
  }
);

const createProtectedRoute = (element, allowedRoles, requiredPermission) => {
  const route = {
    element: (
      <ProtectedRoute
        allowedRoles={allowedRoles}
        requiredPermission={requiredPermission}
      >
        {element}
      </ProtectedRoute>
    ),
  };

  return route;
};

const mapRoutesWithProtection = (routes, requiredRoles) => {
  return routes.map(route => ({
    path: route.path,
    ...createProtectedRoute(route.element, requiredRoles, route.permission),
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
    path: '/completar-perfil',
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.CONDUCTOR, USER_ROLES.CLIENTE]}>
        <CompletarPerfilRouter />
      </ProtectedRoute>
    ),
  },

  {
    path: ROUTES.ROOT,
    element: <LandingWithErrorBoundary />,
    errorElement: <NotFound />,
  },

  {
    path: '/busqueda',
    element: <ResultadosBusquedaWithErrorBoundary />,
    errorElement: <NotFound />,
  },

  {
    element: <LayoutWithErrorBoundary />,
    errorElement: <NotFound />,
    children: [
      {
        path: 'dashboard',
        element: <RoleRedirect />,
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

// eslint-disable-next-line react-refresh/only-export-components
export { ROUTES, USER_ROLES } from './constants/routeConstants';
