import Modal from '../../../../shared/components/modal/Modal';
import AddressAutocomplete from '../../../../shared/components/addressAutocomplete/AddressAutocomplete';
import GoogleMapComponent from '../../../../shared/components/map/components/GoogleMapComponent';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useState, useEffect } from 'react';
import ubicacionesService from '../../api/ubicacionesService';

const UbicacionAdd = ({
  isOpen,
  onClose,
  onConfirm,
  itemData,
  size = '2xl',
}) => {
  const isEditMode = !!itemData;

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorNombre, setErrorNombre] = useState('');
  const [coordenadasEncontradas, setCoordenadasEncontradas] = useState(false);
  const [direccionFijada, setDireccionFijada] = useState(false);
  const [isEstadoVacioVisible, setIsEstadoVacioVisible] = useState(true);
  const [isMensajeInicialVisible, setIsMensajeInicialVisible] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && itemData) {
        setNombre(itemData.nombre || '');
        setDireccion(itemData.direccion || '');

        setLatitud(itemData.latitud ? parseFloat(itemData.latitud) : null);
        setLongitud(itemData.longitud ? parseFloat(itemData.longitud) : null);
        setCoordenadasEncontradas(!!(itemData.latitud && itemData.longitud));
        setDireccionFijada(!!(itemData.latitud && itemData.longitud));
        setIsEstadoVacioVisible(false);
        setMapCenter(null);
        setMapZoom(null);
      } else {
        setNombre('');
        setDireccion('');
        setLatitud(null);
        setLongitud(null);
        setCoordenadasEncontradas(false);
        setDireccionFijada(false);
        setErrorNombre('');
        setIsEstadoVacioVisible(true);
        setIsMensajeInicialVisible(true);
        setMapCenter(null);
        setMapZoom(null);
      }
    }
  }, [isOpen, itemData, isEditMode]);

  const handleAddressSelect = addressData => {
    if (addressData) {
      setDireccion(addressData.address);
      setLatitud(addressData.lat);
      setLongitud(addressData.lng);
      setCoordenadasEncontradas(true);
      setMapCenter([addressData.lng, addressData.lat]);
      setMapZoom(14);
    }
  };

  const handleDireccionChange = newDireccion => {
    setDireccion(newDireccion);
    if (coordenadasEncontradas) {
      setCoordenadasEncontradas(false);
      setLatitud(null);
      setLongitud(null);
    }
  };

  const handleFijarDireccion = async () => {
    setDireccionFijada(true);
    setCoordenadasEncontradas(false);

    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([longitude, latitude]);
        setMapZoom(14);
      } catch (error) {
        setMapCenter(null);
        setMapZoom(null);
      }
    }
  };

  const handleMapClick = data => {
    if (data.lat && data.lng) {
      setLatitud(data.lat);
      setLongitud(data.lng);
      setCoordenadasEncontradas(true);
      if (data.address) {
        setDireccion(data.address);
      }
    }
  };

  const handleDesfijarDireccion = () => {
    setDireccionFijada(false);
    setCoordenadasEncontradas(false);
    setLatitud(null);
    setLongitud(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    if (!nombre.trim()) {
      alert('El nombre es obligatorio');
      setLoading(false);
      return;
    }

    if (!direccion.trim()) {
      alert('La dirección es obligatoria');
      setLoading(false);
      return;
    }

    const data = {
      nombreUbicacion: nombre.trim(),
      direccion: direccion.trim(),
    };

    if (latitud !== null && longitud !== null) {
      data.latitud = latitud;
      data.longitud = longitud;
    }

    try {
      if (isEditMode) {
        await ubicacionesService.update(itemData.id, data);
      } else {
        await ubicacionesService.create(data);
      }
      onConfirm();
      onClose();

      setNombre('');
      setDireccion('');
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al guardar la ubicación';

      if (
        error?.response?.status === 409 &&
        errorMessage.toLowerCase().includes('nombre')
      ) {
        setErrorNombre(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNombre('');
      setDireccion('');
      setLatitud(null);
      setLongitud(null);
      setCoordenadasEncontradas(false);
      setDireccionFijada(false);
      setIsMensajeInicialVisible(true);
      setMapCenter(null);
      setMapZoom(null);
      setUserLocation(null);
      onClose();
    }
  };

  const ubicacionParaMapa =
    coordenadasEncontradas && latitud && longitud
      ? {
          latitud: latitud.toString(),
          longitud: longitud.toString(),
        }
      : null;

  const deberiaMostrarMensajeInicial =
    !direccionFijada && !coordenadasEncontradas && !direccion.trim();

  useEffect(() => {
    if (!deberiaMostrarMensajeInicial && isMensajeInicialVisible) {
      const timer = setTimeout(() => {
        setIsMensajeInicialVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    } else if (deberiaMostrarMensajeInicial && !isMensajeInicialVisible) {
      setIsMensajeInicialVisible(true);
    }
  }, [deberiaMostrarMensajeInicial, isMensajeInicialVisible]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={size}>
      <main className="relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="flex gap-0 h-[90vh]">
          <div className="w-[42%] p-6 flex flex-col">
            <div className="flex items-center gap-1 mb-4">
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
            </div>

            <div className="px-8 flex-1 flex flex-col">
              <div className="leading-tight mb-6">
                <h2 className="h2 font-medium text-primary">
                  {isEditMode ? 'Editar ubicación' : 'Añadir ubicación'}
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 flex-1"
              >
                <div>
                  <label
                    className="block text-sm font-medium text-secondary mb-1"
                    htmlFor="nombre"
                  >
                    Nombre de la ubicación{' '}
                    <span className="text-red text-sm">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Aqui el nombre de la ubicación"
                    value={nombre}
                    onChange={e => {
                      setNombre(e.target.value);
                      if (errorNombre) setErrorNombre('');
                    }}
                    required
                    maxLength={100}
                    disabled={loading}
                    className={`w-full px-4 py-3 input bg-fill border ${
                      errorNombre
                        ? 'border-red ring-1 ring-red/20'
                        : 'border-border'
                    } rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-10`}
                  />
                  {errorNombre && (
                    <p className="text-red text-xs mt-1 ml-1 flex items-center gap-1">
                      <md-icon className="text-sm">error</md-icon>
                      {errorNombre}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <label
                      className="block text-sm font-medium text-secondary flex-1"
                      htmlFor="direccion"
                    >
                      Dirección <span className="text-red">*</span>
                    </label>
                    {!direccionFijada && !coordenadasEncontradas && (
                      <md-filled-button
                        className="btn-search-compact shrink-0"
                        onClick={handleFijarDireccion}
                        disabled={loading}
                        type="button"
                      >
                        Seleccionar en el mapa
                      </md-filled-button>
                    )}
                  </div>
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

                  {isMensajeInicialVisible && (
                    <div
                      className={`content-box-outline-2-small mt-5 transition-opacity duration-300 ${
                        deberiaMostrarMensajeInicial
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                    >
                      <div className="flex flex-col items-center p-4">
                        <md-icon className="text-blue text-2xl">
                          arrow_circle_up
                        </md-icon>
                        <div className="flex flex-col items-center gap-2 text-center justify-center p-4">
                          <h1 className="text-h5 text-primary font-semibold mb-1">
                            ¡Escribe y selecciona una dirección sugerida!
                          </h1>
                          <p className="text-sm text-secondary font-normal">
                            Añade la dirección a la ubicación en el mapa.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {coordenadasEncontradas &&
                  latitud !== null &&
                  longitud !== null && (
                    <div className="content-box-outline-2-small">
                      <div className="flex flex-col items-center p-4">
                        <md-icon className="text-green text-2xl">
                          check_circle
                        </md-icon>
                        <div className="flex flex-col items-center gap-2 text-center justify-center p-4">
                          <h1 className="text-h5 text-primary font-semibold mb-1">
                            ¡Ubicación encontrada!
                          </h1>
                          <p className="text-sm text-secondary font-normal">
                            Las coordenadas de la ubicación han sido encontradas
                            correctamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {direccionFijada && !coordenadasEncontradas && (
                  <div className="content-box-outline-2-small">
                    <div className="flex flex-col items-center p-4">
                      <md-icon className="text-yellow-2 text-2xl">info</md-icon>
                      <div className="flex flex-col items-center gap-2 text-center justify-center p-4">
                        <h1 className="text-h5 text-primary font-semibold mb-1">
                          ¡Alerta!
                        </h1>
                        <p className="text-sm text-secondary font-normal">
                          Haz click en el mapa a la derecha para seleccionar la
                          ubicación
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-auto pt-4">
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
                    className="btn-add w-full"
                    disabled={loading}
                  >
                    {loading
                      ? 'Guardando...'
                      : isEditMode
                        ? 'Guardar cambios'
                        : 'Añadir ubicación'}
                  </md-filled-button>
                </div>
              </form>
            </div>
          </div>

          <div className="w-[58%] relative overflow-hidden rounded-r-3xl group h-full">
            <GoogleMapComponent
              origen={ubicacionParaMapa}
              destino={null}
              height="100%"
              className="w-full h-full transition-all duration-500"
              allowClickSelection={true}
              onMapClick={handleMapClick}
              showDefaultMap={true}
              initialCenter={mapCenter}
              initialZoom={mapZoom || 14}
              interactive={true}
            />

            {!coordenadasEncontradas && !direccionFijada && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-r-3xl backdrop-blur-md z-20 transition-opacity duration-300 pointer-events-none">
                <div className="content-box-outline-5-small max-w-md mx-auto">
                  <div className="flex flex-col items-center p-6">
                    <md-icon className="text-secondary text-3xl mb-4">
                      map
                    </md-icon>
                    <div className="flex flex-col items-center gap-2 text-center justify-center">
                      <h1 className="text-h5 text-primary font-semibold mb-1">
                        Explora el mapa
                      </h1>
                      <p className="text-sm text-secondary font-normal">
                        Ingresa una dirección o selecciona un punto en el mapa
                        para ubicarla.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {direccionFijada && (
              <div className="absolute bottom-6 left-6 right-6 bg-background rounded-lg p-4 z-10 shadow-lg border border-border animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 w-10 h-10 flex items-center justify-center ${coordenadasEncontradas ? 'bg-green/10 text-green' : 'bg-primary/10 text-primary'}`}
                  >
                    <md-icon className="text-base">
                      {coordenadasEncontradas ? 'check_circle' : 'ads_click'}
                    </md-icon>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {coordenadasEncontradas
                        ? 'Ubicación seleccionada'
                        : 'Selecciona la ubicación'}
                    </p>
                    <p className="text-xs text-secondary font-medium mt-0.5">
                      {coordenadasEncontradas
                        ? 'Haz click en otro lugar del mapa para cambiar la ubicación'
                        : 'Haz click exacto en el mapa para fijar las coordenadas'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </Modal>
  );
};

export default UbicacionAdd;
