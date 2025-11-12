import apiClient from '../../../shared/services/apiService';

const origenService = {
  getAll: async () => {
    return apiClient.get('/origen');
  },
};

export default origenService;
