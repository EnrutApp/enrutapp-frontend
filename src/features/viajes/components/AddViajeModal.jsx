import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/components/modal/Modal';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/progress/circular-progress.js';
import rutasService from '../../rutas/api/rutasService';
import turnoService from '../../turnos/api/turnoService';
import viajesService from '../api/viajesService';

const AddViajeModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rutas, setRutas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [formData, setFormData] = useState({
    idRuta: '',
    idTurno: '',
    cuposDisponibles: '0',
    estado: 'Programado',
  });

  const [selectedRuta, setSelectedRuta] = useState(null);
  const [selectedTurno, setSelectedTurno] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setFormData({
        idRuta: '',
        idTurno: '',
        cuposDisponibles: '0',
        estado: 'Programado',
      });
      setSelectedRuta(null);
      setSelectedTurno(null);
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rutasRes, turnosRes] = await Promise.all([
        rutasService.getAll(),
        turnoService.getTurnos(),
      ]);

      const rutasData = Array.isArray(rutasRes)
        ? rutasRes
        : rutasRes?.data || [];
      const turnosData = Array.isArray(turnosRes)
        ? turnosRes
        : turnosRes?.data || [];

      setRutas(rutasData);
      setTurnos(turnosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'idRuta') {
      const ruta = rutas.find(r => r.idRuta === value);
      setSelectedRuta(ruta);
    }
    if (name === 'idTurno') {
      const turno = turnos.find(t => t.idTurno === value);
      setSelectedTurno(turno);
      if (turno?.vehiculo?.capacidad) {
        setFormData(prev => ({
          ...prev,
          cuposDisponibles: String(turno.vehiculo.capacidad),
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.idRuta || !formData.idTurno) return;

    try {
      setSubmitting(true);
      const payload = {
        idRuta: formData.idRuta,
        idTurno: formData.idTurno,
        estado: formData.estado,
        cuposDisponibles: parseInt(formData.cuposDisponibles, 10),
      };

      await viajesService.createViaje(payload);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creando viaje:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary mb-4">
          Crear Nuevo Viaje
        </h2>

        {loading ? (
          <div className="flex justify-center p-8">
            <md-circular-progress indeterminate></md-circular-progress>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-secondary">Ruta</label>
              <select
                name="idRuta"
                value={formData.idRuta}
                onChange={handleChange}
                className="w-full p-2.5 bg-fill border border-border rounded-xl text-primary focus:border-primary outline-none"
              >
                <option value="">Seleccione una ruta</option>
                {rutas.map(ruta => (
                  <option key={ruta.idRuta} value={ruta.idRuta}>
                    {ruta.origen?.ubicacion?.nombreUbicacion} -{' '}
                    {ruta.destino?.ubicacion?.nombreUbicacion} ($
                    {ruta.precioBase})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-secondary">
                Turno (Conductor + Vehículo)
              </label>
              <select
                name="idTurno"
                value={formData.idTurno}
                onChange={handleChange}
                className="w-full p-2.5 bg-fill border border-border rounded-xl text-primary focus:border-primary outline-none"
              >
                <option value="">Seleccione un turno</option>
                {turnos.map(turno => (
                  <option key={turno.idTurno} value={turno.idTurno}>
                    {turno.conductor?.usuario?.nombre} - {turno.vehiculo?.placa}{' '}
                    ({new Date(turno.fecha).toLocaleDateString()} {turno.hora})
                  </option>
                ))}
              </select>
            </div>

            {(selectedRuta || selectedTurno) && (
              <div className="bg-secondary/5 p-4 rounded-xl border border-border/50 text-sm grid grid-cols-2 gap-4">
                {selectedRuta && (
                  <div>
                    <span className="block text-secondary text-xs">
                      Precio Base
                    </span>
                    <span className="font-bold text-primary">
                      ${selectedRuta.precioBase}
                    </span>
                  </div>
                )}
                {selectedTurno && (
                  <div>
                    <span className="block text-secondary text-xs">
                      Capacidad
                    </span>
                    <span className="font-bold text-primary">
                      {selectedTurno.vehiculo?.capacidad} Pasajeros
                    </span>
                  </div>
                )}
              </div>
            )}

            <md-outlined-text-field
              label="Cupos Disponibles"
              type="number"
              name="cuposDisponibles"
              value={formData.cuposDisponibles}
              onKeyup={e =>
                handleChange({
                  target: { name: 'cuposDisponibles', value: e.target.value },
                })
              }
              className="w-full"
            ></md-outlined-text-field>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <md-filled-button
                onClick={handleSubmit}
                disabled={submitting || !formData.idRuta || !formData.idTurno}
              >
                {submitting ? 'Creando...' : 'Crear Viaje'}
              </md-filled-button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddViajeModal;
