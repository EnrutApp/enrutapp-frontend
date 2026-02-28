import apiClient from '../../../shared/services/apiService';

export const userService = {
  cambiarEstado: async (idUsuario, estado) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.patch('/auth/estado', {
        idUsuario,
        estado,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateUser: async data => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.patch('/auth/update', data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  getUsers: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get('/usuarios');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getClientes: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get('/usuarios', {
        params: { rol: 'cliente' },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUserById: async id => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.get(`/usuarios/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createUser: async userData => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await apiClient.post('/usuarios', {
        correo: userData.email,
        contrasena: userData.password,
        nombre: userData.name,
        numDocumento: userData.documentNumber,
        telefono: userData.phone,
        direccion: userData.address,
        ciudad: userData.city,
        idRol: userData.roleId,
        tipoDoc: userData.documentType,
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async id => {
    try {
      const response = await apiClient.delete(`/usuarios/${id}`);
      return response;
    } catch (error) {
      if (error.statusCode === 409) {
        throw new Error(
          error.message ||
            'No se puede eliminar el usuario porque tiene registros asociados'
        );
      }
      if (error.statusCode === 403) {
        throw new Error(
          error.message || 'No tienes permisos para eliminar este usuario'
        );
      }
      throw error;
    }
  },

  verificarPerfilCliente: async () => {
    // eslint-disable-next-line no-useless-catch
    try {
      return await apiClient.get('/usuarios/verificar-perfil/me');
    } catch (error) {
      throw error;
    }
  },

  completarPerfilCliente: async data => {
    // eslint-disable-next-line no-useless-catch
    try {
      return await apiClient.post('/usuarios/completar-perfil/me', data);
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
