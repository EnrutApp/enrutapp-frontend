import { lazy } from 'react';
import { ROUTES, USER_ROLES } from '../routeConstants';
import { withErrorBoundary } from '../RouteErrorBoundary';
import { withLazyLoading } from '../LazyLoadingFallback';

// Lazy loading de componentes del admin
const HomeAdmin = withLazyLoading(
    lazy(() => import('../../features/home/pages/HomeAdmin')),
    'Cargando dashboard de administrador...'
);

const Clientes = withLazyLoading(
    lazy(() => import('../../features/clientes/Clientes')),
    'Cargando gestión de clientes...'
);

const Usuarios = withLazyLoading(
    lazy(() => import('../../features/usuarios/UsuariosPage')),
    'Cargando gestión de usuarios...'
);

const Conductores = withLazyLoading(
    lazy(() => import('../../features/conductores/Conductores')),
    'Cargando gestión de conductores...'
);

const Vehiculos = withLazyLoading(
    lazy(() => import('../../features/vehiculos/Vehiculos')),
    'Cargando gestión de vehículos...'
);

const RutasAdmin = withLazyLoading(
    lazy(() => import('../../features/rutas/pages/RutasAdmin')),
    'Cargando gestión de rutas...'
);

const Turnos = withLazyLoading(
    lazy(() => import('../../features/turnos/Turnos')),
    'Cargando gestión de turnos...'
);

const Reservas = withLazyLoading(
    lazy(() => import('../../features/reservas/Reservas')),
    'Cargando gestión de reservas...'
);

const Encomiendas = withLazyLoading(
    lazy(() => import('../../features/encomiendas/Encomiendas')),
    'Cargando gestión de encomiendas...'
);

const Finanzas = withLazyLoading(
    lazy(() => import('../../features/finanzas/Finanzas')),
    'Cargando gestión financiera...'
);

const Ubicacion = withLazyLoading(
    lazy(() => import('../../features/ubicaciones/Ubicacion')),
    'Cargando gestión de ubicaciones...'
);

const Roles = withLazyLoading(
    lazy(() => import('../../features/roles/RolesPage')),
    'Cargando gestión de roles...'
);

// Componentes con error boundary
const AdminHomeWithErrorBoundary = withErrorBoundary(HomeAdmin, {
    title: 'Error en Dashboard',
    message: 'No se pudo cargar el dashboard de administrador'
});

const ClientesWithErrorBoundary = withErrorBoundary(Clientes, {
    title: 'Error en Gestión de Clientes',
    message: 'No se pudo cargar la gestión de clientes'
});

const UsuariosWithErrorBoundary = withErrorBoundary(Usuarios, {
    title: 'Error en Gestión de Usuarios',
    message: 'No se pudo cargar la gestión de usuarios'
});

const ConductoresWithErrorBoundary = withErrorBoundary(Conductores, {
    title: 'Error en Gestión de Conductores',
    message: 'No se pudo cargar la gestión de conductores'
});

const VehiculosWithErrorBoundary = withErrorBoundary(Vehiculos, {
    title: 'Error en Gestión de Vehículos',
    message: 'No se pudo cargar la gestión de vehículos'
});

// Configuración de rutas de admin
export const adminRoutes = [
    {
        path: ROUTES.ADMIN.ROOT,
        element: <AdminHomeWithErrorBoundary />,
        handle: {
            crumb: () => "Dashboard Admin"
        }
    },
    {
        path: ROUTES.ADMIN.CLIENTES,
        element: <ClientesWithErrorBoundary />,
        handle: {
            crumb: () => "Clientes"
        }
    },
    {
        path: ROUTES.ADMIN.USUARIOS,
        element: <UsuariosWithErrorBoundary />,
        handle: {
            crumb: () => "Usuarios"
        }
    },
    {
        path: ROUTES.ADMIN.CONDUCTORES,
        element: <ConductoresWithErrorBoundary />,
        handle: {
            crumb: () => "Conductores"
        }
    },
    {
        path: ROUTES.ADMIN.VEHICULOS,
        element: <VehiculosWithErrorBoundary />,
        handle: {
            crumb: () => "Vehículos"
        }
    },
    {
        path: ROUTES.ADMIN.RUTAS,
        element: withErrorBoundary(RutasAdmin, {
            title: 'Error en Gestión de Rutas',
            message: 'No se pudo cargar la gestión de rutas'
        })(),
        handle: {
            crumb: () => "Rutas"
        }
    },
    {
        path: ROUTES.ADMIN.TURNOS,
        element: withErrorBoundary(Turnos, {
            title: 'Error en Gestión de Turnos',
            message: 'No se pudo cargar la gestión de turnos'
        })(),
        handle: {
            crumb: () => "Turnos"
        }
    },
    {
        path: ROUTES.ADMIN.RESERVAS,
        element: withErrorBoundary(Reservas, {
            title: 'Error en Gestión de Reservas',
            message: 'No se pudo cargar la gestión de reservas'
        })(),
        handle: {
            crumb: () => "Reservas"
        }
    },
    {
        path: ROUTES.ADMIN.ENCOMIENDAS,
        element: withErrorBoundary(Encomiendas, {
            title: 'Error en Gestión de Encomiendas',
            message: 'No se pudo cargar la gestión de encomiendas'
        })(),
        handle: {
            crumb: () => "Encomiendas"
        }
    },
    {
        path: ROUTES.ADMIN.FINANZAS,
        element: withErrorBoundary(Finanzas, {
            title: 'Error en Gestión Financiera',
            message: 'No se pudo cargar la gestión financiera'
        })(),
        handle: {
            crumb: () => "Finanzas"
        }
    },
    {
        path: ROUTES.ADMIN.UBICACIONES,
        element: withErrorBoundary(Ubicacion, {
            title: 'Error en Gestión de Ubicaciones',
            message: 'No se pudo cargar la gestión de ubicaciones'
        })(),
        handle: {
            crumb: () => "Ubicaciones"
        }
    },
    {
        path: ROUTES.ADMIN.ROLES,
        element: withErrorBoundary(Roles, {
            title: 'Error en Gestión de Roles',
            message: 'No se pudo cargar la gestión de roles'
        })(),
        handle: {
            crumb: () => "Roles"
        }
    }
];

// Todas las rutas requieren rol de Administrador
export const ADMIN_REQUIRED_ROLE = [USER_ROLES.ADMIN];