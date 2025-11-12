import { useState, useEffect } from 'react';
import apiClient from '../../../../shared/services/apiService';
import { MapBoxMap } from '../../../../shared/components/map';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';

const EditRutaModal = ({ isOpen, onClose, onConfirm, itemData }) => {
  const ruta = itemData;
  const [formData, setFormData] = useState({
    idUbicacionOrigen: '',
    idUbicacionDestino: '',
    distancia: '',
    precioBase: '',
    observaciones: '',
    tiempo: '',
    estado: 'Activa',
    paradas: [],
  });

  const [ubicaciones, setUbicaciones] = useState([]);
  const [origenSeleccionado, setOrigenSeleccionado] = useState(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);
  const [paradasSeleccionadas, setParadasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUbicaciones = async () => {
      try {
        const response = await apiClient.get('/ubicaciones');
        const data = response?.data || response || [];

        const ubicacionesValidas = data.filter(
          u => u.estado && u.latitud && u.longitud
        );
        setUbicaciones(ubicacionesValidas);
      } catch (error) {
        
        setError('No se pudieron cargar las ubicaciones');
      }
    };

    fetchUbicaciones();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !ruta) return;

    setFormData({
      idUbicacionOrigen: ruta.origen?.idUbicacion || '',
      idUbicacionDestino: ruta.destino?.idUbicacion || '',
      distancia: ruta.distancia || '',
      precioBase: ruta.precioBase || '',
      observaciones: ruta.observaciones || '',
      tiempo: ruta.tiempoEstimado || '',
      estado: ruta.estado || 'Activa',
      paradas: ruta.paradas || [],
    });

    const origen = ubicaciones.find(
      u => u.idUbicacion === ruta.origen?.idUbicacion
    );
    const destino = ubicaciones.find(
      u => u.idUbicacion === ruta.destino?.idUbicacion
    );

    setOrigenSeleccionado(origen || null);
    setDestinoSeleccionado(destino || null);

    // Cargar paradas si existen
    if (ruta.paradas && Array.isArray(ruta.paradas)) {
      const paradas = ruta.paradas
        .sort((a, b) => (a.orden || 0) - (b.orden || 0))
        .map(p => ubicaciones.find(u => u.idUbicacion === p.idUbicacion))
        .filter(Boolean);
      setParadasSeleccionadas(paradas);
    } else {
      setParadasSeleccionadas([]);
    }
  }, [ruta, ubicaciones, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleRouteCalculated = routeData => {
    setFormData(prev => ({
      ...prev,
      distancia: routeData.distance,
      tiempo: routeData.durationFormatted,
    }));
    setError(null);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!ruta) return;

    try {
      if (!formData.precioBase || parseFloat(formData.precioBase) <= 0) {
        setError('Por favor ingresa un precio válido');
        return;
      }

      setLoading(true);
      setError(null);

      const dataToUpdate = {
        distancia: parseFloat(formData.distancia),
        precioBase: parseFloat(formData.precioBase),
        tiempoEstimado: String(formData.tiempo),
        estado: formData.estado,
        observaciones: formData.observaciones || '',
        paradas:
          ruta.paradas?.map((p, index) => ({
            idUbicacion: p.idUbicacion,
            descripcion: p.descripcion || null,
          })) || [],
      };

      await apiClient.put(`/rutas/${ruta.idRuta}`, dataToUpdate);
      setSuccess(true);
      setTimeout(() => {
        onConfirm?.();
        onClose();
      }, 1000);
    } catch (err) {
      
      setError(
        err.response?.data?.message ||
          err.message ||
          'Error al actualizar la ruta'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !ruta) return null;

  return (
    <div className="flex gap-4">
      <div className="w-[35%]">
        <div className="bg-surface rounded-2xl p-4 w-full shadow-2xl relative">
          {loading && (
            <div className="absolute top-0 left-0 right-0 z-50 rounded-t-xl overflow-hidden">
              <md-linear-progress indeterminate></md-linear-progress>
            </div>
          )}

          <div className="flex items-center gap-1 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
              disabled={loading}
            >
              <md-icon className="text-xl flex items-center justify-center">
                close
              </md-icon>
            </button>
            <h2 className="h2 font-medium text-primary">Editar ruta</h2>
          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <md-icon className="text-red text-lg">error</md-icon>
                <p className="text-red text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green/10 border border-green/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <md-icon className="text-green text-lg">check_circle</md-icon>
                <p className="text-green text-sm font-medium">
                  ¡Ruta actualizada exitosamente!
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="subtitle1 text-primary font-medium">
                  Ubicación de Origen
                </label>
                <input
                  type="text"
                  value={
                    origenSeleccionado
                      ? `${origenSeleccionado.nombreUbicacion} - ${origenSeleccionado.direccion}`
                      : ''
                  }
                  readOnly
                  className="w-full px-4 py-3 bg-fill border border-border rounded-lg text-secondary cursor-not-allowed outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="subtitle1 text-primary font-medium">
                  Ubicación de Destino
                </label>
                <input
                  type="text"
                  value={
                    destinoSeleccionado
                      ? `${destinoSeleccionado.nombreUbicacion} - ${destinoSeleccionado.direccion}`
                      : ''
                  }
                  readOnly
                  className="w-full px-4 py-3 bg-fill border border-border rounded-lg text-secondary cursor-not-allowed outline-none"
                />
              </div>

              {ruta.paradas && ruta.paradas.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium flex items-center gap-2">
                    <md-icon className="text-lg">location_on</md-icon>
                    Paradas ({ruta.paradas.length})
                  </label>
                  <div className="bg-fill border border-border rounded-lg p-3 space-y-2">
                    {ruta.paradas
                      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                      .map((parada, index) => (
                        <div
                          key={parada.idParada || index}
                          className="flex items-center gap-2 bg-black/30 rounded-lg p-2"
                        >
                          <span className="text-xs font-medium text-secondary bg-primary/20 px-2 py-1 rounded">
                            {parada.orden || index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-primary font-medium truncate">
                              {parada.ubicacion?.nombreUbicacion ||
                                'Sin nombre'}
                            </p>
                            {parada.ubicacion?.direccion && (
                              <p className="text-xs text-secondary truncate">
                                {parada.ubicacion.direccion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {origenSeleccionado && destinoSeleccionado && (
                <div className="bg-fill rounded-xl p-4 border border-border">
                  <p className="text-secondary text-xs font-medium uppercase tracking-wide mb-3">
                    Información de la ruta
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <md-icon className="text-primary text-lg">
                          straighten
                        </md-icon>
                        <p className="text-secondary text-xs font-medium uppercase">
                          Distancia
                        </p>
                      </div>
                      <p className="text-primary text-2xl font-bold">
                        {formData.distancia || '0'}
                        <span className="text-sm font-normal text-secondary ml-1">
                          km
                        </span>
                      </p>
                    </div>
                    <div className="bg-black rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <md-icon className="text-primary text-lg">
                          schedule
                        </md-icon>
                        <p className="text-secondary text-xs font-medium uppercase">
                          Tiempo
                        </p>
                      </div>
                      <p className="text-primary text-2xl font-bold">
                        {formData.tiempo || '0:00'}
                        <span className="text-sm font-normal text-secondary ml-1">
                          hrs
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="subtitle1 text-primary font-medium">
                  Precio base <span className="text-red">*</span>
                </label>
                <input
                  type="number"
                  name="precioBase"
                  value={formData.precioBase}
                  onChange={handleChange}
                  placeholder="Ej: 50000"
                  className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="subtitle1 text-primary font-medium">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="subtitle1 text-primary font-medium">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Observaciones adicionales sobre la ruta..."
                  className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="btn px-5 text-secondary"
              >
                Cancelar
              </button>
              <md-filled-button
                className="btn-add px-6"
                type="submit"
                disabled={loading || success}
              >
                {loading
                  ? 'Actualizando...'
                  : success
                    ? 'Actualizado'
                    : 'Actualizar'}
              </md-filled-button>
            </div>
          </form>
        </div>
      </div>

      <div className="w-[65%] overflow-hidden rounded-r-3xl">
        <MapBoxMap
          origen={origenSeleccionado}
          destino={destinoSeleccionado}
          paradas={paradasSeleccionadas}
          onRouteCalculated={handleRouteCalculated}
          height="95vh"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default EditRutaModal;
