/**
 * Tipos y estructuras de datos para viajes
 * Este archivo documenta la estructura esperada del backend
 */

/**
 * @typedef {Object} Viaje
 * @property {number} id - ID único del viaje
 * @property {number} turnoId - ID del turno asociado
 * @property {string} horaSalida - Hora de salida (ej: "06:30 AM")
 * @property {string} horaLlegada - Hora de llegada estimada
 * @property {string} fecha - Fecha del viaje (YYYY-MM-DD)
 * @property {string} origenTerminal - Terminal de origen
 * @property {string} destinoTerminal - Terminal de destino
 * @property {number} precio - Precio del viaje por pasajero
 * @property {number} precioAnterior - Precio anterior (para mostrar descuento)
 * @property {Vehiculo} vehiculo - Objeto con datos del vehículo
 * @property {Conductor} conductor - Datos del conductor
 * @property {Array<number>} asientosOcupados - IDs de asientos ocupados
 * @property {string} empresa - Nombre de la empresa de transporte
 * @property {string} categoria - Categoría del viaje (Diamante, Premium, etc)
 * @property {string} categoriaDesc - Descripción de categoría
 * @property {boolean} disponible - Si el viaje está disponible
 * @property {string} [etiqueta] - Etiqueta especial (ej: "Más rápido")
 * @property {string} icono - Icono del período del día (wb_sunny, nights_stay, etc)
 */

/**
 * @typedef {Object} Vehiculo
 * @property {number} id - ID del vehículo
 * @property {string} placa - Placa del vehículo
 * @property {string} modelo - Modelo del vehículo
 * @property {number} asientos - Cantidad total de asientos (incluye conductor)
 * @property {string} tipo - Tipo de vehículo (Minibus, Bus, etc)
 * @property {string} [linea] - Línea de transporte
 * @property {string} [estado] - Estado del vehículo
 */

/**
 * @typedef {Object} Conductor
 * @property {number} id - ID del conductor
 * @property {string} nombre - Nombre completo
 * @property {string} apellido - Apellido del conductor
 * @property {string} documento - Número de documento
 */

/**
 * @typedef {Object} AsientoInfo
 * @property {number} id - ID del asiento
 * @property {number} row - Fila del asiento
 * @property {string} position - Posición (A o B)
 * @property {boolean} occupied - Si está ocupado
 * @property {boolean} isDriver - Si es asiento del conductor
 */

/**
 * @typedef {Object} Reserva
 * @property {number} viajeId - ID del viaje a reservar
 * @property {number} usuarioId - ID del usuario (opcional)
 * @property {Array<number>} asientosSeleccionados - IDs de asientos seleccionados
 * @property {number} precioTotal - Precio total de la reserva
 * @property {string} [estado] - Estado de la reserva (Pendiente, Confirmada, Cancelada)
 * @property {string} [fechaBusqueda] - Fecha/hora de la búsqueda
 */

/**
 * @typedef {Object} Busqueda
 * @property {string} origen - Ciudad de origen
 * @property {string} destino - Ciudad de destino
 * @property {string} fecha - Fecha de salida (YYYY-MM-DD)
 * @property {string} [fechaRegreso] - Fecha de regreso (YYYY-MM-DD, opcional)
 * @property {number} [usuarioId] - ID del usuario que realizó la búsqueda
 * @property {string} [fechaBusqueda] - Timestamp de cuando se realizó la búsqueda
 */

/**
 * Estructura esperada de la respuesta del endpoint /turnos/buscar
 *
 * GET /turnos/buscar?origen=Medellín&destino=Cartagena&fecha=2025-12-10
 *
 * Response: Array<Viaje>
 *
 * Ejemplo:
 * [
 *   {
 *     id: 1,
 *     turnoId: 123,
 *     horaSalida: "06:30 AM",
 *     horaLlegada: "2:00 PM",
 *     fecha: "2025-12-10",
 *     origenTerminal: "MEDELLÍN TERMINAL",
 *     destinoTerminal: "CARTAGENA TERMINAL",
 *     precio: 100000,
 *     precioAnterior: 120000,
 *     vehiculo: {
 *       id: 456,
 *       placa: "ABC-123",
 *       modelo: "Mercedes",
 *       asientos: 4,
 *       tipo: "Minibus",
 *       linea: "La Tribu"
 *     },
 *     conductor: {
 *       id: 789,
 *       nombre: "Juan",
 *       apellido: "Pérez",
 *       documento: "1234567890"
 *     },
 *     asientosOcupados: [1],
 *     empresa: "La Tribu",
 *     categoria: "Diamante",
 *     categoriaDesc: "Preferencial de Lujo",
 *     disponible: true,
 *     etiqueta: "Más rápido",
 *     icono: "wb_sunny"
 *   }
 * ]
 */

export const VIAJE_SCHEMA = {
  viaje: {
    id: 'number',
    turnoId: 'number',
    horaSalida: 'string',
    horaLlegada: 'string',
    fecha: 'string',
    origenTerminal: 'string',
    destinoTerminal: 'string',
    precio: 'number',
    precioAnterior: 'number',
    vehiculo: 'object', // Vehiculo
    conductor: 'object', // Conductor
    asientosOcupados: 'array', // Array<number>
    empresa: 'string',
    categoria: 'string',
    categoriaDesc: 'string',
    disponible: 'boolean',
    etiqueta: 'string (opcional)',
    icono: 'string',
  },
  vehiculo: {
    id: 'number',
    placa: 'string',
    modelo: 'string',
    asientos: 'number',
    tipo: 'string',
    linea: 'string (opcional)',
    estado: 'string (opcional)',
  },
};

export default VIAJE_SCHEMA;
