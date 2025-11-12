import apiClient from '../../../shared/services/apiService';

const ubicacionesService = {
  async getAll() {
    const res = await apiClient.get('/ubicaciones');

    if (res?.data && Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object' && Array.isArray(res.data))
      return res.data;

    return [];
  },

  async getById(id) {
    const res = await apiClient.get(`/ubicaciones/${id}`);
    return res;
  },

  async create(data) {
    const res = await apiClient.post('/ubicaciones', data);
    return res;
  },

  async update(id, data) {
    const res = await apiClient.put(`/ubicaciones/${id}`, data);
    return res;
  },

  async remove(id) {
    const res = await apiClient.delete(`/ubicaciones/${id}`);
    return res;
  },

  async forceDelete(id) {
    const res = await apiClient.delete(`/ubicaciones/${id}/force`);
    return res;
  },

  async removeBatch(ids) {
    const res = await apiClient.post('/ubicaciones/batch-delete', { ids });
    return res;
  },

  async getRutasActivas(id) {
    const res = await apiClient.get(`/ubicaciones/${id}/rutas-activas`);
    return res;
  },

  async getRutas(id) {
    const res = await apiClient.get(`/ubicaciones/${id}/rutas`);
    return res;
  },
};

export default ubicacionesService;
