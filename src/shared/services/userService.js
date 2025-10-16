import apiClient from "./apiService";

export const userService = {
  cambiarEstado: async (idUsuario, estado) => {
    try {
      const response = await apiClient.patch("/auth/estado", {
        idUsuario,
        estado,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  updateUser: async (data) => {
    try {
      const response = await apiClient.patch("/auth/update", data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  getUsers: async () => {
    try {
      const response = await apiClient.get("/usuarios");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/usuarios/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await apiClient.post("/usuarios", {
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

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/usuarios/${id}`);
      return response;
    } catch (error) {
      // Mejorar el mensaje de error para el usuario
      if (error.statusCode === 409) {
        throw new Error(
          error.message ||
            "No se puede eliminar el usuario porque tiene registros asociados"
        );
      }
      if (error.statusCode === 403) {
        throw new Error(
          error.message || "No tienes permisos para eliminar este usuario"
        );
      }
      throw error;
    }
  },
};

export default userService;
