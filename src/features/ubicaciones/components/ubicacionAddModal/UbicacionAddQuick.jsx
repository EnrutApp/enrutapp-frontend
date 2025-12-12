import Modal from '../../../../shared/components/modal/Modal';
import AddressAutocomplete from '../../../../shared/components/addressAutocomplete/AddressAutocomplete';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useState, useEffect } from 'react';
import ubicacionesService from '../../api/ubicacionesService';

const UbicacionAddQuick = ({ isOpen, onClose, onConfirm }) => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (!isOpen) {
      setNombre('');
      setDireccion('');
      setCoordinates({ lat: null, lng: null });
      setError(null);
    }
  }, [isOpen]);

  const handleDireccionChange = value => {
    setDireccion(value);
    setError(null);
  };

  const handleAddressSelect = addressData => {
    if (addressData && addressData.lat && addressData.lng) {
      setDireccion(
        addressData.formatted_address || addressData.address || direccion
      );
      setCoordinates({
        lat: addressData.lat,
        lng: addressData.lng,
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre es obligatorio');
      setLoading(false);
      return;
    }

    if (!direccion.trim()) {
      setError('La dirección es obligatoria');
      setLoading(false);
      return;
    }

    if (!coordinates.lat || !coordinates.lng) {
      setError('Por favor selecciona una dirección válida de la lista');
      setLoading(false);
      return;
    }

    try {
      const data = {
        nombreUbicacion: nombre.trim(),
        direccion: direccion.trim(),
        latitud: coordinates.lat ? Number(coordinates.lat) : null,
        longitud: coordinates.lng ? Number(coordinates.lng) : null,
      };

      const nuevaUbicacion = await ubicacionesService.create(data);

      if (onConfirm) {
        onConfirm(nuevaUbicacion?.data || nuevaUbicacion);
      }

      onClose();

      setNombre('');
      setDireccion('');
      setCoordinates({ lat: null, lng: null });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al guardar la ubicación';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNombre('');
      setDireccion('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex items-center gap-1 mb-6">
          <button
            type="button"
            onClick={handleClose}
            className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
            disabled={loading}
          >
            <md-icon className="text-xl flex items-center justify-center">
              close
            </md-icon>
          </button>
          <h2 className="h2 font-medium text-primary">Añadir ubicación</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              className="block text-sm font-medium text-secondary mb-1"
              htmlFor="nombre"
            >
              Nombre de la ubicación <span className="text-red text-sm">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Aqui el nombre de la ubicación"
              value={nombre}
              onChange={e => {
                setNombre(e.target.value);

                if (error && error.toLowerCase().includes('nombre')) {
                  setError(null);
                }
              }}
              required
              maxLength={100}
              disabled={loading}
              className={`w-full px-4 py-3 input bg-fill border ${
                error && error.toLowerCase().includes('nombre')
                  ? 'border-red ring-1 ring-red/20'
                  : 'border-border'
              } rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-10`}
            />
            {error && error.toLowerCase().includes('nombre') && (
              <p className="text-red text-xs mt-1 ml-1 flex items-center gap-1">
                <md-icon className="text-sm">error</md-icon>
                {error}
              </p>
            )}
            {error && !error.toLowerCase().includes('nombre') && (
              <div className="bg-red/10 border border-red/30 rounded-xl p-4 mt-2">
                <div className="flex items-center gap-2">
                  <md-icon className="text-red text-lg">error</md-icon>
                  <p className="text-red text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-secondary mb-1"
              htmlFor="direccion"
            >
              Dirección <span className="text-red">*</span>
            </label>
            <div className="relative">
              <AddressAutocomplete
                value={direccion}
                onChange={handleDireccionChange}
                onSelect={handleAddressSelect}
                placeholder="Aqui la dirección"
                disabled={loading}
                required
                country="co"
              />
            </div>
            <p className="text-xs text-secondary mt-2">
              Escribe la dirección y selecciona una sugerencia. Las coordenadas
              se obtendrán automáticamente.
            </p>
          </div>

          <div className="flex gap-3 mt-4 pt-4">
            <button
              type="button"
              className="btn px-5 text-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <md-filled-button
              type="submit"
              className="btn-add w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Guardando...' : 'Añadir ubicación'}
            </md-filled-button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default UbicacionAddQuick;
