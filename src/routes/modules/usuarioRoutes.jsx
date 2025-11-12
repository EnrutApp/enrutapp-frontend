import { lazy } from 'react';
import { ROUTES, USER_ROLES } from '../constants/routeConstants';
import { withErrorBoundary } from '../components/RouteErrorBoundary';
import { withLazyLoading } from '../components/LazyLoadingFallback';
import '@material/web/icon/icon.js';

const HomeUsuario = withLazyLoading(
  lazy(() => import('../../features/home/pages/HomeUsuario')),
  'Cargando dashboard del usuario...'
);

const UserPendingPage = ({ title, description }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="text-center p-8 content-box-outline-4-small rounded-xl max-w-md animate-fade-in">
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="relative bg-blue/10 rounded-full p-4">
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

const UsuarioHomeWithErrorBoundary = withErrorBoundary(HomeUsuario, {
  title: 'Error en Dashboard del Usuario',
  message: 'No se pudo cargar el dashboard del usuario',
});

export const usuarioRoutes = [
  {
    path: ROUTES.USUARIO.ROOT,
    element: <UsuarioHomeWithErrorBoundary />,
    handle: {
      crumb: () => 'Mi Dashboard',
    },
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
      crumb: () => 'Mis Viajes',
    },
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
      crumb: () => 'Mis Reservas',
    },
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
      crumb: () => 'Mis Encomiendas',
    },
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
      crumb: () => 'Historial',
    },
  },
];

export const USUARIO_REQUIRED_ROLE = [USER_ROLES.CLIENTE];
