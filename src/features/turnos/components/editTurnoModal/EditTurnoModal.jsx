import Modal from '../../../../shared/components/modal/Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState, useEffect } from 'react';
import conductorService from '../../../conductores/api/conductorService';
import vehiculoService from '../../../vehiculos/api/vehiculoService';

const turnoFields = [
  { label: 'Conductor', name: 'idConductor', type: 'select', required: true },
  { label: 'Vehículo', name: 'idVehiculo', type: 'select', required: true },
  { label: 'Fecha', name: 'fecha', type: 'date', required: true },
  {
    label: 'Hora',
    name: 'hora',
    type: 'text',
    required: true,
    placeholder: '4:00 AM',
  },
  { label: 'Estado', name: 'estado', type: 'select', required: true },
];

export default function EditTurnoModal({
  isOpen,
  onClose,
  turno,
  onUpdateTurno,
}) {
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState({
    idConductor: '',
    idVehiculo: '',
    fecha: '',
    hora: '',
    estado: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && turno) {
      const fechaLocal = turno.fecha ? turno.fecha.split('T')[0] : '';
      setForm({
        idConductor: turno.idConductor || '',
        idVehiculo: turno.idVehiculo || '',
        fecha: fechaLocal,
        hora: turno.hora || '',
        estado: turno.estado || 'Programado',
      });
      setError(null);
      setSuccess(false);
      cargarDatos();
    }
  }, [isOpen, turno]);

  useEffect(() => {
    if (!isOpen) {
      setForm({
        idConductor: '',
        idVehiculo: '',
        fecha: '',
        hora: '',
        estado: '',
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    try {
      const [resConductores, resVehiculos] = await Promise.all([
        conductorService.getConductores(),
        vehiculoService.getVehiculos(),
      ]);

      const listConductores = resConductores?.data || resConductores;
      const listVehiculos = resVehiculos?.data || resVehiculos;

      setConductores(Array.isArray(listConductores) ? listConductores : []);
      setVehiculos(Array.isArray(listVehiculos) ? listVehiculos : []);
    } catch (err) {
      console.error('Error al cargar datos', err);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    for (const field of turnoFields) {
      if (field.required && !form[field.name]) {
        setError(`El campo "${field.label}" es obligatorio.`);
        setLoading(false);
        return;
      }
    }

    if (!form.hora.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
      setError('La hora debe tener el formato HH:MM AM/PM (ejemplo: 4:00 AM)');
      setLoading(false);
      return;
    }

    try {
      const fechaISO = new Date(form.fecha).toISOString();

      await onUpdateTurno(turno.idTurno, {
        ...form,
        fecha: fechaISO,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al actualizar turno');
    } finally {
      setLoading(false);
    }
  };

  const title = 'Editar turno';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
        <div className="flex items-center gap-1 mb-4">
          <button
            type="button"
            onClick={onClose}
            className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
          >
            <md-icon className="text-xl flex items-center justify-center">
              close
            </md-icon>
          </button>
        </div>

        <div className="px-44">
          <div className="leading-tight mb-5">
            <h2 className="h2 font-medium text-primary">{title}</h2>
            <p className="h5 text-secondary font-medium">
              Aquí puedes editar información del turno
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 mb-4">
              {turnoFields.map(field => (
                <div key={field.name} className="flex flex-col gap-1">
                  <label
                    className="subtitle1 text-primary font-medium"
                    htmlFor={field.name}
                  >
                    {field.label}
                  </label>
                  {field.type === 'select' && field.name === 'idConductor' ? (
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                        aria-label="Conductor"
                      >
                        <option value="">Seleccione un conductor</option>
                        {conductores.map(c => (
                          <option key={c.idConductor} value={c.idConductor}>
                            {c.nombre} {c.apellido} - {c.cedula}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : field.type === 'select' && field.name === 'idVehiculo' ? (
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                        aria-label="Vehículo"
                      >
                        <option value="">Seleccione un vehículo</option>
                        {vehiculos.map(v => (
                          <option key={v.idVehiculo} value={v.idVehiculo}>
                            {v.placa} - {v.linea} (
                            {v.marcaVehiculo?.nombreMarca || ''})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : field.type === 'select' && field.name === 'estado' ? (
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        value={form[field.name] || 'Programado'}
                        onChange={handleChange}
                        className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                        aria-label="Estado"
                      >
                        <option value="Programado">Programado</option>
                        <option value="Completado">Completado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={form[field.name] || ''}
                      onChange={handleChange}
                      className="w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                    />
                  )}
                  {field.name === 'hora' && (
                    <span className="text-xs text-secondary">
                      Formato: HH:MM AM/PM (ejemplo: 4:00 AM)
                    </span>
                  )}
                </div>
              ))}
            </div>
            {error && <div className="text-red mb-2">{error}</div>}
            {success && (
              <div className="text-green mb-2 text-center">
                <strong>¡Turno actualizado correctamente!</strong>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn px-5 text-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <md-filled-button
                className="btn-add px-24 flex items-center justify-center gap-2"
                type="submit"
                disabled={loading || success}
              >
                {loading && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {loading
                  ? 'Actualizando...'
                  : success
                    ? 'Actualizado'
                    : 'Actualizar'}
              </md-filled-button>
            </div>
          </form>
        </div>
      </main>
    </Modal>
  );
}
