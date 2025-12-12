import { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { conductorService } from '../api/conductorService';

/**
 * Hook personalizado para verificar si un conductor debe completar su perfil
 * Se ejecuta automáticamente cuando el usuario está autenticado y tiene rol de Conductor
 * @returns {Object} Estado del perfil y funciones de control
 */
export function useRequireConductorProfile() {
  const { user, isAuthenticated } = useAuth();
  const [requiereCompletar, setRequiereCompletar] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [conductor, setConductor] = useState(null);

  useEffect(() => {
    const verificarPerfil = async () => {
      if (!isAuthenticated || !user) {
        setVerificando(false);
        return;
      }

      const rolNombre =
        typeof user.rol === 'string' ? user.rol : user.rol?.nombreRol;

      if (rolNombre !== 'Conductor') {
        setRequiereCompletar(false);
        setVerificando(false);
        return;
      }

      console.log('✅ Es conductor, verificando perfil en BD...');

      try {
        setVerificando(true);
        const response = await conductorService.verificarPerfilCompleto();

        console.log('📊 Respuesta verificación perfil:', response);

        if (response.success) {
          const {
            esConductor,
            completado,
            conductor: conductorData,
          } = response.data;

          console.log('📋 Estado del perfil:', {
            esConductor,
            completado,
            tieneDatos: !!conductorData,
          });

          if (esConductor && !completado) {
            console.log('🚨 Perfil incompleto - Mostrando modal');
            setRequiereCompletar(true);
            setConductor(null);
          } else {
            console.log('✅ Perfil completo - No mostrar modal');
            setRequiereCompletar(false);
            setConductor(conductorData);
          }
        }
      } catch (error) {
        console.error('❌ Error al verificar perfil de conductor:', error);

        setRequiereCompletar(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarPerfil();
  }, [isAuthenticated, user]);

  /**
   * Marca el perfil como completado y actualiza el estado
   */
  const marcarComoCompletado = () => {
    setRequiereCompletar(false);

    window.location.reload();
  };

  return {
    requiereCompletar,
    verificando,
    conductor,
    marcarComoCompletado,
  };
}

export default useRequireConductorProfile;
