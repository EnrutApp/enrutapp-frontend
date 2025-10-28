import apiClient from "./apiService";

const origenService = {
  getAll: async () => {
    return apiClient.get("/origen");
  },
};

export default origenService;