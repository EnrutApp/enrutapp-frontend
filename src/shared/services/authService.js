import apiClient from "./apiService";

export const authService = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", {
        correo: credentials.email,
        contrasena: credentials.password,
      });

      if (response.success && response.data) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token_expires_in", response.data.expires_in);
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", {
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

  getProfile: async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      return response;
    } catch (error) {
      throw error;
    }
  },

  getMe: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.patch("/auth/change-password", {
        contrasenaActual: passwordData.currentPassword,
        nuevaContrasena: passwordData.newPassword,
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expires_in");
    window.location.href = "/login";
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("access_token");
    return !!token;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem("access_token");
  },
};

export default authService;
