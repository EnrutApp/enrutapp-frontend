import apiClient from '../../../shared/services/apiService';

const pasajesService = {
  create: async data => {
    return apiClient.post('/pasajes', data);
  },
  getByViaje: async idViaje => {
    return apiClient.get(`/pasajes/viaje/${idViaje}`);
  },
};

export default pasajesService;
