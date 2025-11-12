import apiClient from "../../../shared/services/apiService";

export const turnoService = {
  /**
   * Obtener todos los turnos
   */
  async getTurnos() {
    return await apiClient.get("/turnos");
  },

  /**
   * Obtener un turno por ID
   */
  async getTurnoById(idTurno) {
    return await apiClient.get(`/turnos/${idTurno}`);
  },

  /**
   * Crear un nuevo turno
   */
  async createTurno(data) {
    return await apiClient.post("/turnos", {
      idConductor: data.idConductor,
      idVehiculo: data.idVehiculo,
      fecha: data.fecha,
      hora: data.hora,
      estado: data.estado || "Programado",
    });
  },

  /**
   * Actualizar un turno existente
   */
  async updateTurno(idTurno, data) {
    return await apiClient.put(`/turnos/${idTurno}`, data);
  },

  /**
   * Eliminar un turno
   */
  async deleteTurno(idTurno) {
    return await apiClient.delete(`/turnos/${idTurno}`);
  },
};

export default turnoService;
