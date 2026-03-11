import apiClient from '../../../shared/services/apiService';
import { resolveAssetUrl } from '../../../shared/utils/url';

export const encomiendasService = {
  async getAll() {
    const res = await apiClient.get('/encomiendas');
    return res?.data ?? res;
  },

  async getById(id) {
    const res = await apiClient.get(`/encomiendas/${id}`);
    return res?.data ?? res;
  },

  async getByTurno(idTurno) {
    const res = await apiClient.get(`/encomiendas/turno/${idTurno}`);
    return res?.data ?? res;
  },

  async create(formData) {
    const res = await apiClient.post('/encomiendas', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data ?? res;
  },

  async update(id, formData) {
    const res = await apiClient.patch(`/encomiendas/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data ?? res;
  },

  async updateEstado(id, estado) {
    const res = await apiClient.patch(`/encomiendas/${id}/estado`, { estado });
    return res?.data ?? res;
  },

  async updateVerificado(id, verificado) {
    const res = await apiClient.patch(`/encomiendas/${id}/verificado`, { verificado });
    return res?.data ?? res;
  },

  async delete(id) {
    const res = await apiClient.delete(`/encomiendas/${id}`);
    return res?.data ?? res;
  },

  resolvePhoto(enc) {
    if (!enc?.fotoUrl) return null;
    return resolveAssetUrl(enc.fotoUrl);
  },

  getOrigen(enc) {
    if (enc?.turno?.ruta?.origen?.ubicacion)
      return enc.turno.ruta.origen.ubicacion.nombreUbicacion;
    return enc?.origenNombre || null;
  },

  getDestino(enc) {
    if (enc?.turno?.ruta?.destino?.ubicacion)
      return enc.turno.ruta.destino.ubicacion.nombreUbicacion;
    return enc?.destinoNombre || null;
  },

  getDestinoDireccion(enc) {
    return enc?.turno?.ruta?.destino?.ubicacion?.direccion || null;
  },

  getFecha(enc) {
    if (!enc?.turno?.fecha) return null;
    const d = new Date(enc.turno.fecha);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  getHora(enc) {
    return enc?.turno?.hora || null;
  },

  getConductor(enc) {
    return enc?.turno?.conductor?.usuario?.nombre || null;
  },

  getVehiculo(enc) {
    const v = enc?.turno?.vehiculo;
    if (!v) return null;
    return `${v.placa} | ${v.tipoPlaca === 'AMARILLA' ? 'Servicio público' : 'Servicio privado'}`;
  },

  getEstadoColor(estado) {
    switch (estado) {
      case 'Entregado': return 'btn-green';
      case 'En tránsito': return 'btn-yellow';
      case 'Por enviar': return 'btn-blue';
      case 'Verificado': return 'btn-blue';
      default: return 'btn-secondary';
    }
  },
};

export default encomiendasService;

