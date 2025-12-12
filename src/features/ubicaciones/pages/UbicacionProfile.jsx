import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useState, useEffect } from 'react';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import ForceDeleteUbicacionModal from '../components/forceDeleteUbicacionModal/ForceDeleteUbicacionModal';
import GoogleMapComponent from '../../../shared/components/map/components/GoogleMapComponent';
import ubicacionesService from '../api/ubicacionesService';

const UbicacionProfile = ({
  ubicacion,
  isOpen,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isForceDeleteModalOpen, setIsForceDeleteModalOpen] = useState(false);
  const [ubicacionToDelete, setUbicacionToDelete] = useState(null);
  const [rutasInfo, setRutasInfo] = useState(null);
  const [rutasAsociadas, setRutasAsociadas] = useState([]);
  const [loadingRutas, setLoadingRutas] = useState(false);

  useEffect(() => {
    const ubicacionId = ubicacion?.id || ubicacion?.idUbicacion;
    if (isOpen && ubicacionId) {
      const fetchRutas = async () => {
        setLoadingRutas(true);
        try {
          const response = await ubicacionesService.getRutas(ubicacionId);
          const rutas = response?.data?.rutas || response?.rutas || [];
          setRutasAsociadas(Array.isArray(rutas) ? rutas : []);
        } catch (err) {
          setRutasAsociadas([]);
        } finally {
          setLoadingRutas(false);
        }
      };
      fetchRutas();
    } else {
      setRutasAsociadas([]);
    }
  }, [isOpen, ubicacion?.id, ubicacion?.idUbicacion]);

  if (!isOpen || !ubicacion) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleDeleteClick = async ubicacion => {
    setUbicacionToDelete(ubicacion);

    try {
      const ubicacionId = ubicacion?.id || ubicacion?.idUbicacion;
      const rutasInfo = await ubicacionesService.getRutasActivas(ubicacionId);

      if (rutasInfo?.tieneRutasActivas && rutasInfo?.rutasActivas?.length > 0) {
        setRutasInfo({
          totalRutas: rutasInfo.totalRutasActivas,
          rutas: rutasInfo.rutasActivas,
        });
        setIsForceDeleteModalOpen(true);
      } else {
        setIsDeleteModalOpen(true);
      }
    } catch (err) {
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ubicacionToDelete && !ubicacion) return;
    const ubicacionToDeleteFinal = ubicacionToDelete || ubicacion;
    const ubicacionId =
      ubicacionToDeleteFinal?.id || ubicacionToDeleteFinal?.idUbicacion;

    setIsDeleteModalOpen(false);

    try {
      const response = await ubicacionesService.remove(ubicacionId);

      setUbicacionToDelete(null);

      if (response?.data?.message) {
        alert(response.data.message);
      } else if (response?.message) {
        alert(response.message);
      }

      if (onDelete) {
        await onDelete(ubicacionToDeleteFinal);
      }

      if (onRefresh) {
        await onRefresh();
      }

      handleClose();
    } catch (err) {
      let errorMessage = 'Error al eliminar ubicación';
      const errorData = err?.data || err?.response?.data || err;

      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
      setUbicacionToDelete(null);
    }
  };

  const handleForceDeleteConfirm = async () => {
    if (!ubicacionToDelete && !ubicacion) return;
    const ubicacionToDeleteFinal = ubicacionToDelete || ubicacion;
    const ubicacionId =
      ubicacionToDeleteFinal?.id || ubicacionToDeleteFinal?.idUbicacion;

    try {
      const response = await ubicacionesService.forceDelete(ubicacionId);

      setIsForceDeleteModalOpen(false);
      setUbicacionToDelete(null);
      setRutasInfo(null);

      if (response?.data?.message) {
        alert(response.data.message);
      } else if (response?.message) {
        alert(response.message);
      }

      if (onDelete) {
        await onDelete(ubicacionToDeleteFinal);
      }

      if (onRefresh) {
        await onRefresh();
      }

      handleClose();
    } catch (err) {
      let errorMessage = 'Error al eliminar ubicación';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
      setIsForceDeleteModalOpen(false);
      setUbicacionToDelete(null);
      setRutasInfo(null);
    }
  };

  const handleForceDeleteCancel = () => {
    setIsForceDeleteModalOpen(false);
    setUbicacionToDelete(null);
    setRutasInfo(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setUbicacionToDelete(null);
  };

  const nombre = ubicacion.nombre || ubicacion.nombreUbicacion || 'Sin nombre';
  const direccion = ubicacion.direccion || 'Sin dirección';
  const estadoBool = ubicacion.activo;
  const latitud = ubicacion.latitud;
  const longitud = ubicacion.longitud;

  const ubicacionParaMapa =
    latitud && longitud
      ? {
          nombreUbicacion: nombre,
          direccion: direccion,
          latitud: latitud,
          longitud: longitud,
        }
      : null;

  return (
    <div
      className={`flex flex-col gap-4 overflow-auto ${isClosing ? 'profile-exit' : 'profile-enter'}`}
      style={{
        background: 'var(--background)',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <button
            onClick={handleClose}
            className="text-secondary p-2 mr-2 btn-search rounded-full hover:text-primary transition-colors cursor-pointer"
          >
            <md-icon className="text-xl flex items-center justify-center">
              arrow_back
            </md-icon>
          </button>
          <h2 className="h4 font-medium text-primary">Ubicaciones</h2>
        </div>
        <div className="flex gap-2">
          <md-filled-button
            className="btn-add px-6 py-2"
            onClick={() => onEdit && onEdit(ubicacion)}
          >
            <md-icon slot="icon" className="text-sm text-on-primary">
              edit
            </md-icon>
            Editar ubicación
          </md-filled-button>
          <md-filled-button
            className="btn-add px-5"
            onClick={() => onAdd && onAdd()}
          >
            <md-icon slot="icon" className="text-sm text-on-primary">
              add
            </md-icon>
            Agregar una ubicación
          </md-filled-button>
        </div>
      </div>

      <div className="bg-primary text-on-primary content-box-small">
        <h1 className="h3 text-on-primary">{nombre}</h1>
        <span className="subtitle1 text-on-primary">{direccion}</span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">Estado</span>
          <div className="flex mt-1">
            <button
              className={`btn font-medium btn-lg flex items-center ${estadoBool ? 'btn-primary' : 'btn-secondary'}`}
            >
              {estadoBool ? 'Activa' : 'Inactiva'}
            </button>
          </div>
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">
            Dirección completa
          </span>
          <span className="subtitle1 text-secondary mt-1">{direccion}</span>
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">
            Rutas asociadas
          </span>
          {loadingRutas ? (
            <div className="mt-2">
              <span className="subtitle2 text-secondary">Cargando...</span>
            </div>
          ) : rutasAsociadas.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex mt-4 gap-2">
                <div className="content-box-outline-3-small">
                  <span className="subtitle2 text-primary font-light">
                    Totales
                  </span>
                  <h2 className="subtitle1 text-secondary">
                    {rutasAsociadas.length}
                  </h2>
                </div>
                <div className="content-box-outline-3-small">
                  <span className="subtitle2 text-primary font-light">
                    Activas
                  </span>
                  <h2 className="subtitle1 text-secondary">
                    {
                      rutasAsociadas.filter(
                        r => r.estado === 'Activa' || r.estado === 'activo'
                      ).length
                    }
                  </h2>
                </div>
                <div className="content-box-outline-3-small">
                  <span className="subtitle2 text-primary font-light">
                    Inactivas
                  </span>
                  <h2 className="subtitle1 text-secondary">
                    {
                      rutasAsociadas.filter(
                        r => r.estado !== 'Activa' && r.estado !== 'activo'
                      ).length
                    }
                  </h2>
                </div>
                {rutasAsociadas.some(r => r.esParada) && (
                  <div className="content-box-outline-3-small">
                    <span className="subtitle2 text-primary font-light">
                      Paradas
                    </span>
                    <h2 className="subtitle1 text-secondary">
                      {rutasAsociadas.filter(r => r.esParada).length}
                    </h2>
                  </div>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto flex flex-col gap-2 mt-2">
                {rutasAsociadas.map(ruta => (
                  <div
                    key={ruta.idRuta}
                    className="content-box-small-2 border border-border flex justify-between"
                  >
                    <div className="flex flex-col mb-1">
                      <div className="flex items-center gap-1 flex-1 min-w-0 h-6 flex-wrap">
                        <span className="ml-1 subtitle1 text-primary font-light truncate leading-6">
                          {ruta.origen}
                        </span>
                        {ruta.paradas && ruta.paradas.length > 0 ? (
                          <>
                            {ruta.paradas.map((parada, idx) => (
                              <div
                                key={parada.idParada || idx}
                                className="flex items-center gap-1"
                              >
                                <md-icon className="text-xl text-secondary shrink-0">
                                  arrow_right
                                </md-icon>
                                <span className="subtitle1 text-primary font-light truncate leading-6">
                                  {parada.nombreUbicacion}
                                </span>
                              </div>
                            ))}
                            <md-icon className="text-xl text-secondary shrink-0">
                              arrow_right
                            </md-icon>
                          </>
                        ) : (
                          <md-icon className="text-xl text-secondary shrink-0">
                            arrow_right
                          </md-icon>
                        )}
                        <span className="subtitle1 text-primary font-light truncate leading-6">
                          {ruta.destino}
                        </span>
                      </div>

                      {(ruta.distancia ||
                        ruta.tiempoEstimado ||
                        ruta.precioBase) && (
                        <div className="flex gap-2 mt-3 items-center content-box-outline-8-small">
                          {ruta.distancia && (
                            <span className="text-sm text-secondary flex items-center gap-1">
                              <md-icon className="text-base text-secondary">
                                distance
                              </md-icon>
                              <strong className="subtitle1 text-secondary">
                                Distancia:
                              </strong>{' '}
                              {ruta.distancia} km
                            </span>
                          )}
                          <span className="text-sm text-secondary">|</span>
                          {ruta.tiempoEstimado && (
                            <span className="text-sm text-secondary flex items-center gap-1">
                              <md-icon className="text-base text-secondary">
                                timer
                              </md-icon>
                              <strong className="subtitle1 text-secondary">
                                Tiempo:
                              </strong>{' '}
                              {ruta.tiempoEstimado}
                            </span>
                          )}
                          <span className="text-sm text-secondary">|</span>
                          {ruta.precioBase && (
                            <span className="text-sm text-secondary flex items-center gap-1">
                              <md-icon className="text-base text-secondary">
                                attach_money
                              </md-icon>
                              <strong className="subtitle1 text-secondary">
                                Precio:
                              </strong>{' '}
                              ${ruta.precioBase}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      <span
                        className={`btn font-medium btn-lg flex items-center ${
                          ruta.estado === 'Activa' || ruta.estado === 'activo'
                            ? 'btn-green text-text-green'
                            : 'btn-red'
                        }`}
                      >
                        {ruta.estado === 'Activa' || ruta.estado === 'activo'
                          ? 'Activa'
                          : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <span className="subtitle2 text-secondary">
                No hay rutas asociadas
              </span>
            </div>
          )}
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">
            Vista en el mapa
          </span>
          {ubicacionParaMapa ? (
            <div className="mt-2 overflow-hidden rounded-xl h-[350px]">
              <GoogleMapComponent
                origen={ubicacionParaMapa}
                destino={null}
                paradas={[]}
                height="100%"
                className="w-full"
                showDefaultMap={false}
                interactive={true}
              />
            </div>
          ) : (
            <div className="mt-2">
              <span className="subtitle2 text-secondary">
                No hay coordenadas disponibles para mostrar en el mapa
              </span>
            </div>
          )}
        </div>

        {(latitud || longitud) && (
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Coordenadas
            </span>
            <div className="flex flex-col gap-1 mt-1">
              {latitud && (
                <span className="subtitle2 text-secondary">
                  Latitud: {latitud}
                </span>
              )}
              {longitud && (
                <span className="subtitle2 text-secondary">
                  Longitud: {longitud}
                </span>
              )}
            </div>
          </div>
        )}

        {ubicacion.createdAt && (
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Fecha de creación
            </span>
            <span className="subtitle1 text-secondary mt-1">
              {new Date(ubicacion.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        <div>
          <button
            className="btn btn-red font-medium flex text-red items-center"
            onClick={e => {
              e.stopPropagation();
              handleDeleteClick(ubicacion);
            }}
          >
            <md-icon className="text-sm">delete</md-icon>
            Eliminar ubicación
          </button>
        </div>
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="ubicación"
        itemName={ubicacionToDelete?.nombre || ubicacion?.nombre}
      />
      <ForceDeleteUbicacionModal
        isOpen={isForceDeleteModalOpen}
        onClose={handleForceDeleteCancel}
        onConfirm={handleForceDeleteConfirm}
        ubicacionNombre={ubicacionToDelete?.nombre || ubicacion?.nombre}
        rutasInfo={rutasInfo}
      />
    </div>
  );
};

export default UbicacionProfile;
