import apiClient from './apiService';

const reservaService = {
  // Obtener todas las reservas
  getAllReservas: async () => {
    try {
      const response = await apiClient.get('/reservas');
      
      console.log('Respuesta completa de getAllReservas:', response);
      
      // El interceptor de axios ya devuelve response.data
      // Así que response es: { data: Array, meta: {...}, totalPages: number }
      let data = [];
      
      // Extraer el array de datos
      if (response && response.data && Array.isArray(response.data)) {
        data = response.data;
        console.log('Datos extraídos correctamente:', data);
      } else if (Array.isArray(response)) {
        data = response;
        console.log('Respuesta es un array directo:', data);
      } else {
        console.warn('Estructura de respuesta no reconocida:', response);
      }
      
      console.log('Total de reservas extraídas:', data.length);
      
      return {
        success: true,
        data: data,
        message: `${data.length} reserva(s) obtenida(s) correctamente`,
        meta: response.meta,
        totalPages: response.totalPages
      };
    } catch (error) {
      console.error('Error en getAllReservas:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        errorData: error.error
      });
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener las reservas',
        error: error
      };
    }
  },

  // Obtener una reserva por ID
  getReservaById: async (id) => {
    try {
      if (!id) throw new Error('El ID de la reserva es requerido');
      
      const response = await apiClient.get(`/reservas/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al obtener reserva');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Reserva obtenida correctamente'
      };
    } catch (error) {
      console.error('Error en getReservaById:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al obtener la reserva',
        error: error
      };
    }
  },

  // Crear una nueva reserva
  createReserva: async (data) => {
    try {
      // Validar datos requeridos
      if (!data.origen) throw new Error('El origen es requerido');
      if (!data.destino) throw new Error('El destino es requerido');
      if (!data.fecha) throw new Error('La fecha es requerida');
      if (!data.hora) throw new Error('La hora es requerida');
      if (!data.idConductor) throw new Error('El ID del conductor es requerido');
      if (!data.pasajeros || data.pasajeros.length === 0) {
        throw new Error('Debe haber al menos un pasajero');
      }

      const response = await apiClient.post('/reservas', data);

      if (!response.success) {
        throw new Error(response.message || 'Error al crear reserva');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Reserva creada correctamente'
      };
    } catch (error) {
      console.error('Error en createReserva:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al crear la reserva',
        error: error
      };
    }
  },

  // Actualizar una reserva
  updateReserva: async (id, data) => {
    try {
      if (!id) throw new Error('El ID de la reserva es requerido');
      if (!data) throw new Error('Los datos a actualizar son requeridos');

      console.log('updateReserva - ID recibido:', id, 'Tipo:', typeof id);
      console.log('updateReserva - Datos a enviar:', data);

      const response = await apiClient.put(`/reservas/${id}`, data);

      if (!response.success) {
        throw new Error(response.message || 'Error al actualizar reserva');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Reserva actualizada correctamente'
      };
    } catch (error) {
      console.error('Error en updateReserva:', error);
      console.error('Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        errorData: error.error
      });
      return {
        success: false,
        data: null,
        message: error.message || 'Error al actualizar la reserva',
        error: error
      };
    }
  },

  // Eliminar una reserva
  deleteReserva: async (id) => {
    try {
      if (!id) throw new Error('El ID de la reserva es requerido');

      const response = await apiClient.delete(`/reservas/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar reserva');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Reserva eliminada correctamente'
      };
    } catch (error) {
      console.error('Error en deleteReserva:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al eliminar la reserva',
        error: error
      };
    }
  },

  // Cambiar estado de reserva
  toggleReservaState: async (id, estado) => {
    try {
      if (!id) throw new Error('El ID de la reserva es requerido');
      if (!estado) throw new Error('El estado es requerido');
      
      // Validar que el estado sea válido
      const estadosValidos = ['Pendiente', 'Activo', 'Completada', 'Cancelada'];
      if (!estadosValidos.includes(estado)) {
        throw new Error(`Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`);
      }

      const response = await apiClient.put(`/reservas/${id}`, { estado });

      if (!response.success) {
        throw new Error(response.message || 'Error al cambiar estado');
      }

      return {
        success: true,
        data: response.data,
        message: response.message || 'Estado actualizado correctamente'
      };
    } catch (error) {
      console.error('Error en toggleReservaState:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error al cambiar el estado',
        error: error
      };
    }
  },

  // Obtener reservas por estado
  getReservasByState: async (estado) => {
    try {
      if (!estado) throw new Error('El estado es requerido');

      const response = await apiClient.get(`/reservas?estado=${estado}`);

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener reservas por estado');
      }

      const data = Array.isArray(response.data) ? response.data : response.data?.reservas || [];
      return {
        success: true,
        data: data,
        message: response.message || 'Reservas obtenidas correctamente'
      };
    } catch (error) {
      console.error('Error en getReservasByState:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error al obtener las reservas',
        error: error
      };
    }
  }
};

export default reservaService;
