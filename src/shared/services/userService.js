import apiClient from "./apiService";

export const userService = {
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

  updateUser: async (id, userData) => {
    try {
      const updateData = {};

      if (userData.email) updateData.correo = userData.email;
      if (userData.password) updateData.contrasena = userData.password;
      if (userData.name) updateData.nombre = userData.name;
      if (userData.documentNumber)
        updateData.numDocumento = userData.documentNumber;
      if (userData.phone) updateData.telefono = userData.phone;
      if (userData.address) updateData.direccion = userData.address;
      if (userData.city) updateData.ciudad = userData.city;
      if (userData.roleId) updateData.idRol = userData.roleId;
      if (userData.documentType) updateData.tipoDoc = userData.documentType;
      if (userData.estado !== undefined) updateData.estado = userData.estado;

      const response = await apiClient.put(`/usuarios/${id}`, updateData);
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
      throw error;
    }
  },
};

export default userService;
