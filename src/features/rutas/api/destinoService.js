import apiClient from '../../../shared/services/apiService';

const destinoService = {
  getAll: async () => {
    return apiClient.get('/destino');
  },
};

export default destinoService;
