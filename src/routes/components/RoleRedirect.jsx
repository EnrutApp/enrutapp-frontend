import { Navigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';

const RoleRedirect = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // No mostrar carga aquí - Layout ya la está mostrando
  // Solo retornar null para que Layout maneje la carga
  if (isLoading) {
    return null;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol del usuario
  const userRole = user?.rol?.nombreRol;

  if (userRole === 'Administrador') return <Navigate to="/admin/" replace />;
  if (userRole === 'Conductor') return <Navigate to="/conductor/" replace />;
  if (userRole === 'Cliente') return <Navigate to="/usuario/" replace />;

  // Si no hay rol definido, redirigir al dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RoleRedirect;
