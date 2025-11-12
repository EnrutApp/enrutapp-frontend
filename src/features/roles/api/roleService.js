import apiClient from '../../../shared/services/apiService';

const normalize = res => res;

const roleService = {
  async getRoles() {
    return normalize(await apiClient.get('/roles'));
  },
  async createRole(data) {
    return normalize(await apiClient.post('/roles', data));
  },
  async updateRole(idRol, data) {
    return normalize(await apiClient.put(`/roles/${idRol}`, data));
  },
  async deleteRole(idRol) {
    return normalize(await apiClient.delete(`/roles/${idRol}`));
  },
};

export default roleService;
