import { lazy } from 'react';
import { ROUTES, USER_ROLES } from '../routeConstants';
import { withErrorBoundary } from '../RouteErrorBoundary';
import { withLazyLoading } from '../LazyLoadingFallback';

// Lazy loading de componentes del usuario/cliente
const HomeUsuario = withLazyLoading(
    lazy(() => import('../../features/home/pages/HomeUsuario')),
    'Cargando dashboard del usuario...'
);

// Componente temporal para páginas pendientes del usuario
const UserPendingPage = ({ title, description }) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md">
            <div className="text-indigo-500 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-600 mb-4">{description}</p>
            <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-sm text-indigo-700 font-medium">
                    📱 Próximamente disponible
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                    Estamos trabajando para traerte esta funcionalidad
                </p>
            </div>
        </div>
    </div>
);

// Componente con error boundary
const UsuarioHomeWithErrorBoundary = withErrorBoundary(HomeUsuario, {
    title: 'Error en Dashboard del Usuario',
    message: 'No se pudo cargar el dashboard del usuario'
});

// Configuración de rutas del usuario/cliente
export const usuarioRoutes = [
    {
        path: ROUTES.USUARIO.ROOT,
        element: <UsuarioHomeWithErrorBoundary />,
        handle: {
            crumb: () => "Mi Dashboard"
        }
    },
    {
        path: ROUTES.USUARIO.MIS_VIAJES,
        element: (
            <UserPendingPage
                title="Mis Viajes"
                description="Consulta el estado de todos tus viajes programados y su progreso en tiempo real"
            />
        ),
        handle: {
            crumb: () => "Mis Viajes"
        }
    },
    {
        path: ROUTES.USUARIO.RESERVAS,
        element: (
            <UserPendingPage
                title="Mis Reservas"
                description="Gestiona tus reservas activas, modifica o cancela según necesites"
            />
        ),
        handle: {
            crumb: () => "Mis Reservas"
        }
    },
    {
        path: ROUTES.USUARIO.ENCOMIENDAS,
        element: (
            <UserPendingPage
                title="Mis Encomiendas"
                description="Rastrea tus encomiendas en tiempo real y consulta su estado de entrega"
            />
        ),
        handle: {
            crumb: () => "Mis Encomiendas"
        }
    },
    {
        path: ROUTES.USUARIO.HISTORIAL,
        element: (
            <UserPendingPage
                title="Historial de Viajes"
                description="Revisa todos tus viajes anteriores, califica el servicio y descarga comprobantes"
            />
        ),
        handle: {
            crumb: () => "Historial"
        }
    }
];

// Todas las rutas requieren rol de Cliente
export const USUARIO_REQUIRED_ROLE = [USER_ROLES.CLIENTE];