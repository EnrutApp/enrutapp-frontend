import apiClient from "./apiService";
const rutasService = {
  getAll: async () => {
    return apiClient.get("/rutas");
  },

  getById: async (id) => {
    return apiClient.get(`/rutas/${id}`);
  },

  create: async (data) => {
    return apiClient.post("/rutas", data);
  },

  update: async (id, data) => {
    return apiClient.patch(`/rutas/${id}`, data);
  },

  remove: async (id) => {
    return apiClient.delete(`/rutas/${id}`);
  },
};

export default rutasService;
