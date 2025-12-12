import apiClient from '../../../shared/services/apiService';

const encomiendasService = {
  create: async data => {
    return apiClient.post('/encomiendas', data);
  },
  getByViaje: async idViaje => {
    return apiClient.get(`/encomiendas/viaje/${idViaje}`);
  },
  updateEstado: async (id, estado) => {
    return apiClient.patch(`/encomiendas/${id}/estado`, { estado });
  },
};

export default encomiendasService;
