import apiClient from '../../../shared/services/apiService';

const viajesService = {
  getViajes: async () => {
    return apiClient.get('/viajes');
  },

  getViajeById: async id => {
    return apiClient.get(`/viajes/${id}`);
  },

  createViaje: async data => {
    return apiClient.post('/viajes', data);
  },

  updateViaje: async (id, data) => {
    return apiClient.patch(`/viajes/${id}`, data);
  },

  deleteViaje: async id => {
    return apiClient.delete(`/viajes/${id}`);
  },
};

export default viajesService;
