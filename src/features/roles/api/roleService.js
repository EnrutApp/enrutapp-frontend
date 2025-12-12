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
  async deleteRole(id, cascade = false) {
    const url = cascade ? `/roles/${id}?cascade=true` : `/roles/${id}`;
    const response = await apiClient.delete(url);
    return normalize(response);
  },
  async getAllPermissions() {
    return normalize(await apiClient.get('/roles/permissions-list'));
  },
  async getRolePermissions(idRol) {
    return normalize(await apiClient.get(`/roles/${idRol}/permissions`));
  },
  async updateRolePermissions(idRol, permissions) {
    return normalize(
      await apiClient.put(`/roles/${idRol}/permissions`, { permissions })
    );
  },
};

export default roleService;
