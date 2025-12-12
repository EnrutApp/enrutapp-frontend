import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import conductorService from '../../features/conductores/api/conductorService';
import userService from '../../features/usuarios/api/userService';

const RoleRedirect = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [target, setTarget] = useState(null);
  const [checking, setChecking] = useState(true);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    let cancelled = false;

    const resolveTarget = async () => {
      const userRole = user?.rol?.nombreRol;

      try {
        if (userRole === 'Conductor') {
          const res = await conductorService.verificarPerfilCompleto();
          if (
            res?.success &&
            res?.data?.esConductor &&
            res?.data?.completado === false
          ) {
            if (!cancelled) setTarget('/completar-perfil');
            return;
          }
        }

        if (userRole === 'Cliente') {
          const res = await userService.verificarPerfilCliente();
          if (
            res?.success &&
            res?.data?.esCliente &&
            res?.data?.completado === false
          ) {
            if (!cancelled) setTarget('/completar-perfil');
            return;
          }
        }
      } catch {
        // Si falla la verificación, continuamos con el redirect por rol
      }

      if (!cancelled) {
        if (userRole === 'Administrador') setTarget('/admin/');
        else if (userRole === 'Conductor') setTarget('/conductor/');
        else if (userRole === 'Cliente') setTarget('/usuario/');
        else setTarget('/dashboard');
      }
    };

    setChecking(true);
    resolveTarget().finally(() => {
      if (!cancelled) setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (checking || !target) {
    return null;
  }

  return <Navigate to={target} replace />;
};

export default RoleRedirect;
