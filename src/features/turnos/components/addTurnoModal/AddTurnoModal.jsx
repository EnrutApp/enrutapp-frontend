import Modal from '../../../../shared/components/modal/Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useState, useEffect } from 'react';
import conductorService from '../../../conductores/api/conductorService';
import vehiculoService from '../../../vehiculos/api/vehiculoService';

const AddTurnoModal = ({ isOpen, onClose, onConfirm, onSubmitTurno }) => {
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState({
    idConductor: '',
    idVehiculo: '',
    fecha: '',
    hora: '',
    estado: 'Programado',
  });
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm({
        idConductor: '',
        idVehiculo: '',
        fecha: '',
        hora: '',
        estado: 'Programado',
      });
      setError(null);
      setSuccess(false);
      setLoading(false);
      setLoadingCatalogs(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const cargarDatos = async () => {
    setLoadingCatalogs(true);
    try {
      const [resConductores, resVehiculos] = await Promise.all([
        conductorService.getConductores(),
        vehiculoService.getVehiculos(),
      ]);

      const listConductores = resConductores?.data || resConductores;
      const listVehiculos = resVehiculos?.data || resVehiculos;

      setConductores(
        Array.isArray(listConductores)
          ? listConductores.filter(c => c.estado)
          : []
      );
      setVehiculos(
        Array.isArray(listVehiculos) ? listVehiculos.filter(v => v.estado) : []
      );
    } catch (err) {
      console.error('Error al cargar datos', err);
    } finally {
      setLoadingCatalogs(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleEstado = () => {
    setForm({
      ...form,
      estado: form.estado === 'Programado' ? 'Cancelado' : 'Programado',
    });
  };

  const validate = () => {
    if (!form.idConductor) return 'Selecciona un conductor';
    if (!form.idVehiculo) return 'Selecciona un vehículo';
    if (!form.fecha) return 'La fecha es obligatoria';
    if (!form.hora) return 'La hora es obligatoria';
    if (!form.hora.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
      return 'La hora debe tener el formato HH:MM AM/PM (ejemplo: 4:00 AM)';
    }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      const fechaISO = new Date(form.fecha).toISOString();

      await onSubmitTurno({
        ...form,
        fecha: fechaISO,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al crear turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <main className="relative">
        {(loading || loadingCatalogs) && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
          {!success && (
            <div className="flex items-center gap-1 mb-4">
              <button
                type="button"
                onClick={onClose}
                className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
                disabled={loading}
              >
                <md-icon className="text-xl flex items-center justify-center">
                  close
                </md-icon>
              </button>
            </div>
          )}

          <div className="px-8 md:px-20">
            {!success ? (
              <>
                <div className="leading-tight mb-6">
                  <h2 className="h2 font-medium text-primary">Asignar turno</h2>
                  <p className="h5 text-secondary font-medium">
                    Completa la información del turno
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-4 mb-4">
                    {loadingCatalogs ? (
                      <div className="flex flex-col items-center justify-center gap-3 p-6">
                        <md-linear-progress
                          indeterminate
                          class="w-full"
                        ></md-linear-progress>
                        <p className="text-secondary text-sm">
                          Cargando catálogos...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Conductor <span className="text-red">*</span>
                          </label>
                          <div className="select-wrapper w-full">
                            <md-icon className="text-sm">
                              arrow_drop_down
                            </md-icon>
                            <select
                              name="idConductor"
                              value={form.idConductor || ''}
                              onChange={handleChange}
                              className="select-filter w-full px-4 input bg-fill border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              disabled={loading}
                            >
                              <option value="">Seleccione un conductor</option>
                              {conductores.map(c => (
                                <option
                                  key={c.idConductor}
                                  value={c.idConductor}
                                >
                                  {c.nombre} {c.apellido} - {c.cedula}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Vehículo <span className="text-red">*</span>
                          </label>
                          <div className="select-wrapper w-full">
                            <md-icon className="text-sm">
                              arrow_drop_down
                            </md-icon>
                            <select
                              name="idVehiculo"
                              value={form.idVehiculo || ''}
                              onChange={handleChange}
                              className="select-filter w-full px-4 input bg-fill border border-border rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              disabled={loading}
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
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Fecha <span className="text-red">*</span>
                          </label>
                          <input
                            name="fecha"
                            type="date"
                            value={form.fecha}
                            onChange={handleChange}
                            className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all date-secondary"
                            disabled={loading}
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Hora <span className="text-red">*</span>
                          </label>
                          <input
                            name="hora"
                            type="text"
                            value={form.hora}
                            onChange={handleChange}
                            placeholder="4:00 AM"
                            className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            disabled={loading}
                          />
                          <span className="text-xs text-secondary">
                            Formato: HH:MM AM/PM (ejemplo: 4:00 AM)
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Estado del turno
                          </label>
                          <div className="flex items-center gap-3">
                            {form.estado === 'Programado' ? (
                              <span className="flex items-center gap-1 px-3 py-2 bg-green/10 text-green rounded-full text-sm font-medium">
                                <md-icon className="text-base">
                                  check_circle
                                </md-icon>
                                Programado
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-3 py-2 bg-red/10 text-red rounded-full text-sm font-medium">
                                <md-icon className="text-base">cancel</md-icon>
                                Cancelado
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={toggleEstado}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                form.estado === 'Programado'
                                  ? 'bg-red/10 text-red hover:bg-red/20'
                                  : 'bg-green/10 text-green hover:bg-green/20'
                              }`}
                              disabled={loading}
                            >
                              {form.estado === 'Programado'
                                ? 'Cancelar'
                                : 'Programar'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red/10 border border-red/30 rounded-lg p-3 mt-4">
                      <p className="text-red text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2 pt-2 mt-8">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-secondary w-1/2"
                      disabled={loading}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                      disabled={loading || loadingCatalogs}
                    >
                      {loading && (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      {loading ? 'Creando...' : 'Crear turno'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-green/20 rounded-full animate-ping"></div>

                  <div className="flex items-center justify-center mb-4 mt-3 animate-scale-in">
                    <md-icon className="text-green text-3xl">
                      event_available
                    </md-icon>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="h4 font-medium text-primary animate-slide-up">
                    ¡Turno creado exitosamente!
                  </h2>
                </div>

                <div className="bg-fill rounded-xl p-6 max-w-md w-full mb-8 flex items-start gap-4">
                  <md-icon className="text-blue text-2xl mt-1">
                    schedule
                  </md-icon>
                  <div className="flex-1">
                    <p className="text-primary font-semibold mb-1">
                      {form.hora} -{' '}
                      {form.fecha
                        ? new Date(form.fecha + 'T00:00:00').toLocaleDateString(
                            'es-ES'
                          )
                        : ''}
                    </p>
                    <p className="text-secondary text-sm">
                      El turno ya está disponible en el sistema
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className="btn btn-primary px-10 py-3 animate-slide-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  Finalizar
                </button>

                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                                            @keyframes scale-in {
                                                0% {
                                                    transform: scale(0);
                                                    opacity: 0;
                                                }
                                                50% {
                                                    transform: scale(1.1);
                                                }
                                                100% {
                                                    transform: scale(1);
                                                    opacity: 1;
                                                }
                                            }
                                            
                                            @keyframes slide-up {
                                                0% {
                                                    transform: translateY(20px);
                                                    opacity: 0;
                                                }
                                                100% {
                                                    transform: translateY(0);
                                                    opacity: 1;
                                                }
                                            }

                                            @keyframes fade-in {
                                                0% {
                                                    opacity: 0;
                                                }
                                                100% {
                                                    opacity: 1;
                                                }
                                            }

                                            .animate-scale-in {
                                                animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                                            }

                                            .animate-slide-up {
                                                animation: slide-up 0.5s ease-out forwards;
                                                opacity: 0;
                                            }

                                            .animate-fade-in {
                                                animation: fade-in 0.3s ease-out;
                                            }
                                        `,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </Modal>
  );
};

export default AddTurnoModal;
