import apiClient from "./apiService";

/**
 * Servicio para obtener viajes disponibles
 * Integra datos de turnos con vehículos
 */
export const viajeService = {
  /**
   * Buscar viajes disponibles según criterios
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.origen - Ciudad de origen
   * @param {string} params.destino - Ciudad de destino
   * @param {string} params.fecha - Fecha en formato YYYY-MM-DD
   * @param {string} params.fechaRegreso - Fecha de regreso (opcional)
   * @returns {Promise<Array>} Array de viajes disponibles
   */
  async buscarViajes(params) {
    try {
      const queryParams = new URLSearchParams({
        origen: params.origen,
        destino: params.destino,
        fecha: params.fecha,
      });

      if (params.fechaRegreso) {
        queryParams.append("fechaRegreso", params.fechaRegreso);
      }

      const response = await apiClient.get(`/viajes/buscar?${queryParams}`);
      return response.data || [];
    } catch (error) {
      console.error("Error al buscar viajes:", error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un viaje específico
   * @param {number} viajeId - ID del viaje
   * @returns {Promise<Object>} Datos del viaje
   */
  async obtenerViajeById(viajeId) {
    try {
      const response = await apiClient.get(`/viajes/${viajeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener viaje ${viajeId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener viajes por ruta
   * @param {number} rutaId - ID de la ruta
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} Array de viajes en esa ruta
   */
  async obtenerViajePorRuta(rutaId, fecha) {
    try {
      const response = await apiClient.get(
        `/viajes/ruta/${rutaId}?fecha=${fecha}`
      );
      return response.data || [];
    } catch (error) {
      console.error("Error al obtener viajes por ruta:", error);
      throw error;
    }
  },

  /**
   * Obtener asientos disponibles de un viaje
   * @param {number} viajeId - ID del viaje
   * @returns {Promise<Object>} Información de asientos
   */
  async obtenerAsientosDisponibles(viajeId) {
    try {
      const response = await apiClient.get(`/viajes/${viajeId}/asientos`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener asientos del viaje ${viajeId}:`, error);
      throw error;
    }
  },

  /**
   * Guardar reserva de viaje
   * @param {Object} reserva - Datos de la reserva
   * @returns {Promise<Object>} Datos de la reserva creada
   */
  async crearReserva(reserva) {
    try {
      const response = await apiClient.post("/reservas", {
        viajeId: reserva.viajeId,
        usuarioId: reserva.usuarioId,
        asientosSeleccionados: reserva.asientosSeleccionados,
        precioTotal: reserva.precioTotal,
        estado: "Pendiente",
      });
      return response.data;
    } catch (error) {
      console.error("Error al crear reserva:", error);
      throw error;
    }
  },

  /**
   * Guardar búsqueda realizada por usuario
   * @param {Object} busqueda - Datos de la búsqueda
   * @returns {Promise<Object>} Datos de la búsqueda guardada
   */
  async guardarBusqueda(busqueda) {
    try {
      const response = await apiClient.post("/busquedas", {
        origen: busqueda.origen,
        destino: busqueda.destino,
        fecha: busqueda.fecha,
        fechaRegreso: busqueda.fechaRegreso || null,
        usuarioId: busqueda.usuarioId || null,
        fechaBusqueda: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error("Error al guardar búsqueda:", error);
      throw error;
    }
  },
};

export default viajeService;
