import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState } from 'react';

const TurnoDetail = ({ turno, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !turno) return null;

  const raw = turno.raw || turno;

  const formatFecha = fecha => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoBadgeClass = estado => {
    switch (estado) {
      case 'Completado':
        return 'btn-primary';
      case 'Programado':
        return 'btn-secondary';
      case 'Cancelado':
        return 'btn-outline text-red';
      default:
        return 'btn-outline';
    }
  };

  return (
    <section className="list-enter">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onClose}
          className="btn btn-secondary btn-lg font-medium flex items-center"
        >
          <md-icon className="text-sm">arrow_back</md-icon>
        </button>
        <h1 className="h4 font-medium">Detalle del turno</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => onEdit(turno)}
          className="btn btn-primary btn-lg font-medium flex items-center"
        >
          <md-icon slot="icon" className="text-sm text-on-primary">
            edit
          </md-icon>
          Editar turno
        </button>
        <button
          onClick={() => onEdit(turno)}
          className="btn btn-secondary btn-lg font-medium flex items-center"
        >
          <md-icon slot="icon" className="text-sm">
            assignment
          </md-icon>
          Asignar turno
        </button>
        <button
          onClick={() => onDelete(turno)}
          className="btn btn-outline text-red btn-lg font-medium flex items-center"
        >
          <md-icon slot="icon" className="text-sm">
            delete
          </md-icon>
          Eliminar turno
        </button>
      </div>

      <div className="content-box-outline-4">
        <div className="mb-6">
          <h2 className="h3 font-bold mb-2">
            {raw.conductor
              ? `${raw.conductor.nombre} ${raw.conductor.apellido}`
              : turno.conductor}
          </h2>
          <div className="flex items-center gap-2">
            <span className="subtitle1 text-secondary">Vehículo:</span>
            <span className="subtitle1">
              {raw.vehiculo
                ? `${raw.vehiculo.placa} - ${raw.vehiculo.linea}`
                : turno.vehiculo}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="h5 font-medium mb-3">Estado del turno</h3>
          <button
            className={`btn btn-lg font-medium ${getEstadoBadgeClass(raw.estado || turno.estado)}`}
          >
            {raw.estado || turno.estado}
          </button>
        </div>

        <div className="border-t border-outline pt-6">
          <h3 className="h5 font-medium mb-4">Información</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="subtitle2 text-secondary block mb-1">
                Fecha
              </label>
              <p className="body1">{formatFecha(raw.fecha || turno.fecha)}</p>
            </div>
            <div>
              <label className="subtitle2 text-secondary block mb-1">
                Hora
              </label>
              <p className="body1">{raw.hora || turno.hora}</p>
            </div>
            <div>
              <label className="subtitle2 text-secondary block mb-1">
                Vehículo
              </label>
              <p className="body1">
                {raw.vehiculo
                  ? `${raw.vehiculo.placa} - ${raw.vehiculo.linea} (${raw.vehiculo.marcaVehiculo?.nombreMarca || ''})`
                  : turno.vehiculo}
              </p>
            </div>
            <div>
              <label className="subtitle2 text-secondary block mb-1">
                Conductor
              </label>
              <p className="body1">
                {raw.conductor
                  ? `${raw.conductor.nombre} ${raw.conductor.apellido}`
                  : turno.conductor}
              </p>
            </div>
            {raw.conductor?.cedula && (
              <div>
                <label className="subtitle2 text-secondary block mb-1">
                  Cédula del conductor
                </label>
                <p className="body1">{raw.conductor.cedula}</p>
              </div>
            )}
            {raw.conductor?.telefono && (
              <div>
                <label className="subtitle2 text-secondary block mb-1">
                  Teléfono del conductor
                </label>
                <p className="body1">{raw.conductor.telefono}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TurnoDetail;
