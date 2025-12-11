import axios from 'axios';
import authService from '../../features/auth/api/authService.js';

const RAW_ENV = import.meta.env.VITE_API_URL || 'http://localhost:3000';
let RAW = RAW_ENV;

if (import.meta.env.DEV && RAW_ENV.includes('azurewebsites.net')) {
  console.log('🔀 Usando Proxy para backend en Azure (evitando CORS)');
  RAW = '';
}

console.log('🔌 Configuración de API:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  Original: RAW_ENV,
  Final: RAW || '(Proxy/Relativo)',
  Mode: import.meta.env.MODE,
});

const API_ORIGIN = RAW.replace(/\/api\/?$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

let loadingCallbacks = {
  startLoading: null,
  stopLoading: null,
};

export const setLoadingCallbacks = (startCallback, stopCallback) => {
  loadingCallbacks.startLoading = startCallback;
  loadingCallbacks.stopLoading = stopCallback;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const isTokenValid = token => {
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
  } catch (error) {
    return false;
  }
};

const getToken = () => {
  try {
    if (typeof window !== 'undefined') {
      return (
        window.localStorage?.getItem('access_token') ||
        window.sessionStorage?.getItem('access_token')
      );
    }
  } catch (_) {
    return null;
  }
  return null;
};

const clearAuthData = () => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.removeItem('access_token');
      window.localStorage?.removeItem('refresh_token');
      window.localStorage?.removeItem('user');
      window.localStorage?.removeItem('token_expires_in');
      window.sessionStorage?.removeItem('access_token');
      window.sessionStorage?.removeItem('refresh_token');
      window.sessionStorage?.removeItem('user');
      window.sessionStorage?.removeItem('token_expires_in');
    }
  } catch (_) {}
};

apiClient.interceptors.request.use(
  config => {
    const token = getToken();

    if (token && isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const requestId = `${Date.now()}-${Math.random()}`;
    config._requestId = requestId;

    const isRefreshTokenRequest = config.url?.includes('/auth/refresh');
    if (!isRefreshTokenRequest && loadingCallbacks.startLoading) {
      loadingCallbacks.startLoading(requestId);
    }

    return config;
  },
  error => {
    const requestId = error.config?._requestId;
    if (requestId && loadingCallbacks.stopLoading) {
      loadingCallbacks.stopLoading(requestId);
    }
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => {
    const requestId = response.config?._requestId;
    const isRefreshTokenRequest =
      response.config?.url?.includes('/auth/refresh');
    if (requestId && !isRefreshTokenRequest && loadingCallbacks.stopLoading) {
      loadingCallbacks.stopLoading(requestId);
    }

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;
    const requestId = originalRequest?._requestId;

    const publicRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
    ];
    const isPublicRoute = publicRoutes.some(route =>
      originalRequest.url?.includes(route)
    );

    if (error.response?.status === 401 && isPublicRoute) {
      const formattedError = {
        success: false,
        message: error.response?.data?.message || 'Credenciales inválidas',
        statusCode: 401,
        error: error.response?.data?.error || 'Unauthorized',
        data: error.response?.data,
      };
      return Promise.reject(formattedError);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isPublicRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = authService.getRefreshToken();

        if (refreshToken) {
          const response = await authService.refreshAccessToken();
          const newToken = response.data.access_token;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          return apiClient(originalRequest);
        } else {
          isRefreshing = false;
          clearAuthData();

          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
              window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
          }

          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAuthData();

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login') {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
        }

        return Promise.reject(error);
      }
    }

    if (error.response?.status === 403) {
      const formattedError = {
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        statusCode: 403,
        error: 'Forbidden',
      };
      return Promise.reject(formattedError);
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      const formattedError = {
        success: false,
        message: `Demasiadas solicitudes. Por favor espera ${retryAfter} segundos antes de intentar nuevamente.`,
        statusCode: 429,
        error: 'Too Many Requests',
        retryAfter: parseInt(retryAfter, 10),
      };
      return Promise.reject(formattedError);
    }

    if (
      error.code === 'ECONNABORTED' ||
      error.message === 'timeout of 10000ms exceeded'
    ) {
      const formattedError = {
        success: false,
        message: 'La solicitud tardó demasiado. Por favor, intenta nuevamente.',
        statusCode: 408,
        error: 'Timeout',
      };
      return Promise.reject(formattedError);
    }

    if (!error.response) {
      const formattedError = {
        success: false,
        message: 'Error de conexión. Verifica tu internet y vuelve a intentar.',
        statusCode: 0,
        error: 'Network Error',
      };
      return Promise.reject(formattedError);
    }

    const formattedError = {
      success: false,
      message:
        error.response?.data?.message || error.message || 'Error desconocido',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error || 'Error',
      data: error.response?.data,
    };

    const isRefreshTokenRequest =
      originalRequest?.url?.includes('/auth/refresh');
    if (requestId && !isRefreshTokenRequest && loadingCallbacks.stopLoading) {
      loadingCallbacks.stopLoading(requestId);
    }

    return Promise.reject(formattedError);
  }
);

export default apiClient;

export { API_ORIGIN };
