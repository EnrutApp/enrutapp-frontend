import apiClient from './apiService';

const conductorService = {
  // Obtener todos los conductores
  getAllConductores: async () => {
    try {
      console.log('📡 Obteniendo todos los conductores...');
      const response = await apiClient.get('/conductores');
      console.log('✅ Conductores obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener conductores:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al cargar conductores'
      };
    }
  },

  // Obtener un conductor por ID
  getConductorById: async (id) => {
    try {
      console.log(`📡 Obteniendo conductor ${id}...`);
      const response = await apiClient.get(`/conductores/${id}`);
      console.log('✅ Conductor obtenido:', response);
      return response;
    } catch (error) {
      console.error(`❌ Error al obtener conductor ${id}:`, error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al cargar conductor'
      };
    }
  },

  // Obtener conductores activos
  getActiveConductores: async () => {
    try {
      console.log('📡 Obteniendo conductores activos...');
      // Intentar primero con /conductores/activos
      try {
        const response = await apiClient.get('/conductores/activos');
        console.log('✅ Conductores activos obtenidos:', response);
        return response;
      } catch (error1) {
        console.warn('⚠️ Endpoint /conductores/activos no disponible, intentando /conductores?estado=true');
        // Si no funciona, intentar con estado=true
        const response = await apiClient.get('/conductores?estado=true');
        console.log('✅ Conductores activos obtenidos:', response);
        return response;
      }
    } catch (error) {
      console.error('❌ Error al obtener conductores activos:', error);
      // Devolver datos demo para desarrollo
      console.log('💡 Usando datos de demostración...');
      return {
        success: true,
        data: [
          { id: 1, idConductor: 1, nombre: 'Andrés Conde', estado: true, vehiculo: 'Toyota' },
          { id: 2, idConductor: 2, nombre: 'Carlos Pérez', estado: true, vehiculo: 'Nissan' },
          { id: 3, idConductor: 3, nombre: 'Juan López', estado: true, vehiculo: 'Ford' }
        ],
        message: 'Datos de demostración (Backend no disponible)'
      };
    }
  },

  // Crear conductor
  createConductor: async (data) => {
    try {
      const response = await apiClient.post('/conductores', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar conductor
  updateConductor: async (id, data) => {
    try {
      const response = await apiClient.put(`/conductores/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar conductor
  deleteConductor: async (id) => {
    try {
      const response = await apiClient.delete(`/conductores/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default conductorService;
