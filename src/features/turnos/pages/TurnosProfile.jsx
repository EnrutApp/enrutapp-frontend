import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../routes';

const TurnosProfile = ({ turno, isOpen, onClose, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen || !turno) return null;

  const raw = turno.raw || turno;

  const formatFechaLarga = fecha => {
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return turno.fecha || '';
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const conductorNombre = raw.conductor?.usuario
    ? `${raw.conductor.usuario.nombre || ''} ${raw.conductor.usuario.apellido || ''}`.trim()
    : turno.conductor || 'Sin conductor';

  const vehiculoLabel = raw.vehiculo
    ? `${raw.vehiculo.placa} - ${raw.vehiculo.linea}${raw.vehiculo.marcaVehiculo?.nombreMarca ? ` (${raw.vehiculo.marcaVehiculo.nombreMarca})` : ''}`
    : turno.vehiculo || 'Sin vehículo';

  const rutaLabel = turno.ruta
    ? turno.ruta
    : raw.ruta
      ? `${raw.ruta.origen?.ubicacion?.nombreUbicacion || 'Origen'} - ${raw.ruta.destino?.ubicacion?.nombreUbicacion || 'Destino'}`
      : 'Sin ruta';

  const estadoLabel = raw.estado || turno.estado || 'Programado';

  const isPlacaBlanca = raw?.vehiculo?.tipoPlaca === 'BLANCA';

  const counts = turno.counts || {
    pasajes: raw._count?.pasajes ?? 0,
    encomiendas: raw._count?.encomiendas ?? 0,
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
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
          <h2 className="h4 font-medium text-primary">Detalle del turno</h2>
        </div>
        <div className="flex gap-2">
          {isPlacaBlanca && (
            <md-filled-button
              className="btn-search-minimal px-6 py-2"
              onClick={() =>
                navigate(
                  `${ROUTES.ADMIN.CONTRATOS_NUEVO}?idTurno=${encodeURIComponent(
                    raw.idTurno || turno.idTurno || ''
                  )}`
                )
              }
            >
              <md-icon slot="icon" className="text-sm text-secondary">
                description
              </md-icon>
              Generar contrato
            </md-filled-button>
          )}
          <md-filled-button
            className="btn-add px-6 py-2"
            onClick={() => onEdit?.(turno)}
          >
            <md-icon slot="icon" className="text-sm text-on-primary">
              edit
            </md-icon>
            Editar
          </md-filled-button>
        </div>
      </div>

      <div className="bg-primary text-on-primary content-box-small flex justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="h3 text-on-primary">{conductorNombre}</h1>
          <span className="subtitle1 font-medium text-on-primary">
            Vehículo: {vehiculoLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Programación</span>
            <span className="subtitle1 text-secondary mt-1">
              Fecha: {formatFechaLarga(raw.fecha || turno.fechaRaw || turno.fecha)}
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Hora: {raw.hora || turno.hora}
            </span>
            <div className='mt-2'>
              <span className="px-3 py-1 rounded-full bg-background border border-border text-[11px] text-secondary">
                {estadoLabel}
              </span>
            </div>
          </div>

          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Ruta</span>
            <span className="subtitle1 text-secondary mt-1">{rutaLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Resumen</span>
            <span className="subtitle1 text-secondary mt-1">
              Pasajes: {counts.pasajes}
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Encomiendas: {counts.encomiendas}
            </span>
          </div>

          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Conductor</span>
            <span className="subtitle1 text-secondary mt-1">
              Documento: {raw.conductor?.usuario?.numDocumento || 'No registrado'}
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Teléfono: {raw.conductor?.usuario?.telefono || 'No registrado'}
            </span>
          </div>
        </div>

        <div>
          <button
            className="btn btn-red font-medium flex text-red items-center"
            onClick={e => {
              e.stopPropagation();
              onDelete?.(turno);
            }}
          >
            <md-icon className="text-sm">delete</md-icon>
            Eliminar turno
          </button>
        </div>
      </div>
    </div>
  );
};

export default TurnosProfile;
