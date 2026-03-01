import apiClient from './apiService';

export const catalogService = {
  getRoles: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get('/roles');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getDocumentTypes: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get('/tipos-documento');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getCities: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get('/ciudades');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getTiposVehiculo: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get('/tipos-vehiculo');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMarcasVehiculo: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get('/marcas-vehiculos');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getConductores: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get('/conductores');
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default catalogService;
