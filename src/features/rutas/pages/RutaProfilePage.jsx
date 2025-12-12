import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import apiClient from '../../../shared/services/apiService';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleMapComponent from '../../../shared/components/map/components/GoogleMapComponent';
import { formatTiempoEstimado } from '../utils/formatTiempoEstimado';
import ContratoQuickCreateModal from '../components/ContratoQuickCreateModal';

const RutaProfilePage = ({
  ruta,
  isOpen,
  onClose,
  onDeleted,
  onEdit,
  onAdd,
}) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isContratoModalOpen, setIsContratoModalOpen] = useState(false);

  if (!isOpen || !ruta) return null;

  const origen = ruta.origen?.ubicacion || null;
  const destino = ruta.destino?.ubicacion || null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/rutas/${ruta.idRuta}`);
      setIsDeleteModalOpen(false);
      handleClose();
      if (onDeleted) onDeleted();
    } catch (error) {
      alert('Error al eliminar la ruta');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const origenNombre = ruta.origen?.ubicacion?.nombreUbicacion || 'Sin origen';
  const destinoNombre =
    ruta.destino?.ubicacion?.nombreUbicacion || 'Sin destino';

  const { valor: tiempoValor, unidad: tiempoUnidad } = formatTiempoEstimado(
    ruta.tiempoEstimado
  );

  return (
    <div
      className={`flex flex-col h-full ${isClosing ? 'profile-exit' : 'profile-enter'}`}
      style={{
        background: 'var(--background)',
        boxSizing: 'border-box',
        width: '100%',
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
          <h2 className="h4 font-medium text-primary">Rutas</h2>
        </div>
        <div className="flex gap-2">
          <md-filled-button
            className="btn-add px-6 py-2"
            onClick={() => setIsContratoModalOpen(true)}
          >
            <md-icon slot="icon" className="text-sm text-on-primary">
              description
            </md-icon>
            Crear contrato
          </md-filled-button>
          <md-filled-button
            className="btn-add px-6 py-2"
            onClick={() => onEdit && onEdit(ruta)}
          >
            <md-icon slot="icon" className="text-sm text-on-primary">
              edit
            </md-icon>
            Editar ruta
          </md-filled-button>
          <md-filled-button
            className="btn-add px-5"
            onClick={() => onAdd && onAdd()}
          >
            <md-icon slot="icon" className="text-sm text-on-primary">
              add
            </md-icon>
            Agregar una ruta
          </md-filled-button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col gap-4 py-4 pe-4 w-1/2 overflow-y-auto max-h-full">
          <div className="bg-primary text-on-primary content-box-small">
            <div className="flex items-center gap-2 mb-2 overflow-hidden">
              <h1 className="h4 text-on-primary font-bold truncate max-w-[45%]">
                {origenNombre}
              </h1>
              <md-icon className="text-xl text-on-primary/80 shrink-0">
                arrow_right
              </md-icon>
              <h1 className="h4 text-on-primary font-bold truncate max-w-[45%]">
                {destinoNombre}
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="content-box-outline-3-small">
              <span className="subtitle1 text-primary font-light">
                Estado de la ruta
              </span>
              <div className="flex mt-1">
                <button
                  className={`btn font-medium btn-lg flex items-center ${ruta.estado ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {ruta.estado ? 'Activa' : 'Inactiva'}
                </button>
              </div>
            </div>

            {ruta.paradas && ruta.paradas.length > 0 && (
              <div className="content-box-outline-3-small">
                <h3 className="subtitle1 text-primary font-light mb-3 flex items-center gap-2">
                  Paradas{' '}
                  <span className="btn-secondary badge px-2 py-1 rounded-full font-light">
                    {ruta.paradas.length}
                  </span>
                </h3>
                <div className="flex flex-col gap-2">
                  {ruta.paradas
                    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                    .map((parada, index) => (
                      <div
                        key={parada.idParada || index}
                        className="content-box-outline-8-small p-3 flex items-center gap-2"
                      >
                        <span className="text-xs font-medium text-secondary bg-primary/20 px-2 py-1 rounded">
                          {parada.orden || index + 1}
                        </span>
                        <span className="subtitle1 text-secondary font-medium flex-1">
                          {parada.ubicacion?.nombreUbicacion || 'Sin nombre'}
                        </span>
                        {parada.ubicacion?.direccion && (
                          <span className="btn-secondary btn px-3 py-2 text-xs text-secondary max-w-[200px]">
                            <span className="block truncate">
                              {parada.ubicacion.direccion}
                            </span>
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="content-box-outline-3-small">
              <h3 className="subtitle1 text-primary font-light mb-3">
                Detalles de la ruta
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="content-box-outline-3-small">
                  <p className="subtitle1 text-secondary font-light">
                    Duración estimada
                  </p>
                  <p className="h3 font-normal">
                    {tiempoValor}
                    {tiempoUnidad}
                  </p>
                </div>
                <div className="content-box-outline-3-small">
                  <p className="subtitle1 text-secondary font-light">
                    Distancia estimada
                  </p>
                  <p className="h3 font-normal">
                    {(Number(ruta.distancia) / 1000).toLocaleString('es-CO', {
                      maximumFractionDigits: 1,
                    })}{' '}
                    km
                  </p>
                </div>
              </div>

              <div className="content-box-outline-3-small mb-4">
                <p className="subtitle1 text-secondary font-light">
                  Precio base
                </p>
                <p className="h3 font-normal">
                  ${Number(ruta.precioBase)?.toLocaleString('es-CO') || '0'}
                </p>
              </div>

              <div className="content-box-outline-3-small mb-4">
                <p className="subtitle1 text-primary font-light">
                  Observaciones
                </p>
                <p className="subtitle1 text-secondary mt-1">
                  {ruta.observaciones || 'Sin observaciones'}
                </p>
              </div>
            </div>

            <div>
              <button
                className="btn btn-red font-medium flex text-red items-center"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
              >
                <md-icon className="text-sm">delete</md-icon>
                Eliminar ruta
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 py-4 min-h-0">
          <div className="h-full min-h-[500px] overflow-hidden rounded-xl">
            <GoogleMapComponent
              origen={origen}
              destino={destino}
              paradas={
                ruta.paradas?.map(p => p.ubicacion).filter(Boolean) || []
              }
              height="100%"
              className="w-full h-full"
              showDefaultMap={false}
              interactive={true}
            />
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="ruta"
        itemName={`${origenNombre} - ${destinoNombre}`}
      />

      <ContratoQuickCreateModal
        isOpen={isContratoModalOpen}
        onClose={() => setIsContratoModalOpen(false)}
        ruta={ruta}
        navigate={navigate}
      />
    </div>
  );
};

export default RutaProfilePage;
