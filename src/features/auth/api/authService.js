import apiClient from '../../../shared/services/apiService';

export const authService = {
  login: async credentials => {
    const response = await apiClient.post('/auth/login', {
      correo: credentials.email,
      contrasena: credentials.password,
    });

    if (response.success && response.data?.access_token) {
      const token = response.data.access_token;
      const refreshToken = response.data.refresh_token;

      if (
        !token ||
        typeof token !== 'string' ||
        token.split('.').length !== 3
      ) {
        throw new Error('Token inválido recibido del servidor');
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expires_in');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token_expires_in');

      const storage = credentials.remember ? localStorage : sessionStorage;
      storage.setItem('access_token', token);

      if (refreshToken) {
        storage.setItem('refresh_token', refreshToken);
      }

      if (response.data.user) {
        storage.setItem('user', JSON.stringify(response.data.user));
      }

      if (response.data.expires_in) {
        storage.setItem('token_expires_in', response.data.expires_in);
      }
    }

    return response;
  },

  register: async userData => {
    const payload = {
      correo: userData.email,
      contrasena: userData.password,
      nombre: userData.name,
      telefono: userData.phone,
      direccion: userData.address,
      idCiudad: Number(userData.idCiudad),
      idRol: String(userData.roleId || '').trim(),
      tipoDoc: String(userData.documentType || '').trim(),
    };

    const response = await apiClient.post('/auth/register', payload);
    return response;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response;
  },

  changePassword: async passwordData => {
    const response = await apiClient.patch('/auth/change-password', {
      contrasenaActual: passwordData.currentPassword,
      nuevaContrasena: passwordData.newPassword,
    });
    return response;
  },

  refreshAccessToken: async () => {
    const refreshToken =
      localStorage.getItem('refresh_token') ||
      sessionStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });

    if (response.success && response.data?.access_token) {
      const token = response.data.access_token;
      const storage = localStorage.getItem('refresh_token')
        ? localStorage
        : sessionStorage;

      storage.setItem('access_token', token);

      if (response.data.user) {
        storage.setItem('user', JSON.stringify(response.data.user));
      }

      if (response.data.expires_in) {
        storage.setItem('token_expires_in', response.data.expires_in);
      }

      return response;
    }

    throw new Error('No se pudo renovar el token');
  },

  getRefreshToken: () => {
    return (
      localStorage.getItem('refresh_token') ||
      sessionStorage.getItem('refresh_token')
    );
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expires_in');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token_expires_in');
    window.location.href = '/login';
  },

  isTokenValid: token => {
    if (!token || typeof token !== 'string') return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  isAuthenticated: () => {
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token');

    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      return !(payload.exp && payload.exp < now);
    } catch {
      return false;
    }
  },

  getCurrentUser: () => {
    const userStr =
      localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return (
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token')
    );
  },
};

export default authService;
