import { lazy } from 'react';
import { ROUTES, USER_ROLES } from '../constants/routeConstants';
import { withErrorBoundary } from '../components/RouteErrorBoundary';
import { withLazyLoading } from '../components/LazyLoadingFallback';
import '@material/web/icon/icon.js';

const HomeConductor = withLazyLoading(
  lazy(() => import('../../features/home/pages/HomeConductor')),
  'Cargando dashboard del conductor...'
);

const CalendarioPage = withLazyLoading(
  lazy(() => import('../../features/calendario/CalendarioPage')),
  'Cargando calendario...'
);

const RutasConductor = withLazyLoading(
  lazy(() => import('../../features/rutas/pages/RutasConductor')),
  'Cargando rutas del conductor...'
);

const PendingPage = ({ title, description }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center p-8 content-box-outline-4-small rounded-xl max-w-md animate-fade-in">
      <div className="flex items-center justify-center ">
        <div className="relative">
          <div className="relative p-4">
            <md-icon className="text-blue text-3xl">build</md-icon>
          </div>
        </div>
      </div>

      <h2 className="h3 font-medium text-primary mb-3">{title}</h2>
      <p className="subtitle1 text-secondary mb-6">{description}</p>

      <div className="content-box-outline-4-small rounded-lg p-4">
        <div className="flex items-center gap-3">
          <md-icon className="text-blue">schedule</md-icon>
          <p className="text-sm text-primary font-medium">
            Funcionalidad próximamente disponible
          </p>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fade-in {
                0% {
                    opacity: 0;
                    transform: translateY(10px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .animate-fade-in {
                animation: fade-in 0.4s ease-out;
            }
        `,
        }}
      />
    </div>
  </div>
);

const ConductorHomeWithErrorBoundary = withErrorBoundary(HomeConductor, {
  title: 'Error en Dashboard del Conductor',
  message: 'No se pudo cargar el dashboard del conductor',
});

const CalendarioWithErrorBoundary = withErrorBoundary(CalendarioPage, {
  title: 'Error en Calendario',
  message: 'No se pudo cargar el calendario',
});

const RutasConductorWithErrorBoundary = withErrorBoundary(RutasConductor, {
  title: 'Error en Rutas del Conductor',
  message: 'No se pudo cargar las rutas del conductor',
});

export const conductorRoutes = [
  {
    path: ROUTES.CONDUCTOR.ROOT,
    element: <ConductorHomeWithErrorBoundary />,
    handle: {
      crumb: () => 'Dashboard Conductor',
    },
  },
  {
    path: ROUTES.CONDUCTOR.MIS_VIAJES,
    element: (
      <PendingPage
        title="Mis Viajes"
        description="Aquí podrás ver todos tus viajes programados y completados"
      />
    ),
    handle: {
      crumb: () => 'Mis Viajes',
    },
  },
  {
    path: ROUTES.CONDUCTOR.CALENDARIO,
    element: <CalendarioWithErrorBoundary />,
    handle: {
      crumb: () => 'Calendario',
    },
  },
  {
    path: ROUTES.CONDUCTOR.TURNOS,
    element: (
      <PendingPage
        title="Turnos"
        description="Consulta y gestiona tus turnos de trabajo"
      />
    ),
    handle: {
      crumb: () => 'Turnos',
    },
  },
  {
    path: ROUTES.CONDUCTOR.RESERVAS,
    element: (
      <PendingPage
        title="Reservas"
        description="Ve las reservas asignadas a tus rutas"
      />
    ),
    handle: {
      crumb: () => 'Reservas',
    },
  },
  {
    path: ROUTES.CONDUCTOR.HISTORIAL,
    element: (
      <PendingPage
        title="Historial"
        description="Consulta el historial de todos tus viajes realizados"
      />
    ),
    handle: {
      crumb: () => 'Historial',
    },
  },
  {
    path: ROUTES.CONDUCTOR.RUTAS,
    element: <RutasConductorWithErrorBoundary />,
    handle: {
      crumb: () => 'Rutas',
    },
  },
];

export const CONDUCTOR_REQUIRED_ROLE = [USER_ROLES.CONDUCTOR];
