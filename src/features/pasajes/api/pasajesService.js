import apiClient from '../../../shared/services/apiService';

const pasajesService = {
  create: async data => {
    return apiClient.post('/pasajes', data);
  },
  getByTurno: async idTurno => {
    return apiClient.get(`/pasajes/turno/${idTurno}`);
  },
  // Alias de compatibilidad (Turno = Viaje)
  getByViaje: async idViaje => {
    return apiClient.get(`/pasajes/turno/${idViaje}`);
  },
};

export default pasajesService;
