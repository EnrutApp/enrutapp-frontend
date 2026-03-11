import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useEffect, useState } from 'react';
import { encomiendasService } from '../api/encomiendasService';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import EditEncomiendaModal from '../components/EditEncomiendaModal';

const InfoRow = ({ label, value }) =>
  value ? (
    <span className="text-sm text-secondary">
      {label}: <span className="text-primary">{value}</span>
    </span>
  ) : null;

const EncomiendaProfile = ({ encomienda, isOpen, onClose, onRefresh, onAddNew }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [data, setData] = useState(encomienda);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  useEffect(() => {
    if (encomienda) setData(encomienda);
  }, [encomienda]);

  if (!isOpen || !data) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 200);
  };

  const handleVerificar = async (val) => {
    setLoadingVerify(true);
    try {
      const updated = await encomiendasService.updateVerificado(data.idEncomienda, val);
      setData(updated);
      onRefresh?.();
    } catch {} finally { setLoadingVerify(false); }
  };

  const handleUpdated = (updated) => {
    setData(updated);
    onRefresh?.();
  };

  const handleDeleteConfirm = async () => {
    try {
      await encomiendasService.delete(data.idEncomienda);
      onRefresh?.();
      handleClose();
    } catch {}
    finally { setIsDeleteModalOpen(false); }
  };

  const fotoUrl     = encomiendasService.resolvePhoto(data);
  const origen      = encomiendasService.getOrigen(data);
  const destino     = encomiendasService.getDestino(data);
  const destDir     = encomiendasService.getDestinoDireccion(data);
  const fecha       = encomiendasService.getFecha(data);
  const hora        = encomiendasService.getHora(data);
  const conductor   = encomiendasService.getConductor(data);
  const vehiculo    = encomiendasService.getVehiculo(data);
  const estadoColor = encomiendasService.getEstadoColor(data.estado);

  return (
    <div
      className={`flex flex-col gap-4 overflow-auto ${isClosing ? 'profile-exit' : 'profile-enter'}`}
      style={{ background: 'var(--background)', boxSizing: 'border-box', width: '100%', height: '100%' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <button
            onClick={handleClose}
            className="text-secondary p-2 mr-2 btn-search rounded-full hover:text-primary transition-colors cursor-pointer"
          >
            <md-icon className="text-xl flex items-center justify-center">close</md-icon>
          </button>
          <h2 className="h4 font-medium text-primary">Encomiendas</h2>
        </div>
        <div className="flex gap-2">
          <md-filled-button className="btn-add px-6 py-2" onClick={() => setIsEditOpen(true)}>
            <md-icon slot="icon" className="text-sm text-on-primary">edit</md-icon>
            Editar encomienda
          </md-filled-button>
          <md-filled-button className="btn-add px-5" onClick={onAddNew}>
            <md-icon slot="icon" className="text-sm text-on-primary">add</md-icon>
            Asignar una encomienda
          </md-filled-button>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-primary text-on-primary content-box-small">
        <h1 className="h3 text-on-primary font-bold">
          {data.remitenteNombre}
          <span className="mx-2 font-light">
            <md-icon className="">arrow_right</md-icon>
          </span>
          {data.destinatarioNombre}
        </h1>
        <span className="subtitle1 text-on-primary opacity-90">{data.estado}</span>
      </div>

      {/* Grid content */}
      <div className="flex flex-col gap-3 flex-1">

        {/* Estado */}
        <div className="content-box-outline-3-small">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <span className="subtitle1 text-primary font-medium">Estado de la encomienda</span>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`btn font-medium btn-lg flex items-center ${estadoColor}`}>
                  {data.estado}
                </span>
                {data.verificado ? (
                  <span className="btn btn-green btn-lg flex items-center gap-1">
                    <md-icon className="text-sm">verified</md-icon>Verificado
                  </span>
                ) : (
                  <span className="btn btn-secondary btn-lg flex items-center gap-1">
                    Por verificar
                  </span>
                )}
              </div>
            </div>
            {fotoUrl && (
              <img
                src={fotoUrl}
                alt="Encomienda"
                className="w-[90px] h-[90px] object-cover rounded-xl border border-border cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                onClick={() => setIsPhotoOpen(true)}
                title="Ver foto completa"
              />
            )}
          </div>
        </div>

        {/* Detalles + Ubicación */}
        <div className="grid grid-cols-2 gap-3">
          <div className="content-box-outline-3-small flex flex-col gap-1">
            <span className="subtitle1 text-primary font-medium">Detalles de la encomienda</span>
            <InfoRow label="Envía"         value={data.remitenteNombre} />
            <InfoRow label="Recibe"        value={data.destinatarioNombre} />
            <InfoRow label="Observaciones" value={data.observaciones} />
            <InfoRow label="Fecha de envío" value={fecha} />
            <InfoRow label="Hora de envío"  value={hora} />
          </div>
          <div className="content-box-outline-3-small flex flex-col gap-1">
            <span className="subtitle1 text-primary font-medium">Ubicación</span>
            <InfoRow label="Origen"  value={origen} />
            <InfoRow label="Destino" value={destDir || destino} />
            <div className="flex gap-1 mt-2 flex-wrap">
              <span className="btn btn-secondary btn-sm flex items-center gap-1">
                <md-icon className="text-xs">sync_alt</md-icon>
              </span>
              {origen  && <span className="btn btn-secondary btn-sm">{origen}</span>}
              {destino && <span className="btn btn-secondary btn-sm">{destino}</span>}
            </div>
          </div>
        </div>

        {/* Turno + Descripción */}
        <div className="grid grid-cols-2 gap-3">
          <div className="content-box-outline-3-small flex flex-col gap-1">
            <span className="subtitle1 text-primary font-medium">Turno Asignado</span>
            {data.turno ? (
              <>
                <InfoRow label="Conductor" value={conductor} />
                {vehiculo && <span className="text-sm text-secondary">{vehiculo}</span>}
                {hora     && <span className="text-sm text-secondary">{hora}</span>}
                <button className="btn btn-secondary btn-lg font-medium flex items-center gap-1 mt-2 w-fit">
                  <md-icon className="text-sm">edit</md-icon>
                  Editar asignación
                </button>
              </>
            ) : (
              <span className="text-sm text-secondary mt-1">Sin turno asignado</span>
            )}
          </div>
          <div className="content-box-outline-3-small flex flex-col gap-1">
            <span className="subtitle1 text-primary font-medium">Descripción</span>
            <p className="text-sm text-secondary mt-1">{data.descripcion}</p>
          </div>
        </div>

        {/* Foto con verificación */}
        {fotoUrl && (
          <div className="content-box-outline-3-small flex flex-col gap-3">
            <span className="subtitle1 text-primary font-medium">Foto de la encomienda</span>
            <div className="flex gap-4 items-start">
              <img
                src={fotoUrl}
                alt="Encomienda"
                className="w-40 h-40 rounded-xl border border-border object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsPhotoOpen(true)}
                title="Ver foto completa"
              />
              <div className="flex gap-2 mt-2">
                <button
                  className="btn btn-red btn-lg font-medium flex items-center gap-1"
                  disabled={loadingVerify}
                  onClick={() => handleVerificar(false)}
                >
                  <md-icon className="text-sm">cancel</md-icon>
                  No verificar
                </button>
                <button
                  className="btn btn-green btn-lg font-medium flex items-center gap-1"
                  disabled={loadingVerify}
                  onClick={() => handleVerificar(true)}
                >
                  <md-icon className="text-sm">verified</md-icon>
                  Verificar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete button */}
        <div className="mt-2">
          <button
            className="font-medium flex text-red items-center gap-1"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <md-icon className="text-sm">delete</md-icon>
            Eliminar encomienda
          </button>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="encomienda"
        itemName={`${data.remitenteNombre} → ${data.destinatarioNombre}`}
      />

      {/* Lightbox de foto */}
      {isPhotoOpen && fotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={() => setIsPhotoOpen(false)}
        >
          <button
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            onClick={() => setIsPhotoOpen(false)}
          >
            <md-icon>close</md-icon>
          </button>
          <img
            src={fotoUrl}
            alt="Encomienda"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <EditEncomiendaModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        encomienda={data}
        onUpdated={handleUpdated}
      />
    </div>
  );
};

export default EncomiendaProfile;

