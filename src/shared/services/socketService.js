/**
 * Servicio de Socket.io para tracking de conductores en tiempo real
 * Frontend Web - React
 */

import { io } from 'socket.io-client';

const RAW_ENV = import.meta.env.VITE_API_URL || 'http://localhost:3000';
let SOCKET_URL = RAW_ENV.replace('/api', '');

if (import.meta.env.DEV && RAW_ENV.includes('azurewebsites.net')) {
  SOCKET_URL = '';
}

SOCKET_URL = SOCKET_URL.replace(/\/$/, '');

console.log('🔌 Socket URL:', SOCKET_URL || '(Proxy/Relativo)');

/**
 * @typedef {Object} DriverLocation
 * @property {number} driverId - ID del conductor
 * @property {number} latitude - Latitud
 * @property {number} longitude - Longitud
 * @property {number} [heading] - Dirección en grados
 * @property {number} [speed] - Velocidad en m/s
 * @property {string} timestamp - Timestamp de la actualización
 * @property {boolean} [isOnline] - Si el conductor está online
 */

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }

  /**
   * Conectar al servidor de tracking
   * @returns {import('socket.io-client').Socket}
   */
  connect() {
    if (this.socket?.connected) {
      console.log('⚡ Socket ya está conectado');
      return this.socket;
    }

    console.log('🔌 Conectando al servidor de tracking...');

    this.socket = io(`${SOCKET_URL}/tracking`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Configurar listeners de eventos del socket
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor de tracking');
      this.reconnectAttempts = 0;
      this.notifyListeners('connectionChange', true);
    });

    this.socket.on('disconnect', reason => {
      console.log('❌ Desconectado del servidor:', reason);
      this.notifyListeners('connectionChange', false);
    });

    this.socket.on('connect_error', error => {
      console.error('🚫 Error de conexión:', error.message);
      this.reconnectAttempts++;
    });

    this.socket.on('stats', data => {
      console.log('📊 Estadísticas del servidor:', data);
      this.notifyListeners('stats', data);
    });
  }

  /**
   * Registrar un listener para eventos internos
   * @param {string} event
   * @param {Function} callback
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  /**
   * Remover un listener
   * @param {string} event
   * @param {Function} callback
   */
  removeListener(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Notificar a los listeners
   * @param {string} event
   * @param {*} data
   */
  notifyListeners(event, data) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  /**
   * Suscribirse a las actualizaciones de un conductor
   * @param {number} driverId
   * @param {(location: DriverLocation) => void} callback
   * @returns {() => void} Función de limpieza
   */
  subscribeToDriver(driverId, callback) {
    if (!this.socket) {
      console.warn('⚠️ Socket no inicializado');
      return () => {};
    }

    this.socket.emit('subscribeToDriver', { driverId });

    const eventName = 'driverLocationUpdate';
    this.socket.on(eventName, callback);

    return () => {
      this.socket?.off(eventName, callback);
      this.socket?.emit('unsubscribeFromDriver', { driverId });
    };
  }

  /**
   * Escuchar todas las actualizaciones de ubicación
   * @param {(location: DriverLocation) => void} callback
   * @returns {() => void} Función de limpieza
   */
  onLocationUpdate(callback) {
    if (!this.socket) {
      console.warn('⚠️ Socket no inicializado');
      return () => {};
    }

    this.socket.on('locationUpdate', callback);

    return () => {
      this.socket?.off('locationUpdate', callback);
    };
  }

  /**
   * Escuchar cuando un conductor se conecta
   * @param {(data: {driverId: number}) => void} callback
   * @returns {() => void}
   */
  onDriverOnline(callback) {
    if (!this.socket) return () => {};

    this.socket.on('driverOnline', callback);
    return () => this.socket?.off('driverOnline', callback);
  }

  /**
   * Escuchar cuando un conductor se desconecta
   * @param {(data: {driverId: number}) => void} callback
   * @returns {() => void}
   */
  onDriverOffline(callback) {
    if (!this.socket) return () => {};

    this.socket.on('driverOffline', callback);
    return () => this.socket?.off('driverOffline', callback);
  }

  /**
   * Obtener ubicación actual de un conductor
   * @param {number} driverId
   * @returns {Promise<{location: DriverLocation|null, isOnline: boolean}>}
   */
  getDriverLocation(driverId) {
    return new Promise(resolve => {
      if (!this.socket?.connected) {
        resolve({ location: null, isOnline: false });
        return;
      }

      this.socket.emit('getDriverLocation', { driverId }, resolve);
    });
  }

  /**
   * Obtener todos los conductores online
   * @returns {Promise<{drivers: DriverLocation[]}>}
   */
  getOnlineDrivers() {
    return new Promise(resolve => {
      if (!this.socket?.connected) {
        resolve({ drivers: [] });
        return;
      }

      this.socket.emit('getOnlineDrivers', {}, resolve);
    });
  }

  /**
   * Verificar si está conectado
   * @returns {boolean}
   */
  isConnected() {
    return this.socket?.connected ?? false;
  }

  /**
   * Desconectar del servidor
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Desconectado del servidor de tracking');
    }
  }

  /**
   * Obtener instancia del socket
   * @returns {import('socket.io-client').Socket|null}
   */
  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
