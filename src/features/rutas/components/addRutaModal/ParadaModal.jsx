import { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/modal/Modal';
import UbicacionAddQuick from '../../../ubicaciones/components/ubicacionAddModal/UbicacionAddQuick';
import apiClient from '../../../../shared/services/apiService';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';

const ParadaModal = ({
  isOpen,
  onClose,
  onConfirm,
  ubicaciones: ubicacionesProp,
  loading,
}) => {
  const [ubicaciones, setUbicaciones] = useState(ubicacionesProp || []);
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');
  const [isUbicacionAddOpen, setIsUbicacionAddOpen] = useState(false);

  const handleConfirm = () => {
    if (!ubicacionSeleccionada) {
      return;
    }

    const ubicacion = ubicaciones.find(
      u => u.idUbicacion === ubicacionSeleccionada
    );
    if (ubicacion) {
      onConfirm(ubicacion);
      setUbicacionSeleccionada('');
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && ubicacionesProp) {
      setUbicaciones(ubicacionesProp);
    }
  }, [isOpen, ubicacionesProp]);

  const handleUbicacionAdded = async nuevaUbicacion => {
    // Refrescar la lista de ubicaciones
    try {
      const response = await apiClient.get('/ubicaciones');
      const data = response?.data || response || [];
      const ubicacionesValidas = data.filter(
        u => u.estado && u.latitud && u.longitud
      );
      setUbicaciones(ubicacionesValidas);

      // Seleccionar la nueva ubicación
      if (nuevaUbicacion) {
        const idUbicacion =
          nuevaUbicacion.idUbicacion ||
          nuevaUbicacion.data?.idUbicacion ||
          nuevaUbicacion.id;
        if (idUbicacion) {
          setUbicacionSeleccionada(idUbicacion);
        }
      }
    } catch (error) {
      
    }
    setIsUbicacionAddOpen(false);
  };

  const handleClose = () => {
    setUbicacionSeleccionada('');
    onClose();
  };

  // Filtrar ubicaciones que ya están en paradas (si se pasa como prop)
  const ubicacionesDisponibles = ubicaciones || [];

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="h4 font-medium text-primary">Añadir parada</h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-secondary p-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
            >
              <md-icon className="text-xl flex items-center justify-center">
                close
              </md-icon>
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-sm font-medium text-secondary"
                htmlFor="ubicacionParada"
              >
                Seleccionar ubicación{' '}
                <span className="text-red text-sm">*</span>
              </label>
              <md-filled-button
                className="btn-search-compact shrink-0"
                disabled={loading}
                type="button"
                onClick={() => setIsUbicacionAddOpen(true)}
              >
                Añadir ubicación
              </md-filled-button>
            </div>
            <div className="select-wrapper w-full">
              <md-icon className="text-sm">arrow_drop_down</md-icon>
              <select
                id="ubicacionParada"
                value={ubicacionSeleccionada}
                onChange={e => setUbicacionSeleccionada(e.target.value)}
                className="select-filter w-full px-4 input bg-surface border rounded-lg"
                disabled={loading}
              >
                <option value="">Selecciona una ubicación</option>
                {ubicacionesDisponibles.map(ubicacion => (
                  <option
                    key={ubicacion.idUbicacion}
                    value={ubicacion.idUbicacion}
                  >
                    {ubicacion.nombreUbicacion} - {ubicacion.direccion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="btn px-5 text-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <md-filled-button
              className="btn-add px-5"
              onClick={handleConfirm}
              disabled={loading || !ubicacionSeleccionada}
            >
              Agregar
            </md-filled-button>
          </div>
        </div>
      </Modal>

      <UbicacionAddQuick
        isOpen={isUbicacionAddOpen}
        onClose={() => setIsUbicacionAddOpen(false)}
        onConfirm={handleUbicacionAdded}
      />
    </>
  );
};

export default ParadaModal;
