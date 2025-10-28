import apiClient from "./apiService";

const ubicacionesService = {
  getAll: async () => {
    return apiClient.get("/ubicaciones");
  },

  getById: async (id) => {
    return apiClient.get(`/ubicaciones/${id}`);
  },

  create: async (data) => {
    return apiClient.post("/ubicaciones", data);
  },

  update: async (id, data) => {
    return apiClient.patch(`/ubicaciones/${id}`, data);
  },

  remove: async (id) => {
    return apiClient.delete(`/ubicaciones/${id}`);
  },
};

export default ubicacionesService;