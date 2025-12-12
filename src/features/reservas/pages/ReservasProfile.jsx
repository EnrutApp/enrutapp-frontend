import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useState } from 'react';

const ReservasProfile = ({ reserva, isOpen, onClose, onEdit, onDelete }) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen || !reserva) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleEdit = () => {
    onEdit(reserva);
  };

  const handleDelete = () => {
    onDelete(reserva);
    handleClose();
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
          <h2 className="h4 font-medium text-primary">Detalle de la reserva</h2>
        </div>
        <div className="flex gap-2">
          <div>
            <md-filled-button
              className="btn-add px-6 py-2"
              onClick={handleEdit}
            >
              <md-icon slot="icon" className="text-sm text-on-primary">
                edit
              </md-icon>
              Editar reserva
            </md-filled-button>
          </div>
        </div>
      </div>

      <div className="bg-primary text-on-primary content-box-small">
        <h1 className="h3 text-on-primary">
          {reserva.origen} - {reserva.destino}
        </h1>
        <span className="subtitle1 font-medium text-on-primary">
          Fecha: {reserva.fecha}
        </span>
        <span className="subtitle1 font-medium text-on-primary">
          Hora: {reserva.hora}
        </span>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Estado de la reserva
            </span>
            <div className="flex mt-1">
              <button
                className={`btn font-medium btn-lg flex items-center ${
                  reserva.estado === 'Pendiente'
                    ? 'btn-yellow'
                    : reserva.estado === 'Completada'
                      ? 'btn-green'
                      : 'btn-red'
                }`}
              >
                {reserva.estado || 'Pendiente'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Información del viaje
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Origen: {reserva.origen || 'N/A'}
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Destino: {reserva.destino || 'N/A'}
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Fecha: {reserva.fecha || 'N/A'}
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Hora: {reserva.hora || 'N/A'}
            </span>
            <div className="flex mt-3">
              <button
                className="btn btn-primary font-medium btn-lg flex items-center"
                onClick={handleEdit}
              >
                Editar información
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Cliente y pasajeros
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Cliente: {reserva.nombreCliente || 'N/A'}
            </span>
            <span className="subtitle1 text-secondary mt-1">
              Total de pasajeros:{' '}
              {Array.isArray(reserva.pasajeros) ? reserva.pasajeros.length : 0}
            </span>
            {Array.isArray(reserva.pasajeros) &&
            reserva.pasajeros.length > 0 ? (
              <div className="mt-3 space-y-2">
                {reserva.pasajeros.map((pasajero, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-fill rounded border border-outline"
                  >
                    <span className="text-sm text-primary">
                      {idx + 1}.{' '}
                      {typeof pasajero === 'string'
                        ? pasajero
                        : pasajero.nombre}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Precio</span>
            <span className="subtitle1 text-secondary mt-1">
              Precio: $
              {reserva.precio ? parseFloat(reserva.precio).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <button
            className="font-medium flex text-red items-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleDelete}
          >
            <md-icon className="text-sm">delete</md-icon>
            Eliminar reserva
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservasProfile;
