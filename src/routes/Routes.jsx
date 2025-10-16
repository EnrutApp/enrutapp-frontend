import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

// Importaciones de constantes y utilidades
import { ROUTES, USER_ROLES } from "./routeConstants";
import { withErrorBoundary } from "./RouteErrorBoundary";
import { withLazyLoading } from "./LazyLoadingFallback";
import ProtectedRoute from "./ProtectedRoute";

// Importaciones de rutas modulares
import {
    adminRoutes,
    ADMIN_REQUIRED_ROLE
} from "./modules/adminRoutes";
import {
    conductorRoutes,
    CONDUCTOR_REQUIRED_ROLE
} from "./modules/conductorRoutes";
import {
    usuarioRoutes,
    USUARIO_REQUIRED_ROLE
} from "./modules/usuarioRoutes";

// Se removieron data loaders de router: los componentes no usan useLoaderData y esto ralentizaba la navegación

// Lazy loading de componentes principales
const Layout = withLazyLoading(
    lazy(() => import('../components/Layout')),
    'Cargando aplicación...'
);

const Login = withLazyLoading(
    lazy(() => import('../features/auth/Login')),
    'Cargando inicio de sesión...'
);

const NotFound = withLazyLoading(
    lazy(() => import('../features/notFound/NotFound')),
    'Página no encontrada...'
);

const RoleRedirect = withLazyLoading(
    lazy(() => import('./RoleRedirect')),
    'Redirigiendo...'
);

// Componentes con error boundary
const LayoutWithErrorBoundary = withErrorBoundary(Layout, {
    title: 'Error de la Aplicación',
    message: 'Ha ocurrido un error en la aplicación. Por favor, recarga la página.'
});

const LoginWithErrorBoundary = withErrorBoundary(Login, {
    title: 'Error de Inicio de Sesión',
    message: 'No se pudo cargar el formulario de inicio de sesión.'
});

// Función helper para crear rutas protegidas con roles
const createProtectedRoute = (element, allowedRoles) => {
    const route = {
        element: (
            <ProtectedRoute allowedRoles={allowedRoles}>
                {element}
            </ProtectedRoute>
        )
    };

    return route;
};

// Función helper para mapear rutas con protección y loaders
const mapRoutesWithProtection = (routes, requiredRoles) => {
    return routes.map(route => ({
        path: route.path,
        ...createProtectedRoute(
            route.element,
            requiredRoles
        ),
        handle: route.handle
    }));
};

// Configuración principal del router
const Routes = createBrowserRouter([
    // Rutas públicas
    {
        path: ROUTES.LOGIN,
        element: <LoginWithErrorBoundary />,
        errorElement: <div>Error cargando login</div>
    },

    // Rutas principales con layout
    {
        path: ROUTES.ROOT,
        element: <LayoutWithErrorBoundary />,
        errorElement: <NotFound />,
        children: [
            // Ruta raíz - redirige según el rol
            {
                index: true,
                element: <RoleRedirect />
            },

            // Dashboard genérico - redirige según el rol
            {
                path: "dashboard",
                element: (
                    <ProtectedRoute>
                        <RoleRedirect />
                    </ProtectedRoute>
                )
            },

            // Rutas de Administrador con protección y loaders
            ...mapRoutesWithProtection(
                adminRoutes,
                ADMIN_REQUIRED_ROLE
            ),

            // Rutas de Conductor con protección y loaders
            ...mapRoutesWithProtection(
                conductorRoutes,
                CONDUCTOR_REQUIRED_ROLE
            ),

            // Rutas de Usuario/Cliente con protección y loaders
            ...mapRoutesWithProtection(
                usuarioRoutes,
                USUARIO_REQUIRED_ROLE
            )
        ]
    },

    // Ruta 404 - debe ir al final
    {
        path: "*",
        element: <NotFound />
    }
]);

// Configuración adicional del router
Routes.subscribe?.((state) => {
    // Log de navegación en desarrollo
    if (process.env.NODE_ENV === 'development') {
        console.log('Navegación:', state.location?.pathname);
    }
});

export default Routes;

// Exportar también las constantes para uso en otros componentes
export { ROUTES, USER_ROLES } from './routeConstants';