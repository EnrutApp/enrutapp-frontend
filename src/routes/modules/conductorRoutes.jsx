import { lazy } from 'react';
import { ROUTES, USER_ROLES } from '../routeConstants';
import { withErrorBoundary } from '../RouteErrorBoundary';
import { withLazyLoading } from '../LazyLoadingFallback';

// Lazy loading de componentes del conductor
const HomeConductor = withLazyLoading(
    lazy(() => import('../../features/home/pages/HomeConductor')),
    'Cargando dashboard del conductor...'
);

const RutasConductor = withLazyLoading(
    lazy(() => import('../../features/rutas/pages/RutasConductor')),
    'Cargando rutas del conductor...'
);

// Componente temporal para páginas pendientes
const PendingPage = ({ title, description }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <div className="text-blue-500 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{description}</p>
            <div className="mt-4 text-sm text-blue-600">
                Funcionalidad próximamente disponible
            </div>
        </div>
    </div>
);

// Componentes con error boundary
const ConductorHomeWithErrorBoundary = withErrorBoundary(HomeConductor, {
    title: 'Error en Dashboard del Conductor',
    message: 'No se pudo cargar el dashboard del conductor'
});

const RutasConductorWithErrorBoundary = withErrorBoundary(RutasConductor, {
    title: 'Error en Rutas del Conductor',
    message: 'No se pudo cargar las rutas del conductor'
});

// Configuración de rutas del conductor
export const conductorRoutes = [
    {
        path: ROUTES.CONDUCTOR.ROOT,
        element: <ConductorHomeWithErrorBoundary />,
        handle: {
            crumb: () => "Dashboard Conductor"
        }
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
            crumb: () => "Mis Viajes"
        }
    },
    {
        path: ROUTES.CONDUCTOR.CALENDARIO,
        element: (
            <PendingPage
                title="Calendario"
                description="Gestiona tu calendario de trabajo y horarios disponibles"
            />
        ),
        handle: {
            crumb: () => "Calendario"
        }
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
            crumb: () => "Turnos"
        }
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
            crumb: () => "Reservas"
        }
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
            crumb: () => "Historial"
        }
    },
    {
        path: ROUTES.CONDUCTOR.RUTAS,
        element: <RutasConductorWithErrorBoundary />,
        handle: {
            crumb: () => "Rutas"
        }
    }
];

// Todas las rutas requieren rol de Conductor
export const CONDUCTOR_REQUIRED_ROLE = [USER_ROLES.CONDUCTOR];