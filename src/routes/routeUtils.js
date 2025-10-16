import { ROUTES, USER_ROLES } from "./routeConstants";

/**
 * Obtiene la ruta del dashboard según el rol del usuario
 * @param {string} userRole - El rol del usuario
 * @returns {string} La ruta del dashboard correspondiente
 */
export const getDashboardRoute = (userRole) => {
  switch (userRole) {
    case USER_ROLES.ADMIN:
      return ROUTES.ADMIN.ROOT;
    case USER_ROLES.CONDUCTOR:
      return ROUTES.CONDUCTOR.ROOT;
    case USER_ROLES.CLIENTE:
      return ROUTES.USUARIO.ROOT;
    default:
      return ROUTES.ROOT;
  }
};

/**
 * Verifica si una ruta requiere un rol específico
 * @param {string} path - La ruta a verificar
 * @param {string} userRole - El rol del usuario
 * @returns {boolean} True si el usuario tiene acceso a la ruta
 */
export const hasAccessToRoute = (path, userRole) => {
  // Rutas públicas
  const publicRoutes = [ROUTES.LOGIN, ROUTES.ROOT];
  if (publicRoutes.includes(path)) {
    return true;
  }

  // Rutas de admin
  if (path.startsWith("/admin") && userRole === USER_ROLES.ADMIN) {
    return true;
  }

  // Rutas de conductor
  if (path.startsWith("/conductor") && userRole === USER_ROLES.CONDUCTOR) {
    return true;
  }

  // Rutas de usuario/cliente
  if (path.startsWith("/usuario") && userRole === USER_ROLES.CLIENTE) {
    return true;
  }

  return false;
};

/**
 * Obtiene el breadcrumb para una ruta específica
 * @param {string} pathname - La ruta actual
 * @returns {Array} Array de objetos con label y path para el breadcrumb
 */
export const getBreadcrumb = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ label: "Inicio", path: "/" }];

  if (segments.length === 0) {
    return breadcrumbs;
  }

  // Mapeo de rutas a labels legibles
  const routeLabels = {
    admin: "Administración",
    conductor: "Conductor",
    usuario: "Usuario",
    clientes: "Clientes",
    usuarios: "Usuarios",
    conductores: "Conductores",
    vehiculos: "Vehículos",
    rutas: "Rutas",
    turnos: "Turnos",
    reservas: "Reservas",
    encomiendas: "Encomiendas",
    finanzas: "Finanzas",
    ubicaciones: "Ubicaciones",
    roles: "Roles",
    "mis-viajes": "Mis Viajes",
    calendario: "Calendario",
    historial: "Historial",
  };

  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      label:
        routeLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1),
      path: currentPath,
    });
  });

  return breadcrumbs;
};

/**
 * Genera el título de la página basado en la ruta
 * @param {string} pathname - La ruta actual
 * @returns {string} El título de la página
 */
export const getPageTitle = (pathname) => {
  const baseTitle = "EnrutApp";

  if (pathname === ROUTES.ROOT || pathname === ROUTES.DASHBOARD) {
    return `${baseTitle} - Dashboard`;
  }

  if (pathname === ROUTES.LOGIN) {
    return `${baseTitle} - Iniciar Sesión`;
  }

  // Obtener el último segmento de la ruta para el título
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    const routeLabels = {
      clientes: "Gestión de Clientes",
      usuarios: "Gestión de Usuarios",
      conductores: "Gestión de Conductores",
      vehiculos: "Gestión de Vehículos",
      rutas: "Gestión de Rutas",
      turnos: "Gestión de Turnos",
      reservas: "Gestión de Reservas",
      encomiendas: "Gestión de Encomiendas",
      finanzas: "Gestión Financiera",
      ubicaciones: "Gestión de Ubicaciones",
      rol: "Gestión de Roles",
      "mis-viajes": "Mis Viajes",
      calendario: "Calendario",
      historial: "Historial",
    };

    const title =
      routeLabels[lastSegment] ||
      lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    return `${baseTitle} - ${title}`;
  }

  return baseTitle;
};

/**
 * Obtiene las rutas de navegación disponibles para un rol específico
 * @param {string} userRole - El rol del usuario
 * @returns {Array} Array de objetos de navegación
 */
export const getNavigationRoutes = (userRole) => {
  const commonNavigation = [
    {
      label: "Dashboard",
      path: getDashboardRoute(userRole),
      icon: "dashboard",
    },
  ];

  switch (userRole) {
    case USER_ROLES.ADMIN:
      return [
        ...commonNavigation,
        {
          label: "Clientes",
          path: ROUTES.ADMIN.CLIENTES,
          icon: "people",
        },
        {
          label: "Usuarios",
          path: ROUTES.ADMIN.USUARIOS,
          icon: "person",
        },
        {
          label: "Conductores",
          path: ROUTES.ADMIN.CONDUCTORES,
          icon: "drive_eta",
        },
        {
          label: "Vehículos",
          path: ROUTES.ADMIN.VEHICULOS,
          icon: "directions_car",
        },
        {
          label: "Rutas",
          path: ROUTES.ADMIN.RUTAS,
          icon: "route",
        },
        {
          label: "Turnos",
          path: ROUTES.ADMIN.TURNOS,
          icon: "schedule",
        },
        {
          label: "Reservas",
          path: ROUTES.ADMIN.RESERVAS,
          icon: "book_online",
        },
        {
          label: "Encomiendas",
          path: ROUTES.ADMIN.ENCOMIENDAS,
          icon: "local_shipping",
        },
        {
          label: "Finanzas",
          path: ROUTES.ADMIN.FINANZAS,
          icon: "attach_money",
        },
        {
          label: "Ubicaciones",
          path: ROUTES.ADMIN.UBICACIONES,
          icon: "place",
        },
        {
          label: "Roles",
          path: ROUTES.ADMIN.ROLES,
          icon: "admin_panel_settings",
        },
      ];

    case USER_ROLES.CONDUCTOR:
      return [
        ...commonNavigation,
        {
          label: "Mis Viajes",
          path: ROUTES.CONDUCTOR.MIS_VIAJES,
          icon: "travel_explore",
        },
        {
          label: "Rutas",
          path: ROUTES.CONDUCTOR.RUTAS,
          icon: "route",
        },
        {
          label: "Calendario",
          path: ROUTES.CONDUCTOR.CALENDARIO,
          icon: "event",
        },
        {
          label: "Turnos",
          path: ROUTES.CONDUCTOR.TURNOS,
          icon: "schedule",
        },
        {
          label: "Reservas",
          path: ROUTES.CONDUCTOR.RESERVAS,
          icon: "book_online",
        },
        {
          label: "Historial",
          path: ROUTES.CONDUCTOR.HISTORIAL,
          icon: "history",
        },
      ];

    case USER_ROLES.CLIENTE:
      return [
        ...commonNavigation,
        {
          label: "Mis Viajes",
          path: ROUTES.USUARIO.MIS_VIAJES,
          icon: "luggage",
        },
        {
          label: "Reservas",
          path: ROUTES.USUARIO.RESERVAS,
          icon: "book_online",
        },
        {
          label: "Encomiendas",
          path: ROUTES.USUARIO.ENCOMIENDAS,
          icon: "local_shipping",
        },
        {
          label: "Historial",
          path: ROUTES.USUARIO.HISTORIAL,
          icon: "history",
        },
      ];

    default:
      return commonNavigation;
  }
};
