import { lazy } from 'react';
import { ROUTES, USER_ROLES } from '../constants/routeConstants';
import { withErrorBoundary } from '../components/RouteErrorBoundary';
import { withLazyLoading } from '../components/LazyLoadingFallback';

const HomeAdmin = withLazyLoading(
  lazy(() => import('../../features/home/pages/HomeAdmin')),
  'Cargando dashboard de administrador...'
);

const Clientes = withLazyLoading(
  lazy(() => import('../../features/clientes/ClientesPage')),
  'Cargando gestión de clientes...'
);

const Usuarios = withLazyLoading(
  lazy(() => import('../../features/usuarios/UsuariosPage')),
  'Cargando gestión de usuarios...'
);

const Conductores = withLazyLoading(
  lazy(() => import('../../features/conductores/ConductoresPage')),
  'Cargando gestión de conductores...'
);

const Vehiculos = withLazyLoading(
  lazy(() => import('../../features/vehiculos/VehiculosPage')),
  'Cargando gestión de vehículos...'
);

const RutasAdmin = withLazyLoading(
  lazy(() => import('../../features/rutas/RutasPage')),
  'Cargando gestión de rutas...'
);

const Turnos = withLazyLoading(
  lazy(() => import('../../features/turnos/TurnosPage')),
  'Cargando gestión de turnos...'
);

const Reservas = withLazyLoading(
  lazy(() => import('../../features/reservas/ReservasPage')),
  'Cargando gestión de reservas...'
);

const Encomiendas = withLazyLoading(
  lazy(() => import('../../features/encomiendas/EncomiendasPage')),
  'Cargando gestión de encomiendas...'
);

const Finanzas = withLazyLoading(
  lazy(() => import('../../features/finanzas/FinanzasPage')),
  'Cargando gestión financiera...'
);

const Ubicacion = withLazyLoading(
  lazy(() => import('../../features/ubicaciones/UbicacionesPage')),
  'Cargando gestión de ubicaciones...'
);

const Roles = withLazyLoading(
  lazy(() => import('../../features/roles/RolesPage')),
  'Cargando gestión de roles...'
);

const Contratos = withLazyLoading(
  lazy(() => import('../../features/contratos/ContratosPage')),
  'Cargando gestión de contratos...'
);

const Tracking = withLazyLoading(
  lazy(() => import('../../features/tracking/TrackingPage')),
  'Cargando tracking de conductores...'
);

const AdminHomeWithErrorBoundary = withErrorBoundary(HomeAdmin, {
  title: 'Error en Dashboard',
  message: 'No se pudo cargar el dashboard de administrador',
});

const ClientesWithErrorBoundary = withErrorBoundary(Clientes, {
  title: 'Error en Gestión de Clientes',
  message: 'No se pudo cargar la gestión de clientes',
});

const UsuariosWithErrorBoundary = withErrorBoundary(Usuarios, {
  title: 'Error en Gestión de Usuarios',
  message: 'No se pudo cargar la gestión de usuarios',
});

const ConductoresWithErrorBoundary = withErrorBoundary(Conductores, {
  title: 'Error en Gestión de Conductores',
  message: 'No se pudo cargar la gestión de conductores',
});

const VehiculosWithErrorBoundary = withErrorBoundary(Vehiculos, {
  title: 'Error en Gestión de Vehículos',
  message: 'No se pudo cargar la gestión de vehículos',
});

export const adminRoutes = [
  {
    path: ROUTES.ADMIN.ROOT,
    element: <AdminHomeWithErrorBoundary />,
    handle: {
      crumb: () => 'Dashboard Admin',
    },
  },
  {
    path: ROUTES.ADMIN.CLIENTES,
    element: <ClientesWithErrorBoundary />,
    handle: {
      crumb: () => 'Clientes',
    },
  },
  {
    path: ROUTES.ADMIN.USUARIOS,
    element: <UsuariosWithErrorBoundary />,
    handle: {
      crumb: () => 'Usuarios',
    },
  },
  {
    path: ROUTES.ADMIN.CONDUCTORES,
    element: <ConductoresWithErrorBoundary />,
    handle: {
      crumb: () => 'Conductores',
    },
  },
  {
    path: ROUTES.ADMIN.VEHICULOS,
    element: <VehiculosWithErrorBoundary />,
    handle: {
      crumb: () => 'Vehículos',
    },
  },
  {
    path: ROUTES.ADMIN.RUTAS,
    element: withErrorBoundary(RutasAdmin, {
      title: 'Error en Gestión de Rutas',
      message: 'No se pudo cargar la gestión de rutas',
    })(),
    handle: {
      crumb: () => 'Rutas',
    },
  },
  {
    path: ROUTES.ADMIN.TURNOS,
    element: withErrorBoundary(Turnos, {
      title: 'Error en Gestión de Turnos',
      message: 'No se pudo cargar la gestión de turnos',
    })(),
    handle: {
      crumb: () => 'Turnos',
    },
  },
  {
    path: ROUTES.ADMIN.RESERVAS,
    element: withErrorBoundary(Reservas, {
      title: 'Error en Gestión de Reservas',
      message: 'No se pudo cargar la gestión de reservas',
    })(),
    handle: {
      crumb: () => 'Reservas',
    },
  },
  {
    path: ROUTES.ADMIN.ENCOMIENDAS,
    element: withErrorBoundary(Encomiendas, {
      title: 'Error en Gestión de Encomiendas',
      message: 'No se pudo cargar la gestión de encomiendas',
    })(),
    handle: {
      crumb: () => 'Encomiendas',
    },
  },
  {
    path: ROUTES.ADMIN.FINANZAS,
    element: withErrorBoundary(Finanzas, {
      title: 'Error en Gestión Financiera',
      message: 'No se pudo cargar la gestión financiera',
    })(),
    handle: {
      crumb: () => 'Finanzas',
    },
  },
  {
    path: ROUTES.ADMIN.UBICACIONES,
    element: withErrorBoundary(Ubicacion, {
      title: 'Error en Gestión de Ubicaciones',
      message: 'No se pudo cargar la gestión de ubicaciones',
    })(),
    handle: {
      crumb: () => 'Ubicaciones',
    },
  },
  {
    path: ROUTES.ADMIN.ROLES,
    element: withErrorBoundary(Roles, {
      title: 'Error en Gestión de Roles',
      message: 'No se pudo cargar la gestión de roles',
    })(),
    handle: {
      crumb: () => 'Roles',
    },
  },
  {
    path: ROUTES.ADMIN.CONTRATOS,
    element: withErrorBoundary(Contratos, {
      title: 'Error en Gestión de Contratos',
      message: 'No se pudo cargar la gestión de contratos',
    })(),
    handle: {
      crumb: () => 'Contratos',
    },
  },
  {
    path: ROUTES.ADMIN.TRACKING,
    element: withErrorBoundary(Tracking, {
      title: 'Error en Tracking',
      message: 'No se pudo cargar el tracking de conductores',
    })(),
    handle: {
      crumb: () => 'Tracking',
    },
  },
];

export const ADMIN_REQUIRED_ROLE = [USER_ROLES.ADMIN];
