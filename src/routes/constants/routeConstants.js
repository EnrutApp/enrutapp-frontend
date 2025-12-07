export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',

  ROOT: '/',
  DASHBOARD: '/dashboard',

  ADMIN: {
    ROOT: '/admin',
    RUTAS: '/admin/rutas',
    CLIENTES: '/admin/clientes',
    USUARIOS: '/admin/usuarios',
    CONDUCTORES: '/admin/conductores',
    VEHICULOS: '/admin/vehiculos',
    TURNOS: '/admin/turnos',
    RESERVAS: '/admin/reservas',
    ENCOMIENDAS: '/admin/encomiendas',
    FINANZAS: '/admin/finanzas',
    UBICACIONES: '/admin/ubicaciones',
    ROLES: '/admin/rol',
    CONTRATOS: '/admin/contratos',
    TRACKING: '/admin/tracking',
  },

  CONDUCTOR: {
    ROOT: '/conductor',
    MIS_VIAJES: '/conductor/mis-viajes',
    CALENDARIO: '/conductor/calendario',
    TURNOS: '/conductor/turnos',
    RESERVAS: '/conductor/reservas',
    HISTORIAL: '/conductor/historial',
    RUTAS: '/conductor/rutas',
  },

  USUARIO: {
    ROOT: '/usuario',
    MIS_VIAJES: '/usuario/mis-viajes',
    RESERVAS: '/usuario/reservas',
    ENCOMIENDAS: '/usuario/encomiendas',
    HISTORIAL: '/usuario/historial',
  },
};

export const USER_ROLES = {
  ADMIN: 'Administrador',
  CONDUCTOR: 'Conductor',
  CLIENTE: 'Cliente',
};

export const ROUTE_META = {
  [ROUTES.ADMIN.CLIENTES]: {
    title: 'Gestión de Clientes',
    description: 'Administra todos los clientes del sistema',
  },
  [ROUTES.ADMIN.USUARIOS]: {
    title: 'Gestión de Usuarios',
    description: 'Administra usuarios del sistema',
  },
  [ROUTES.ADMIN.CONDUCTORES]: {
    title: 'Gestión de Conductores',
    description: 'Administra los conductores activos',
  },
  [ROUTES.ADMIN.VEHICULOS]: {
    title: 'Gestión de Vehículos',
    description: 'Administra la flota de vehículos',
  },
  [ROUTES.ADMIN.RUTAS]: {
    title: 'Gestión de Rutas',
    description: 'Configura y administra las rutas disponibles',
  },
};
