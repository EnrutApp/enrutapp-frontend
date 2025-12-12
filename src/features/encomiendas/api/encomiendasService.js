import apiClient from '../../../shared/services/apiService';

const encomiendasService = {
  create: async data => {
    return apiClient.post('/encomiendas', data);
  },
  getByTurno: async idTurno => {
    return apiClient.get(`/encomiendas/turno/${idTurno}`);
  },
  // Alias de compatibilidad (Turno = Viaje)
  getByViaje: async idViaje => {
    return apiClient.get(`/encomiendas/turno/${idViaje}`);
  },
  updateEstado: async (id, estado) => {
    return apiClient.patch(`/encomiendas/${id}/estado`, { estado });
  },
};

export default encomiendasService;
