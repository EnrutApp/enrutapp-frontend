import apiClient from './apiService';

/**
 * Servicio para obtener viajes disponibles
 * Integra datos de turnos con vehículos
 */
export const viajeService = {
  /**
   * Buscar viajes disponibles según criterios
   * @param {Object} params - Parámetros de búsqueda
   * @param {string} params.origen - Ciudad de origen
   * @param {string} params.destino - Ciudad de destino
   * @param {string} params.fecha - Fecha en formato YYYY-MM-DD
   * @param {string} params.fechaRegreso - Fecha de regreso (opcional)
   * @returns {Promise<Array>} Array de viajes disponibles
   */
  async buscarViajes(params) {
    try {
      const queryParams = new URLSearchParams({
        fecha: params.fecha,
      });

      if (params.origenId) queryParams.set('origenId', params.origenId);
      if (params.destinoId) queryParams.set('destinoId', params.destinoId);

      // Backward-compat (y útil para mostrar en logs)
      if (params.origen) queryParams.set('origen', params.origen);
      if (params.destino) queryParams.set('destino', params.destino);

      if (params.fechaRegreso) {
        queryParams.append('fechaRegreso', params.fechaRegreso);
      }

      const response = await apiClient.get(`/turnos/buscar?${queryParams}`);
      const payload = response.data;
      const turnos = Array.isArray(payload) ? payload : payload?.data || [];
      return turnos.map(mapTurnoToViajeLanding);
    } catch (error) {
      console.error('Error al buscar viajes:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un viaje específico
   * @param {number} viajeId - ID del viaje
   * @returns {Promise<Object>} Datos del viaje
   */
  async obtenerViajeById(viajeId) {
    try {
      const response = await apiClient.get(`/turnos/${viajeId}`);
      const payload = response.data;
      const turno = payload?.data || payload;
      return mapTurnoToViajeLanding(turno);
    } catch (error) {
      console.error(`Error al obtener viaje ${viajeId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener viajes por ruta
   * @param {number} rutaId - ID de la ruta
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Array>} Array de viajes en esa ruta
   */
  async obtenerViajePorRuta(rutaId, fecha) {
    try {
      const response = await apiClient.get(
        `/turnos/ruta/${rutaId}?fecha=${fecha}`
      );
      const payload = response.data;
      const turnos = Array.isArray(payload) ? payload : payload?.data || [];
      return turnos.map(mapTurnoToViajeLanding);
    } catch (error) {
      console.error('Error al obtener viajes por ruta:', error);
      throw error;
    }
  },

  /**
   * Obtener asientos disponibles de un viaje
   * @param {number} viajeId - ID del viaje
   * @returns {Promise<Object>} Información de asientos
   */
  async obtenerAsientosDisponibles(viajeId) {
    try {
      const response = await apiClient.get(`/turnos/${viajeId}/asientos`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error al obtener asientos del viaje ${viajeId}:`, error);
      throw error;
    }
  },

  /**
   * Guardar reserva de viaje
   * @param {Object} reserva - Datos de la reserva
   * @returns {Promise<Object>} Datos de la reserva creada
   */
  async crearReserva(reserva) {
    try {
      const response = await apiClient.post('/reservas', {
        viajeId: reserva.viajeId,
        usuarioId: reserva.usuarioId,
        asientosSeleccionados: reserva.asientosSeleccionados,
        precioTotal: reserva.precioTotal,
        estado: 'Pendiente',
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  },

  /**
   * Guardar búsqueda realizada por usuario
   * @param {Object} busqueda - Datos de la búsqueda
   * @returns {Promise<Object>} Datos de la búsqueda guardada
   */
  async guardarBusqueda(busqueda) {
    try {
      const response = await apiClient.post('/busquedas', {
        origen: busqueda.origen,
        destino: busqueda.destino,
        fecha: busqueda.fecha,
        fechaRegreso: busqueda.fechaRegreso || null,
        usuarioId: busqueda.usuarioId || null,
        fechaBusqueda: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Error al guardar búsqueda:', error);
      throw error;
    }
  },
};

function mapTurnoToViajeLanding(turno) {
  if (!turno) return turno;

  const horaSalida = normalizeHoraDisplay(turno.hora || '00:00');
  const origenTerminal =
    turno.ruta?.origen?.ubicacion?.nombreUbicacion || 'Origen';
  const destinoTerminal =
    turno.ruta?.destino?.ubicacion?.nombreUbicacion || 'Destino';

  const precio = Number(turno.ruta?.precioBase || 0);
  const precioAnterior = Math.round(precio * 1.2);

  const asientos = (turno.vehiculo?.capacidadPasajeros || 0) + 1;
  const asientosOcupados = (turno.pasajes || [])
    .map(p => {
      const n = Number.parseInt(p.asiento, 10);
      return Number.isFinite(n) ? n : null;
    })
    .filter(n => typeof n === 'number');

  return {
    id: turno.idTurno || turno.id,
    turnoId: turno.idTurno || turno.id,
    horaSalida,
    // Si no hay cálculo confiable, mostramos la misma hora
    horaLlegada: horaSalida,
    fecha: turno.fecha,
    origenTerminal,
    destinoTerminal,
    precio,
    precioAnterior,
    vehiculo: {
      id: turno.vehiculo?.idVehiculo,
      placa: turno.vehiculo?.placa,
      modelo: turno.vehiculo?.modelo,
      asientos,
      tipo: turno.vehiculo?.tipoVehiculo?.nombreTipoVehiculo,
      linea: turno.vehiculo?.linea,
    },
    conductor: {
      id: turno.conductor?.idConductor,
      nombre: turno.conductor?.usuario?.nombre,
      apellido: turno.conductor?.usuario?.apellido,
      documento: turno.conductor?.usuario?.numDocumento,
    },
    asientosOcupados,
    empresa: 'La Tribu',
    categoria: turno.vehiculo?.tipoVehiculo?.nombreTipoVehiculo || 'Estándar',
    categoriaDesc: 'Servicio estándar',
    disponible: (turno.cuposDisponibles ?? 0) > 0,
    etiqueta: 'Más rápido',
    icono: iconoPorHora(turno.hora || horaSalida),
    rutas: 1,
  };
}

function parseHoraTo24(hora) {
  const raw = String(hora || '').trim();
  if (!raw) return null;

  const m24 = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = Number.parseInt(m24[1], 10);
    const mm = Number.parseInt(m24[2], 10);
    if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
    return h;
  }

  const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = Number.parseInt(m12[1], 10);
    const mm = Number.parseInt(m12[2], 10);
    const periodo = m12[3].toUpperCase();
    if (h < 1 || h > 12 || mm < 0 || mm > 59) return null;
    if (periodo === 'PM' && h !== 12) h += 12;
    if (periodo === 'AM' && h === 12) h = 0;
    return h;
  }

  return null;
}

function normalizeHoraDisplay(hora) {
  const raw = String(hora || '').trim();
  if (!raw) return '';

  // Ya viene en AM/PM
  if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(raw)) {
    const m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return raw;
    const h = Number.parseInt(m[1], 10);
    const mm = m[2];
    const periodo = m[3].toUpperCase();
    return `${h}:${mm} ${periodo}`;
  }

  // Formato 24h
  const m24 = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    let h = Number.parseInt(m24[1], 10);
    const mm = m24[2];
    if (!Number.isFinite(h)) return raw;
    const periodo = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${mm} ${periodo}`;
  }

  return raw;
}

function iconoPorHora(hora) {
  const h = parseHoraTo24(hora);
  if (h === null) return 'schedule';
  if (h >= 6 && h < 12) return 'wb_sunny';
  if (h >= 12 && h < 18) return 'wb_twilight';
  if (h >= 18 && h < 24) return 'nights_stay';
  return 'bedtime';
}

export default viajeService;
