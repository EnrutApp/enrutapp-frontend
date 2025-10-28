import apiClient from "./apiService";

const destinoService = {
  getAll: async () => {
    return apiClient.get("/destino");
  },
};

export default destinoService;