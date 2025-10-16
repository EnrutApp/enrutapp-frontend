import apiClient from "./apiService";

export const catalogService = {
  getRoles: async () => {
    try {
      const response = await apiClient.get("/roles");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getDocumentTypes: async () => {
    try {
      const response = await apiClient.get("/tipos-documento");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getCities: async () => {
    try {
      const response = await apiClient.get("/ciudades");
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default catalogService;
