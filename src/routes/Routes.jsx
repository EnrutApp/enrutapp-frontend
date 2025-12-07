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

const CompletarPerfilPage = withLazyLoading(
  lazy(() =>
    import('../features/conductores/pages/CompletarPerfilPage')
  ),
  'Cargando...'
);

// --- New Imports from Remote ---
const Landing = withLazyLoading(
    lazy(() => import('../features/landingPage/Landing')),
    'Cargando landing...'
);

const ResultadosBusqueda = withLazyLoading(
    lazy(() => import('../features/landingPage/ResultadosBusqueda')),
    'Cargando resultados de búsqueda...'
);
// -----------------------------

const LayoutWithErrorBoundary = withErrorBoundary(Layout, {
  title: 'Error de la Aplicación',
  message:
    'Ha ocurrido un error en la aplicación. Por favor, recarga la página.',
});

const LoginWithErrorBoundary = withErrorBoundary(Login, {
  title: 'Error de Inicio de Sesión',
  message: 'No se pudo cargar el formulario de inicio de sesión.',
});

const LandingWithErrorBoundary = withErrorBoundary(Landing, {
    title: 'Error de Landing',
    message: 'No se pudo cargar la página principal.'
});

const ResultadosBusquedaWithErrorBoundary = withErrorBoundary(ResultadosBusqueda, {
    title: 'Error de Resultados',
    message: 'No se pudieron cargar los resultados de búsqueda.'
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
    path: '/completar-perfil',
    element: (
      <ProtectedRoute allowedRoles={[USER_ROLES.CONDUCTOR]}>
        <CompletarPerfilPage />
      </ProtectedRoute>
    ),
  },

  // --- Landing Page (Root) ---
  {
    path: ROUTES.ROOT,
    element: <LandingWithErrorBoundary />,
    errorElement: <NotFound />
  },

  // --- Search Results ---
  {
    path: '/busqueda',
    element: <ResultadosBusquedaWithErrorBoundary />,
    errorElement: <NotFound />
  },

  // --- Main App (Protected/Layout) ---
  {
    element: <LayoutWithErrorBoundary />,
    errorElement: <NotFound />,
    children: [
      {
        path: 'dashboard', // Was index, now dashboard
        element: <RoleRedirect />,
      },
      
      // Also catch index if they manage to get here via some internal link? 
      // Or maybe existing bookmarks to / will hit Landing now, which is defined above.
      // If we want dashboard to be accessible, it needs a path.

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
