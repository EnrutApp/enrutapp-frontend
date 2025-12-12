import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useState } from 'react';
import { vehiculoService } from '../api/vehiculoService';
import { resolveAssetUrl } from '../../../shared/utils/url';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';

const VehiculoProfile = ({ vehicle, isOpen, onClose, onEdit }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [vehicleData, setVehicleData] = useState(vehicle.raw || vehicle);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!isOpen || !vehicle) return null;

  const formatDate = dateString => {
    if (!dateString) return null;
    let dateToFormat;
    if (typeof dateString === 'string' && dateString.includes('T')) {
      dateToFormat = dateString.split('T')[0];
    } else {
      dateToFormat = dateString;
    }
    const [year, month, day] = dateToFormat.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isExpired = dateString => {
    if (!dateString) return false;
    const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const imageUrl = vehicleData.fotoUrl
    ? resolveAssetUrl(vehicleData.fotoUrl)
    : '/alaskan.png';

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleEstadoChange = async () => {
    try {
      const nuevoEstado = !vehicleData.estado;
      await vehiculoService.updateVehiculo(vehicleData.idVehiculo, {
        estado: nuevoEstado,
      });
      setVehicleData({ ...vehicleData, estado: nuevoEstado });
    } catch (error) {
      alert('Error al cambiar el estado del vehículo');
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await vehiculoService.deleteVehiculo(vehicleData.idVehiculo);
      setIsDeleteModalOpen(false);
      onClose();
      window.location.reload();
    } catch (error) {
      alert(
        'Error al eliminar el vehículo: ' +
        (error.message || 'Error desconocido')
      );
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

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
          <h2 className="h4 font-medium text-primary">Perfil de Vehículo</h2>
        </div>
        <div className="flex gap-2">
          <div>
            <md-filled-button
              className="btn-add px-6 py-2"
              onClick={() => onEdit?.(vehicle)}
            >
              <md-icon slot="icon" className="text-sm text-on-primary">
                edit
              </md-icon>
              Editar datos
            </md-filled-button>
          </div>
        </div>
      </div>

      <div className="bg-primary text-on-primary content-box-small flex justify-between gap-4">
        <div>
          <h1 className="h3 text-on-primary">{vehicleData.linea}</h1>
          <span className="subtitle1 text-on-primary">{vehicleData.placa}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">
            Estado del vehículo
          </span>
          <div className="flex mt-1">
            <button
              className={`btn font-medium btn-lg flex items-center ${vehicleData.estado ? 'btn-primary' : 'btn-secondary'}`}
            >
              {vehicleData.estado ? 'Activo' : 'Inactivo'}
            </button>
          </div>
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">
            Información del vehículo
          </span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-4 content-box-outline-3-small rounded-lg">
              <span className="text-xs text-secondary font-medium">Tipo</span>
              <p className="text-sm font-semibold text-primary mt-1">
                {vehicleData.tipoVehiculo?.nombreTipoVehiculo || '-'}
              </p>
            </div>

            <div className="p-4 content-box-outline-3-small rounded-lg">
              <span className="text-xs text-secondary font-medium">Marca</span>
              <p className="text-sm font-semibold text-primary mt-1">
                {vehicleData.marcaVehiculo?.nombreMarca || '-'}
              </p>
            </div>

            <div className="p-4 content-box-outline-3-small rounded-lg">
              <span className="text-xs text-secondary font-medium">
                Modelo/Año
              </span>
              <p className="text-sm font-semibold text-primary mt-1">
                {vehicleData.modelo || '-'}
              </p>
            </div>

            <div className="p-4 content-box-outline-3-small rounded-lg">
              <span className="text-xs text-secondary font-medium">Color</span>
              <p className="text-sm font-semibold text-primary mt-1">
                {vehicleData.color || '-'}
              </p>
            </div>

            <div className="p-4 content-box-outline-3-small rounded-lg">
              <span className="text-xs text-secondary font-medium">
                Tipo de placa
              </span>
              <p className="text-sm font-semibold text-primary mt-1">
                {vehicleData.tipoPlaca === 'AMARILLA'
                  ? 'Placa amarilla'
                  : 'Placa blanca'}
              </p>
            </div>

            {vehicleData.vin && (
              <div className="p-4 content-box-outline-3-small rounded-lg">
                <span className="text-xs text-secondary font-medium">
                  VIN (Número de Identificación)
                </span>
                <p className="text-sm font-semibold text-primary mt-1">
                  {vehicleData.vin}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">
            Información del Propietario
          </span>
          <div className="mt-2">
            {vehicleData.idPropietario && vehicleData.propietario ? (
              <div className="p-4 content-box-outline-3-small rounded-lg">
                <span className="text-xs text-secondary font-medium">
                  Conductor Propietario
                </span>
                <p className="text-sm font-semibold text-primary mt-1">
                  {vehicleData.propietario.nombre}{' '}
                  {vehicleData.propietario.apellido || ''}
                </p>
                <div className="flex flex-col gap-0.5 mt-1">
                  {vehicleData.propietario.email && (
                    <p className="text-xs text-secondary">
                      {vehicleData.propietario.email}
                    </p>
                  )}
                  {vehicleData.propietario.telefono && (
                    <p className="text-xs text-secondary">
                      {vehicleData.propietario.telefono}
                    </p>
                  )}
                </div>
              </div>
            ) : vehicleData.propietarioExternoNombre ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-4 content-box-outline-3-small rounded-lg">
                  <span className="text-xs text-secondary font-medium">
                    Nombre (Externo)
                  </span>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {vehicleData.propietarioExternoNombre}
                  </p>
                </div>
                <div className="p-4 content-box-outline-3-small rounded-lg">
                  <span className="text-xs text-secondary font-medium">
                    Documento
                  </span>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {vehicleData.propietarioExternoDocumento}
                  </p>
                </div>
                <div className="p-4 content-box-outline-3-small rounded-lg">
                  <span className="text-xs text-secondary font-medium">
                    Teléfono
                  </span>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {vehicleData.propietarioExternoTelefono}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 content-box-outline-3-small rounded-lg">
                <p className="text-sm text-secondary">
                  Sin información de propietario
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">Capacidades</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-4 content-box-outline-3-small rounded-lg">
              <span className="text-xs text-secondary font-medium">
                Pasajeros
              </span>
              <p className="text-2xl font-bold text-primary mt-1">
                {vehicleData.capacidadPasajeros || '-'}
              </p>
            </div>

            <div className="p-4 content-box-outline-3-small rounded-lg">
              <span className="text-xs text-secondary font-medium">Carga</span>
              <p className="text-2xl font-bold text-primary mt-1">
                {vehicleData.capacidadCarga
                  ? `${vehicleData.capacidadCarga} kg`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">
            Documentos y vencimientos
          </span>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center content-box-outline-8-small">
              <div className="flex items-center gap-2">
                <md-icon className="text-lg text-primary">description</md-icon>
                <div>
                  <span className="text-sm font-semibold text-primary">
                    SOAT
                  </span>
                  <p className="text-xs text-secondary">
                    {vehicleData.soatVencimiento
                      ? `Vence: ${formatDate(vehicleData.soatVencimiento)}`
                      : 'Sin registrar'}
                  </p>
                </div>
              </div>
              {vehicleData.soatVencimiento &&
                isExpired(vehicleData.soatVencimiento) && (
                  <span className="btn font-medium btn-lg flex items-center btn-red">
                    Vencido
                  </span>
                )}
              {vehicleData.soatVencimiento &&
                !isExpired(vehicleData.soatVencimiento) && (
                  <span className="btn font-medium btn-lg flex items-center btn-green">
                    Vigente
                  </span>
                )}
            </div>

            <div className="flex justify-between items-center content-box-outline-8-small">
              <div className="flex items-center gap-2">
                <md-icon className="text-lg text-primary">build_circle</md-icon>
                <div>
                  <span className="text-sm font-semibold text-primary">
                    Tecnomecánica
                  </span>
                  <p className="text-xs text-secondary">
                    {vehicleData.tecnomecanicaVencimiento
                      ? `Vence: ${formatDate(vehicleData.tecnomecanicaVencimiento)}`
                      : 'Sin registrar'}
                  </p>
                </div>
              </div>
              {vehicleData.tecnomecanicaVencimiento &&
                isExpired(vehicleData.tecnomecanicaVencimiento) && (
                  <span className="btn font-medium btn-lg flex items-center btn-red">
                    Vencido
                  </span>
                )}
              {vehicleData.tecnomecanicaVencimiento &&
                !isExpired(vehicleData.tecnomecanicaVencimiento) && (
                  <span className="btn font-medium btn-lg flex items-center btn-green">
                    Vigente
                  </span>
                )}
            </div>

            <div className="flex justify-between items-center content-box-outline-8-small">
              <div className="flex items-center gap-2">
                <md-icon className="text-lg text-primary">shield</md-icon>
                <div>
                  <span className="text-sm font-semibold text-primary">
                    Seguro
                  </span>
                  <p className="text-xs text-secondary">
                    {vehicleData.seguroVencimiento
                      ? `Vence: ${formatDate(vehicleData.seguroVencimiento)}`
                      : 'Sin registrar'}
                  </p>
                </div>
              </div>
              {vehicleData.seguroVencimiento &&
                isExpired(vehicleData.seguroVencimiento) && (
                  <span className="btn font-medium btn-lg flex items-center btn-red">
                    Vencido
                  </span>
                )}
              {vehicleData.seguroVencimiento &&
                !isExpired(vehicleData.seguroVencimiento) && (
                  <span className="btn font-medium btn-lg flex items-center btn-green">
                    Vigente
                  </span>
                )}
            </div>
          </div>
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">
            Fotografía del vehículo
          </span>
          <div className="mt-2">
            <img
              src={imageUrl}
              alt={vehicleData.linea}
              className="w-full h-63 object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {vehicleData.createdAt && (
            <div className="content-box-outline-3-small">
              <span className="subtitle1 text-primary font-light">
                Fecha de registro
              </span>
              <span className="subtitle1 text-secondary mt-1">
                {new Date(vehicleData.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          {vehicleData.updatedAt && (
            <div className="content-box-outline-3-small">
              <span className="subtitle1 text-primary font-light">
                Última actualización
              </span>
              <span className="subtitle1 text-secondary mt-1">
                {new Date(vehicleData.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
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
            Eliminar vehículo
          </button>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="vehículo"
        itemName={vehicleData.linea}
      />
    </div>
  );
};

export default VehiculoProfile;
