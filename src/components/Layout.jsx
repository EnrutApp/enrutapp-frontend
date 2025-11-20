import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SideBar from '../shared/components/sideBar/SideBar';
import { useAuth } from '../shared/context/AuthContext';
import { useLoading } from '../shared/context/LoadingContext';
import { useRequireConductorProfile } from '../features/conductores/hooks/useRequireConductorProfile';
import '@material/web/progress/linear-progress.js';

const Layout = () => {
  const { isLoading, isAuthenticated, user, isLoggingOut } = useAuth();
  const { requiereCompletar, verificando } = useRequireConductorProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Solo redirigir si no está cargando y está autenticado
    if (!isLoading && !verificando && isAuthenticated && requiereCompletar && location.pathname !== '/completar-perfil') {
      navigate('/completar-perfil', { replace: true });
    }
  }, [requiereCompletar, verificando, isLoading, isAuthenticated, navigate, location]);

  // Detectar cuando todo está listo para mostrar el contenido
  useEffect(() => {
    if (!isLoading && !verificando && isAuthenticated && user?.rol?.nombreRol) {
      // Delay un poco más largo para asegurar que el componente lazy esté listo
      // y evitar que se muestre la carga del lazy-loading
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsInitialLoad(true);
    }
  }, [isLoading, verificando, isAuthenticated, user?.rol?.nombreRol]);

  // Mostrar carga solo si se está verificando autenticación o perfil
  if (isLoading || verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center" style={{ width: '340px' }}>
          <md-linear-progress
            indeterminate
            style={{ width: '100%', marginBottom: '24px' }}
          ></md-linear-progress>
          <span className="text-secondary text-lg" style={{ textAlign: 'center' }}>
            {isLoggingOut ? 'Saliendo...' : 'Cargando aplicación...'}
          </span>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado pero faltan datos o está en carga inicial
  if (!user?.rol?.nombreRol || isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center" style={{ width: '340px' }}>
          <md-linear-progress
            indeterminate
            style={{ width: '100%', marginBottom: '24px' }}
          ></md-linear-progress>
          <span className="text-secondary text-lg" style={{ textAlign: 'center' }}>
            {isLoggingOut ? 'Saliendo...' : 'Cargando aplicación...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <SideBar />
      <main className="flex-1 ml-[210px] p-4 overflow-y-auto scrollbar-hide relative">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
