import Modal from '../../../../shared/components/modal/Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useEffect, useState } from 'react';
import conductorService from '../../../conductores/api/conductorService';
import vehiculoService from '../../../vehiculos/api/vehiculoService';
import rutasService from '../../../rutas/api/rutasService';

const buildTimeSlots = (stepMinutes = 60) => {
  const slots = [];
  for (let totalMinutes = 0; totalMinutes < 24 * 60; totalMinutes += stepMinutes) {
    const hour24 = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    slots.push(`${hour12}:${String(minute).padStart(2, '0')} ${period}`);
  }
  return slots;
};

const TIME_SLOTS = buildTimeSlots(60);

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

const pad2 = n => String(n).padStart(2, '0');

const formatYMD = date => {
  if (!date) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const parseYMD = ymd => {
  if (!ymd || typeof ymd !== 'string') return null;
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const formatDateLongEs = date => {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
};

const capitalizeFirst = text => {
  if (!text || typeof text !== 'string') return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatDateLongEsTitle = date => {
  if (!date) return '';
  return capitalizeFirst(formatDateLongEs(date));
};

const startOfDay = date => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const formatDateShortEs = date => {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
  }).format(date);
};

const formatDayHeaderEs = date => {
  if (!date) return '';
  const raw = formatDateShortEs(date);
  const noComma = raw.replace(',', '');
  return noComma.charAt(0).toUpperCase() + noComma.slice(1);
};

const time24ToAmPm = hhmm => {
  if (!hhmm || typeof hhmm !== 'string') return '';
  const [hh, mm] = hhmm.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return '';
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${String(mm).padStart(2, '0')} ${period}`;
};

export default function EditTurnoModal({ isOpen, onClose, turno, onUpdateTurno }) {
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [form, setForm] = useState({
    idConductor: '',
    idVehiculo: '',
    idRuta: '',
    fecha: '',
    hora: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    if (!isOpen) {
      setForm({
        idConductor: '',
        idVehiculo: '',
        idRuta: '',
        fecha: '',
        hora: '',
      });
      setRutas([]);
      setError(null);
      setSuccess(false);
      setLoading(false);
      setLoadingCatalogs(false);
      setCalendarMonth(new Date().getMonth());
      setCalendarYear(new Date().getFullYear());
      setShowCustomTime(false);
      setCustomTime('');
      setIsTimePickerOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fechaRaw = turno?.fechaRaw || turno?.raw?.fecha || turno?.fecha;
    const fechaDate = fechaRaw ? new Date(fechaRaw) : null;
    const ymd = fechaDate && !Number.isNaN(fechaDate.getTime()) ? formatYMD(fechaDate) : '';

    setForm({
      idConductor: turno?.idConductor || '',
      idVehiculo: turno?.idVehiculo || '',
      idRuta: turno?.idRuta || '',
      fecha: ymd,
      hora: turno?.hora || '',
    });

    if (fechaDate && !Number.isNaN(fechaDate.getTime())) {
      setCalendarMonth(fechaDate.getMonth());
      setCalendarYear(fechaDate.getFullYear());
    } else {
      setCalendarMonth(new Date().getMonth());
      setCalendarYear(new Date().getFullYear());
    }

    setIsTimePickerOpen(false);
    setShowCustomTime(false);
    setCustomTime('');
    setError(null);
    setSuccess(false);

    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, turno?.idTurno]);

  const cargarDatos = async () => {
    setLoadingCatalogs(true);
    try {
      const [resConductores, resVehiculos, resRutas] = await Promise.all([
        conductorService.getConductores(),
        vehiculoService.getVehiculos(),
        rutasService.getAll(),
      ]);

      const listConductores = resConductores?.data || resConductores;
      const listVehiculos = resVehiculos?.data || resVehiculos;
      const listRutas = resRutas?.data || resRutas;

      setConductores(
        Array.isArray(listConductores)
          ? listConductores.filter(c => c.estado && c.idConductor)
          : []
      );
      setVehiculos(Array.isArray(listVehiculos) ? listVehiculos.filter(v => v.estado) : []);
      setRutas(Array.isArray(listRutas) ? listRutas : []);
    } catch (err) {
      console.error('Error al cargar datos', err);
    } finally {
      setLoadingCatalogs(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.idConductor) return 'Selecciona un conductor';
    if (!form.idVehiculo) return 'Selecciona un vehículo';
    if (!form.idRuta) return 'Selecciona una ruta';
    if (!form.fecha) return 'La fecha es obligatoria';
    if (!form.hora) return 'La hora es obligatoria';
    if (!form.fecha.match(/^\d{4}-\d{2}-\d{2}$/)) return 'Selecciona una fecha válida';
    if (!TIME_SLOTS.includes(form.hora)) return 'Selecciona una hora válida';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!turno?.idTurno) {
      setError('No se encontró el turno a editar');
      return;
    }

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setLoading(true);
      const fechaISO = new Date(`${form.fecha}T00:00:00`).toISOString();

      await onUpdateTurno(turno.idTurno, {
        ...form,
        fecha: fechaISO,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al actualizar turno');
    } finally {
      setLoading(false);
    }
  };

  const selectedDate = parseYMD(form.fecha);
  const selectedDateText = selectedDate ? formatDateLongEsTitle(selectedDate) : '';
  const selectedDateShort = selectedDate ? formatDayHeaderEs(selectedDate) : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <main className="relative">
        {(loading || loadingCatalogs) && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="list-enter max-h-[67vh] overflow-hidden">
          <div>
            {!success ? (
              <>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-4 mb-4">
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-4 md:gap-0 md:h-[520px]">
                          {/* Panel izquierdo: Calendario */}
                          <section className="rounded-3xl md:rounded-r-none bg-black p-4 md:h-full flex flex-col overflow-hidden">
                            <header className="flex items-center justify-between gap-3 mb-4">
                              <div className="flex gap-2 justify-center items-center">
                                <button
                                  type="button"
                                  onClick={onClose}
                                  className="text-secondary p-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
                                  disabled={loading}
                                  aria-label="Cerrar"
                                >
                                  <md-icon className="text-xl flex items-center justify-center">close</md-icon>
                                </button>

                                <h3 className="h4 font-medium text-primary">
                                  {capitalizeFirst(MONTHS_ES[calendarMonth])} de {calendarYear}
                                </h3>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  className="btn-search w-10 h-10 p-0 rounded-full flex items-center justify-center"
                                  onClick={() => {
                                    const prev = new Date(calendarYear, calendarMonth - 1, 1);
                                    setCalendarMonth(prev.getMonth());
                                    setCalendarYear(prev.getFullYear());
                                  }}
                                  disabled={loading}
                                  aria-label="Mes anterior"
                                >
                                  <md-icon className="text-xl flex items-center justify-center leading-none">chevron_left</md-icon>
                                </button>
                                <button
                                  type="button"
                                  className="btn-search w-10 h-10 p-0 rounded-full flex items-center justify-center"
                                  onClick={() => {
                                    const next = new Date(calendarYear, calendarMonth + 1, 1);
                                    setCalendarMonth(next.getMonth());
                                    setCalendarYear(next.getFullYear());
                                  }}
                                  disabled={loading}
                                  aria-label="Mes siguiente"
                                >
                                  <md-icon className="text-xl flex items-center justify-center leading-none">chevron_right</md-icon>
                                </button>
                              </div>
                            </header>

                            <div className="grid grid-cols-7 gap-2 mb-2">
                              {DAYS_ES.map(d => (
                                <div key={d} className="text-[11px] text-secondary text-center">
                                  {d}
                                </div>
                              ))}
                            </div>

                            {(() => {
                              const today = startOfDay(new Date());
                              const firstDay = new Date(calendarYear, calendarMonth, 1);
                              const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
                              const startOffset = firstDay.getDay();
                              const daysInMonth = lastDay.getDate();
                              const cells = [];
                              for (let i = 0; i < startOffset; i++) cells.push(null);
                              for (let day = 1; day <= daysInMonth; day++) {
                                cells.push(new Date(calendarYear, calendarMonth, day));
                              }

                              return (
                                <div className="grid grid-cols-7 gap-2">
                                  {cells.map((date, idx) => {
                                    if (!date) {
                                      return <div key={`empty-${idx}`} className="h-12" />;
                                    }

                                    const isSelected =
                                      selectedDate &&
                                      date.getFullYear() === selectedDate.getFullYear() &&
                                      date.getMonth() === selectedDate.getMonth() &&
                                      date.getDate() === selectedDate.getDate();

                                    const isPast = today && startOfDay(date) < today;

                                    return (
                                      <button
                                        key={date.toISOString()}
                                        type="button"
                                        disabled={loading || isPast}
                                        onClick={() => {
                                          if (isPast) return;
                                          setForm(prev => ({
                                            ...prev,
                                            fecha: formatYMD(date),
                                            hora: '',
                                          }));
                                          setShowCustomTime(false);
                                          setCustomTime('');
                                          setIsTimePickerOpen(true);
                                        }}
                                        className={`h-12 rounded-2xl border text-sm font-medium transition-colors ${isSelected
                                          ? 'bg-primary text-on-primary border-primary'
                                          : 'bg-black text-primary border-border hover:bg-primary hover:text-on-primary hover:border-primary'
                                          } ${isPast ? 'opacity-40 cursor-not-allowed hover:bg-black hover:text-primary hover:border-border' : ''}`}
                                      >
                                        {date.getDate()}
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </section>

                          {/* Panel derecho: Selecciones + horas */}
                          <section className="rounded-3xl md:rounded-l-none bg-fill pt-4 px-4 pb-2 md:h-full flex flex-col gap-3 overflow-hidden min-h-0">
                            {!isTimePickerOpen ? (
                              <>
                                <div className="flex flex-col gap-3">
                                  <div className="select-wrapper w-full">
                                    <md-icon className="text-sm">arrow_drop_down</md-icon>
                                    <select
                                      name="idConductor"
                                      value={form.idConductor || ''}
                                      onChange={handleChange}
                                      className="select-filter w-full px-4 input bg-fill border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                      disabled={loading}
                                    >
                                      <option value="">Selecciona un conductor</option>
                                      {conductores.map(c => (
                                        <option key={c.idConductor} value={c.idConductor}>
                                          {(c.usuario?.nombre || '').trim() || 'Conductor'}
                                          {c.usuario?.apellido ? ` ${c.usuario.apellido}` : ''}
                                          {' - '}
                                          {(c.usuario?.numDocumento || '').trim() || 'Sin documento'}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="select-wrapper w-full">
                                    <md-icon className="text-sm">arrow_drop_down</md-icon>
                                    <select
                                      name="idVehiculo"
                                      value={form.idVehiculo || ''}
                                      onChange={handleChange}
                                      className="select-filter w-full px-4 input bg-fill border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                      disabled={loading}
                                    >
                                      <option value="">Vehículo</option>
                                      {vehiculos.map(v => (
                                        <option key={v.idVehiculo} value={v.idVehiculo}>
                                          {v.placa} - {v.linea} ({v.marcaVehiculo?.nombreMarca || ''})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="select-wrapper w-full">
                                    <md-icon className="text-sm">arrow_drop_down</md-icon>
                                    <select
                                      name="idRuta"
                                      value={form.idRuta || ''}
                                      onChange={handleChange}
                                      className="select-filter w-full px-4 input bg-fill border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                      disabled={loading}
                                    >
                                      <option value="">Ruta</option>
                                      {rutas.map(r => {
                                        const origen = r.origen?.ubicacion?.nombreUbicacion || 'Origen';
                                        const destino = r.destino?.ubicacion?.nombreUbicacion || 'Destino';
                                        return (
                                          <option key={r.idRuta} value={r.idRuta}>
                                            {origen} - {destino}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="border border-border rounded-2xl bg-fill px-4 py-3 flex items-start gap-3 text-left hover:opacity-90 transition-opacity"
                                  disabled={loading || !selectedDate}
                                  onClick={() => {
                                    if (!selectedDate) return;
                                    setIsTimePickerOpen(true);
                                  }}
                                >
                                  <md-icon className="text-xl text-secondary">calendar_today</md-icon>
                                  <div className="flex flex-col">
                                    <p className="subtitle2 text-primary font-medium">
                                      {selectedDate ? selectedDateText : 'Selecciona una fecha'}
                                    </p>
                                    <p className="text-sm text-secondary">
                                      {form.hora ? form.hora : 'Selecciona una hora'}
                                    </p>
                                  </div>
                                </button>

                                <div className="mt-auto flex justify-end">
                                  <button
                                    type="submit"
                                    className="btn btn-primary py-3 px-10 rounded-full font-medium text-subtitle1 flex items-center justify-center gap-2"
                                    disabled={loading || loadingCatalogs}
                                  >
                                    {loading && (
                                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    )}
                                    {loading ? 'Actualizando...' : 'Actualizar'}
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    className="btn-search p-2 rounded-full"
                                    disabled={loading}
                                    onClick={() => {
                                      setIsTimePickerOpen(false);
                                      setShowCustomTime(false);
                                      setCustomTime('');
                                    }}
                                    aria-label="Volver"
                                  >
                                    <md-icon className="text-xl">close</md-icon>
                                  </button>

                                  <p className="subtitle1 text-primary font-medium text-left truncate">
                                    {selectedDate ? selectedDateShort : 'Selecciona un día'}
                                  </p>

                                  <button
                                    type="button"
                                    className="btn-search-compact rounded-full ml-auto"
                                    disabled={loading || !selectedDate}
                                    onClick={() => setShowCustomTime(v => !v)}
                                  >
                                    Hora personalizada
                                  </button>
                                </div>

                                {showCustomTime && (
                                  <div>
                                    <input
                                      type="time"
                                      value={customTime}
                                      onChange={e => {
                                        const value = e.target.value;
                                        setCustomTime(value);
                                        const ampm = time24ToAmPm(value);
                                        if (ampm) {
                                          setForm(prev => ({ ...prev, hora: ampm }));
                                        }
                                      }}
                                      className="w-full px-4 py-3 rounded-xl bg-fill border border-border text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                      disabled={loading}
                                    />
                                    <p className="text-[11px] text-secondary mt-2">
                                      Se guardará como formato AM/PM.
                                    </p>
                                  </div>
                                )}

                                <div className="border border-border rounded-2xl bg-fill p-3 flex-1 overflow-hidden flex flex-col min-h-0">
                                  {!selectedDate ? (
                                    <div className="flex-1 flex items-center justify-center">
                                      <p className="text-sm text-secondary">Selecciona un día en el calendario</p>
                                    </div>
                                  ) : (
                                    <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-2 min-h-0">
                                      {TIME_SLOTS.map(slot => {
                                        const selected = form.hora === slot;
                                        return (
                                          <button
                                            key={slot}
                                            type="button"
                                            onClick={() => {
                                              setForm(prev => ({ ...prev, hora: slot }));
                                              setShowCustomTime(false);
                                              setCustomTime('');
                                              setIsTimePickerOpen(false);
                                            }}
                                            disabled={loading}
                                            className={`w-full px-4 py-2 rounded-2xl border flex items-center justify-center transition-colors ${selected
                                              ? 'bg-primary text-on-primary border-primary'
                                              : 'bg-fill text-primary border-border hover:bg-primary hover:text-on-primary hover:border-primary'
                                              }`}
                                          >
                                            <span className="subtitle2 font-medium">{slot}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </section>
                        </div>
                      </>
                  </div>

                  {error && (
                    <div className="bg-red/10 border border-red/30 rounded-lg p-3 mt-4">
                      <p className="text-red text-sm">{error}</p>
                    </div>
                  )}
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex items-center justify-center mb-4 mt-3">
                  <md-icon className="text-green text-3xl">event_available</md-icon>
                </div>

                <div className="text-center mb-6">
                  <h2 className="h4 font-medium text-primary">¡Turno actualizado exitosamente!</h2>
                </div>

                <div className="bg-fill rounded-xl p-6 max-w-md w-full mb-8 flex items-start gap-4">
                  <md-icon className="text-blue text-2xl mt-1">info</md-icon>
                  <div className="flex flex-col gap-2">
                    <p className="text-primary font-medium">
                      Fecha:{' '}
                      <span className="text-secondary font-normal">
                        {selectedDate ? formatDateLongEsTitle(selectedDate) : form.fecha}
                      </span>
                    </p>
                    <p className="text-primary font-medium">
                      Hora: <span className="text-secondary font-normal">{form.hora}</span>
                    </p>
                  </div>
                </div>

                <button type="button" onClick={onClose} className="btn btn-primary px-10" disabled={loading}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </Modal>
  );
}
