import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { ROUTES } from '../constants/routeConstants';
import { useEffect } from 'react';
import '@material/web/icon/icon.js';
import '@material/web/progress/linear-progress.js';

const UnauthorizedAccess = ({
  userRole,
  requiredRoles,
  requiredPermission,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4 list-enter">
    <div className="max-w-md w-full content-box-outline-4-small rounded-xl p-8 text-center animate-fade-in">
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="relative bg-orange/10 rounded-full p-4">
            <md-icon className="text-red text-3xl">shield_locked</md-icon>
          </div>
        </div>
      </div>

      <h2 className="h3 font-medium text-primary">Acceso no autorizado.</h2>

      <p className="subtitle1 text-secondary mb-6">
        No tienes permisos para acceder a esta página.
      </p>

      <div className="content-box-outline-4-small rounded-lg p-4 mb-6 text-left space-y-3">
        <div className="flex items-start gap-3">
          <md-icon className="text-primary text-base mt-0.5">person</md-icon>
          <div className="flex-1">
            <p className="text-xs text-secondary font-medium mb-0.5">Tu rol</p>
            <p className="subtitle2 text-primary font-medium">
              {userRole || 'No asignado'}
            </p>
          </div>
        </div>

        <div className="border-t border-border"></div>

        <div className="flex items-start gap-3">
          <md-icon className="text-primary text-base mt-0.5">
            admin_panel_settings
          </md-icon>
          <div className="flex-1">
            <p className="text-xs text-secondary font-medium mb-0.5">
              Requerimientos
            </p>
            <p className="subtitle2 text-primary font-medium">
              {requiredPermission
                ? `Permiso: ${requiredPermission}`
                : `Roles: ${requiredRoles?.join(', ') || 'No especificado'}`}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.history.back()}
        className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
      >
        <md-icon className="text-base">arrow_back</md-icon>
        Volver atrás
      </button>

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

const ProtectedRoute = ({
  allowedRoles,
  requiredPermission,
  children,
  requireAuth = true,
  fallbackPath = ROUTES.DASHBOARD,
  loadingMessage = 'Verificando acceso...',
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="flex flex-col items-center justify-center"
          style={{ width: '340px' }}
        >
          <md-linear-progress
            indeterminate
            style={{ width: '100%', marginBottom: '24px' }}
          ></md-linear-progress>
          <span
            className="text-secondary text-lg"
            style={{ textAlign: 'center' }}
          >
            {loadingMessage}
          </span>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />
    );
  }

  if (!requireAuth) {
    return children;
  }

  const userRole = user?.rol?.nombreRol;

  if (requiredPermission) {
    if (!userRole) return <Navigate to={fallbackPath} replace />;

    const userPermissions =
      user?.rol?.rolesPermisos?.map(rp => rp.permiso.codigo) || [];
    const hasPermission = userPermissions.includes(requiredPermission);

    const isAdmin = userRole === 'Administrador';

    if (hasPermission || isAdmin) {
      return children;
    }

    return (
      <UnauthorizedAccess
        userRole={userRole}
        requiredPermission={requiredPermission}
      />
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      if (userRole) {
        return (
          <UnauthorizedAccess
            userRole={userRole}
            requiredRoles={allowedRoles}
          />
        );
      } else {
        return <Navigate to={fallbackPath} replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;
