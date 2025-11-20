import apiClient from '../../../shared/services/apiService';

/**
 * Construye el objeto de datos para crear/actualizar un conductor
 * La estructura ahora usa el usuario como base y agrega información de licencia
 * @param {Object} data - Datos del conductor
 * @returns {Object} Objeto con los datos formateados
 */
function buildConductorData(data) {
  const conductorData = {
    idUsuario: data.idUsuario,
    numeroLicencia: data.numeroLicencia,
    idCategoriaLicencia: data.idCategoriaLicencia,
    fechaVencimientoLicencia: data.fechaVencimientoLicencia,
  };

  if (data.idConductor) {
    conductorData.idConductor = data.idConductor;
  }

  if (data.observaciones) {
    conductorData.observaciones = data.observaciones;
  }

  return conductorData;
}

export const conductorService = {
  /**
   * Obtiene todos los conductores con información completa
   * Incluye información del usuario asociado, categoría de licencia y estado de vigencia
   */
  async getConductores() {
    return await apiClient.get('/conductores');
  },

  /**
   * Obtiene un conductor por ID con información detallada
   * @param {string} idConductor - ID del conductor
   */
  async getConductorById(idConductor) {
    return await apiClient.get(`/conductores/${idConductor}`);
  },

  /**
   * Crea un nuevo conductor asociado a un usuario existente
   * El usuario debe tener rol de conductor
   * @param {Object} data - Datos del conductor
   * @param {string} data.idUsuario - ID del usuario
   * @param {string} data.numeroLicencia - Número de licencia
   * @param {string} data.idCategoriaLicencia - ID de la categoría (A1, A2, B1, etc.)
   * @param {string} data.fechaVencimientoLicencia - Fecha de vencimiento (YYYY-MM-DD)
   * @param {string} [data.observaciones] - Observaciones adicionales
   */
  async createConductor(data) {
    const conductorData = buildConductorData(data);
    return await apiClient.post('/conductores', conductorData);
  },

  /**
   * Actualiza la información de un conductor existente
   * @param {string} idConductor - ID del conductor
   * @param {Object} data - Datos a actualizar
   */
  async updateConductor(idConductor, data) {
    const conductorData = buildConductorData(data);
    return await apiClient.put(`/conductores/${idConductor}`, conductorData);
  },

  /**
   * Verifica el estado de la licencia de un conductor
   * @param {string} idConductor - ID del conductor
   * @returns {Object} Estado de la licencia (VIGENTE, PROXIMA_A_VENCER, VENCIDA)
   */
  async verificarLicencia(idConductor) {
    return await apiClient.get(
      `/conductores/${idConductor}/verificar-licencia`
    );
  },

  /**
   * Elimina un conductor del sistema
   * @param {string} idConductor - ID del conductor
   */
  async deleteConductor(idConductor) {
    return await apiClient.delete(`/conductores/${idConductor}`);
  },

  /**
   * Verifica si el perfil de conductor del usuario autenticado está completo
   * @returns {Object} Estado del perfil { esConductor, completado, conductor }
   */
  async verificarPerfilCompleto() {
    return await apiClient.get('/conductores/verificar-perfil/me');
  },

  /**
   * Completa el perfil de conductor del usuario autenticado (self-service)
   * @param {Object} data - Datos de la licencia
   * @param {string} data.idCategoriaLicencia - ID de la categoría de licencia
   * @param {string} data.fechaVencimientoLicencia - Fecha de vencimiento (YYYY-MM-DD)
   * @param {string} [data.observaciones] - Observaciones adicionales
   */
  async completarPerfil(data) {
    const perfilData = {
      idCategoriaLicencia: data.idCategoriaLicencia,
      fechaVencimientoLicencia: data.fechaVencimientoLicencia,
    };

    if (data.observaciones) {
      perfilData.observaciones = data.observaciones;
    }

    return await apiClient.post('/conductores/completar-perfil/me', perfilData);
  },
};

export default conductorService;
