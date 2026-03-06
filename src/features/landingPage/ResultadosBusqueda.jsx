import React, { useState, useCallback, useEffect } from 'react';
import '@material/web/icon/icon.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CityAutocomplete from './components/CityAutocomplete';
import SeatsModal from './components/SeatsModal';
import { viajeService } from '../../shared/services/viajeService';
import ubicacionesService from '../ubicaciones/api/ubicacionesService';
import GoogleMapComponent from '../../shared/components/map/components/GoogleMapComponent';

const HORARIO_SLOTS = [
  { id: 'todos', label: 'Todos', icon: 'schedule' },
  { id: 'manana', label: 'Mañana', icon: 'wb_sunny' },
  { id: 'tarde', label: 'Tarde', icon: 'wb_twilight' },
  { id: 'noche', label: 'Noche', icon: 'nights_stay' },
  { id: 'madrugada', label: 'Madrugada', icon: 'bedtime' },
];

// Obtener fecha de hoy en formato local correcto (no UTC)
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseHoraTo24 = hora => {
  const raw = String(hora || '').trim();
  if (!raw) return null;

  // Formato HH:mm (24h)
  const m24 = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = Number.parseInt(m24[1], 10);
    const mm = Number.parseInt(m24[2], 10);
    if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
    return h;
  }

  // Formato h:mm AM/PM
  const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = Number.parseInt(m12[1], 10);
    const mm = Number.parseInt(m12[2], 10);
    const periodo = m12[3].toUpperCase();
    if (h < 1 || h > 12 || mm < 0 || mm > 59) return null;
    if (periodo === 'PM' && h !== 12) h += 12;
    if (periodo === 'AM' && h === 12) h = 0;
    return h;
  }

  return null;
};

const parseHoraToMinutes = hora => {
  const raw = String(hora || '').trim();
  if (!raw) return null;

  // Formato HH:mm (24h)
  const m24 = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = Number.parseInt(m24[1], 10);
    const mm = Number.parseInt(m24[2], 10);
    if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
    return h * 60 + mm;
  }

  // Formato h:mm AM/PM
  const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = Number.parseInt(m12[1], 10);
    const mm = Number.parseInt(m12[2], 10);
    const periodo = m12[3].toUpperCase();
    if (h < 1 || h > 12 || mm < 0 || mm > 59) return null;
    if (periodo === 'PM' && h !== 12) h += 12;
    if (periodo === 'AM' && h === 12) h = 0;
    return h * 60 + mm;
  }

  return null;
};

const perteneceASlot = (slotId, horaSalida) => {
  if (slotId === 'todos') return true;
  const minutes = parseHoraToMinutes(horaSalida);
  if (minutes === null) return true;

  if (slotId === 'madrugada') return minutes >= 0 && minutes < 6 * 60;
  if (slotId === 'manana') return minutes >= 6 * 60 && minutes < 12 * 60;
  if (slotId === 'tarde') return minutes >= 12 * 60 && minutes < 18 * 60;
  if (slotId === 'noche') return minutes >= 18 * 60 && minutes < 24 * 60;
  return true;
};

const pickMejorViaje = items => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const safePrecio = v => {
    const n = Number(v?.precio);
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };

  const safeMinutes = v => {
    const n = parseHoraToMinutes(v?.horaSalida);
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };

  return items.reduce((best, current) => {
    if (!best) return current;

    const bestPrecio = safePrecio(best);
    const curPrecio = safePrecio(current);
    if (curPrecio < bestPrecio) return current;
    if (curPrecio > bestPrecio) return best;

    const bestMins = safeMinutes(best);
    const curMins = safeMinutes(current);
    if (curMins < bestMins) return current;
    return best;
  }, null);
};

const formatearFecha = fechaISO => {
  const fecha = new Date(fechaISO + 'T00:00:00');
  const meses = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  return `${fecha.getDate()}-${meses[fecha.getMonth()]}-${fecha.getFullYear().toString().slice(2)}`;
};

const formatearPrecio = precio => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio);
};

const resolveUbicacionId = ({ explicitId, cityName, items }) => {
  if (explicitId) return explicitId;
  if (!cityName) return '';
  const found = items.find(
    u => String(u.city || '').toLowerCase() === String(cityName).toLowerCase()
  );
  return found?.idUbicacion || '';
};

const findUbicacion = ({ items, idUbicacion, cityName }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  if (idUbicacion) {
    return (
      items.find(u => String(u.idUbicacion) === String(idUbicacion)) || null
    );
  }

  if (cityName) {
    return (
      items.find(
        u =>
          String(u.city || '').toLowerCase() === String(cityName).toLowerCase()
      ) || null
    );
  }

  return null;
};

const TripInfoContent = React.memo(function TripInfoContent({
  busqueda,
  ubicacionOrigen,
  ubicacionDestino,
  horaViaje,
}) {
  return (
    <div className="min-w-[240px] max-w-[280px] p-3 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
          <md-icon className="text-lg" style={{ color: '#3b82f6' }}>
            route
          </md-icon>
        </span>
        <div className="text-sm font-bold text-gray-900">
          Información del viaje
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0">Origen</span>
          <span className="text-gray-900 font-semibold text-right">
            {busqueda.origen || ubicacionOrigen?.city || '—'}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0">Destino</span>
          <span className="text-gray-900 font-semibold text-right">
            {busqueda.destino || ubicacionDestino?.city || '—'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Fecha</span>
          <span className="text-gray-900 font-semibold">
            {formatearFecha(busqueda.fecha)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Hora</span>
          <span className="text-gray-900 font-semibold">
            {horaViaje || '—'}
          </span>
        </div>
      </div>
    </div>
  );
});

const HorarioCardsPanel = React.memo(function HorarioCardsPanel({
  slots,
  selectedSlotId,
  onSelectSlot,
  onOpenSeats,
  origenLabel,
  destinoLabel,
  fechaLabel,
  isLoading,
}) {
  const selectedSlot = React.useMemo(
    () => slots.find(s => s.id === selectedSlotId),
    [slots, selectedSlotId]
  );

  const totalViajes = React.useMemo(
    () => slots.reduce((acc, s) => acc + (Number(s.count) || 0), 0),
    [slots]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-gray-900 font-black text-base">
            Horarios disponibles
          </p>
          <p className="text-gray-500 text-xs font-semibold">
            {origenLabel} <span className="text-gray-400">→</span>{' '}
            {destinoLabel}
            {fechaLabel ? (
              <span className="text-gray-400"> · {fechaLabel}</span>
            ) : null}
            {selectedSlot ? (
              <span className="text-gray-400"> · {selectedSlot.label}</span>
            ) : null}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-bold">
            {totalViajes} {totalViajes === 1 ? 'viaje' : 'viajes'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
            <md-icon
              className="text-xl animate-spin"
              style={{ color: '#6b7280' }}
            >
              refresh
            </md-icon>
          </span>
          <div className="min-w-0">
            <p className="text-gray-900 font-bold text-sm">Buscando viajes…</p>
            <p className="text-gray-400 text-xs truncate">
              Esto puede tardar unos segundos
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        {slots.map(slot => {
          const disponible = Boolean(slot.bestViaje);
          const isSelected = selectedSlotId === slot.id;

          return (
            <div
              key={slot.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectSlot(slot.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') onSelectSlot(slot.id);
              }}
              style={
                isSelected
                  ? { backgroundColor: '#0071e3', borderColor: '#0071e3' }
                  : {}
              }
              className={`relative overflow-hidden rounded-xl border transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0071e3] ${
                isSelected
                  ? 'shadow-md shadow-blue-200/60'
                  : disponible
                    ? 'bg-white border-gray-200 hover:border-[#0071e3] hover:shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-55'
              }`}
              aria-label={`Seleccionar horario ${slot.label}`}
            >
              {/* Pill accent izquierdo solo cuando no está seleccionado */}
              {!isSelected && disponible && (
                <div
                  className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                  style={{ backgroundColor: '#0071e3' }}
                />
              )}

              <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                {/* Icono + info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Icono */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={
                      isSelected
                        ? { backgroundColor: 'rgba(255,255,255,0.18)' }
                        : disponible
                          ? { backgroundColor: 'rgba(0,113,227,0.08)' }
                          : { backgroundColor: '#f3f4f6' }
                    }
                  >
                    <md-icon
                      className="text-base"
                      style={{
                        color: isSelected
                          ? '#ffffff'
                          : disponible
                            ? '#0071e3'
                            : '#9ca3af',
                        fontSize: '18px',
                      }}
                    >
                      {slot.icon}
                    </md-icon>
                  </div>

                  {/* Texto */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`font-bold text-sm leading-none truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}
                      >
                        {slot.label}
                      </p>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none shrink-0"
                        style={
                          isSelected
                            ? {
                                backgroundColor: 'rgba(255,255,255,0.22)',
                                color: '#ffffff',
                              }
                            : disponible
                              ? {
                                  backgroundColor: 'rgba(0,113,227,0.1)',
                                  color: '#0051d5',
                                }
                              : { backgroundColor: '#f3f4f6', color: '#9ca3af' }
                        }
                      >
                        {slot.count}
                      </span>
                    </div>

                    {slot.bestViaje ? (
                      <p
                        className={`text-[11px] font-semibold mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}
                      >
                        {slot.bestViaje.horaSalida}
                        <span
                          className={
                            isSelected ? ' text-blue-200' : ' text-gray-300'
                          }
                        >
                          {' '}
                          →{' '}
                        </span>
                        {slot.bestViaje.horaLlegada}
                        <span
                          className={`mx-1 ${isSelected ? 'text-blue-200' : 'text-gray-300'}`}
                        >
                          ·
                        </span>
                        <span className="truncate">
                          {slot.bestViaje.origenTerminal}
                        </span>
                      </p>
                    ) : (
                      <p
                        className={`text-[11px] font-medium mt-0.5 ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}
                      >
                        Sin disponibilidad
                      </p>
                    )}
                  </div>
                </div>

                {/* Precio + botón */}
                <div className="flex items-center gap-2 shrink-0">
                  {slot.bestViaje ? (
                    <div className="text-right hidden sm:block">
                      {slot.bestViaje.precioAnterior ? (
                        <p
                          className={`text-[10px] line-through leading-none ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}
                        >
                          {formatearPrecio(slot.bestViaje.precioAnterior)}
                        </p>
                      ) : null}
                      <p
                        className={`font-black text-base leading-none ${isSelected ? 'text-white' : 'text-gray-900'}`}
                      >
                        {slot.bestViaje.precio !== undefined
                          ? formatearPrecio(slot.bestViaje.precio)
                          : '—'}
                      </p>
                      <p
                        className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}
                      >
                        p/persona
                      </p>
                    </div>
                  ) : (
                    <span
                      className={`text-sm font-bold hidden sm:block ${isSelected ? 'text-blue-200' : 'text-gray-300'}`}
                    >
                      —
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={!slot.bestViaje}
                    onClick={e => {
                      e.stopPropagation();
                      if (slot.bestViaje) onOpenSeats(slot.bestViaje);
                    }}
                    style={
                      !slot.bestViaje
                        ? {}
                        : isSelected
                          ? { backgroundColor: '#ffffff', color: '#0051d5' }
                          : { backgroundColor: '#0071e3', color: '#ffffff' }
                    }
                    className="font-semibold text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    Ver sillas
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const ResultadosBusqueda = ({ datosIniciales, onVolverInicio }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const scrollToSection = useCallback(id => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [filtroHorario, setFiltroHorario] = useState('todos');
  const [isLoading, setIsLoading] = useState(false);
  const [seatsModalOpen, setSeatsModalOpen] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState(null);
  const [viajes, setViajes] = useState([]);
  const [error, setError] = useState(null);

  const [ubicacionesItems, setUbicacionesItems] = useState([]);
  const [ubicacionesReady, setUbicacionesReady] = useState(false);

  // Estado temporal para el formulario (no se aplica hasta buscar)
  const [formTemporal, setFormTemporal] = useState({
    origenId: searchParams.get('origenId') || datosIniciales?.origenId || '',
    destinoId: searchParams.get('destinoId') || datosIniciales?.destinoId || '',
    origen: searchParams.get('origen') || datosIniciales?.origen || '',
    destino: searchParams.get('destino') || datosIniciales?.destino || '',
    fecha: searchParams.get('fecha') || datosIniciales?.fecha || getTodayDate(),
    fechaRegreso: searchParams.get('fechaRegreso') || null,
  });

  // Estado actual de búsqueda (lo que se muestra)
  const [busqueda, setBusqueda] = useState(formTemporal);

  // Obtener viajes desde la API
  const obtenerViajes = useCallback(
    async (origen, destino, origenId, destinoId, fecha, fechaRegreso) => {
      try {
        setIsLoading(true);
        setError(null);

        const viajesCargados = await viajeService.buscarViajes({
          origen,
          destino,
          origenId,
          destinoId,
          fecha,
          fechaRegreso,
        });

        setViajes(viajesCargados || []);
      } catch (err) {
        console.error('Error al obtener viajes:', err);
        setError('Error al cargar los viajes disponibles');
        setViajes([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cargar viajes cuando se monta el componente o cuando cambia la búsqueda
  useEffect(() => {
    const tieneOrigen = Boolean(busqueda.origenId || busqueda.origen);
    const tieneDestino = Boolean(busqueda.destinoId || busqueda.destino);

    if (!tieneOrigen || !tieneDestino) {
      setViajes([]);
      return;
    }

    obtenerViajes(
      busqueda.origen,
      busqueda.destino,
      busqueda.origenId,
      busqueda.destinoId,
      busqueda.fecha,
      busqueda.fechaRegreso
    );
  }, [busqueda, obtenerViajes]);

  useEffect(() => {
    let mounted = true;

    const loadUbicaciones = async () => {
      try {
        const res = await ubicacionesService.getAll();
        const data = Array.isArray(res) ? res : res?.data || [];

        const mapped = data
          .map(u => ({
            idUbicacion: u.idUbicacion || u.id,
            city: u.nombreUbicacion || u.nombre,
            department: u.direccion || '',
            estado: u.estado !== undefined ? u.estado : u.activo,
            latitud: u.latitud,
            longitud: u.longitud,
          }))
          .filter(u => u.idUbicacion && u.city)
          .filter(u => u.estado !== false);

        if (mounted) {
          setUbicacionesItems(mapped);
          setUbicacionesReady(true);
        }
      } catch (_) {
        if (mounted) {
          setUbicacionesItems([]);
          setUbicacionesReady(true);
        }
      }
    };

    loadUbicaciones();
    return () => {
      mounted = false;
    };
  }, []);

  // Si llegan IDs (por query) pero no texto, rellenar desde ubicaciones.
  useEffect(() => {
    if (!ubicacionesReady || ubicacionesItems.length === 0) return;

    setFormTemporal(prev => {
      const next = { ...prev };
      if (prev.origenId && !prev.origen) {
        const found = ubicacionesItems.find(
          u => String(u.idUbicacion) === String(prev.origenId)
        );
        if (found) next.origen = found.city;
      }
      if (prev.destinoId && !prev.destino) {
        const found = ubicacionesItems.find(
          u => String(u.idUbicacion) === String(prev.destinoId)
        );
        if (found) next.destino = found.city;
      }
      return next;
    });
  }, [ubicacionesReady, ubicacionesItems]);

  // También mantener el estado de búsqueda sincronizado si se rellenó texto.
  useEffect(() => {
    setBusqueda(formTemporal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formTemporal.origenId, formTemporal.destinoId]);

  const handleNuevaBusqueda = useCallback(() => {
    // Si hay catálogo de ubicaciones, intentamos resolver IDs (sin depender de setState async).
    const isCatalogoDisponible = ubicacionesItems.length > 0;

    const origenResolvedId = isCatalogoDisponible
      ? resolveUbicacionId({
          explicitId: formTemporal.origenId,
          cityName: formTemporal.origen,
          items: ubicacionesItems,
        })
      : formTemporal.origenId;

    const destinoResolvedId = isCatalogoDisponible
      ? resolveUbicacionId({
          explicitId: formTemporal.destinoId,
          cityName: formTemporal.destino,
          items: ubicacionesItems,
        })
      : formTemporal.destinoId;

    if (isCatalogoDisponible) {
      if (!origenResolvedId) {
        alert('Selecciona un origen válido');
        return;
      }
      if (!destinoResolvedId) {
        alert('Selecciona un destino válido');
        return;
      }
    }

    const busquedaToApply = {
      ...formTemporal,
      origenId: origenResolvedId || '',
      destinoId: destinoResolvedId || '',
    };

    // Validar que origen y destino sean diferentes
    if (busquedaToApply.origenId && busquedaToApply.destinoId) {
      if (
        String(busquedaToApply.origenId) === String(busquedaToApply.destinoId)
      ) {
        alert('El origen y destino no pueden ser iguales');
        return;
      }
    } else if (
      busquedaToApply.origen &&
      busquedaToApply.destino &&
      busquedaToApply.origen.toLowerCase() ===
        busquedaToApply.destino.toLowerCase()
    ) {
      alert('El origen y destino no pueden ser iguales');
      return;
    }

    // Aplicar los cambios
    setBusqueda(busquedaToApply);
  }, [formTemporal, ubicacionesItems]);

  const handleIntercambiar = useCallback(() => {
    setFormTemporal(prev => ({
      ...prev,
      origen: prev.destino,
      destino: prev.origen,
      origenId: prev.destinoId,
      destinoId: prev.origenId,
    }));
  }, []);

  const viajesFiltrados = viajes.filter(viaje =>
    perteneceASlot(filtroHorario, viaje?.horaSalida)
  );

  const slotsConDatos = React.useMemo(() => {
    return HORARIO_SLOTS.map(slot => {
      const inSlot = viajes.filter(v => perteneceASlot(slot.id, v?.horaSalida));
      return {
        ...slot,
        count: inSlot.length,
        bestViaje: pickMejorViaje(inSlot),
      };
    });
  }, [viajes]);

  const handleSelectSlot = useCallback(
    slotId => {
      setFiltroHorario(slotId);
      scrollToSection('viajes');
    },
    [scrollToSection]
  );

  const handleOpenSeats = useCallback(viaje => {
    setSelectedViaje(viaje);
    setSeatsModalOpen(true);
  }, []);

  const ubicacionOrigen = React.useMemo(() => {
    return findUbicacion({
      items: ubicacionesItems,
      idUbicacion: busqueda.origenId,
      cityName: busqueda.origen,
    });
  }, [busqueda.origen, busqueda.origenId, ubicacionesItems]);

  const ubicacionDestino = React.useMemo(() => {
    return findUbicacion({
      items: ubicacionesItems,
      idUbicacion: busqueda.destinoId,
      cityName: busqueda.destino,
    });
  }, [busqueda.destino, busqueda.destinoId, ubicacionesItems]);

  const origenLabel = busqueda.origen || ubicacionOrigen?.city || '—';
  const destinoLabel = busqueda.destino || ubicacionDestino?.city || '—';

  const viajeDestacado = viajesFiltrados.length > 0 ? viajesFiltrados[0] : null;

  const horaViaje = viajeDestacado?.horaSalida || '';

  const tripInfoContent = (
    <TripInfoContent
      busqueda={busqueda}
      ubicacionOrigen={ubicacionOrigen}
      ubicacionDestino={ubicacionDestino}
      horaViaje={horaViaje}
    />
  );

  return (
    <div className="bg-white text-gray-900 font-sans overflow-x-hidden min-h-screen">
      {/* Navegación (estilo Hero Landing) */}
      <nav
        className={`fixed z-50 left-1/2 -translate-x-1/2 flex items-center justify-between transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] transform-gpu ${
          scrolled
            ? 'top-4 w-[90%] max-w-[960px] bg-[#0a0a0b]/80 backdrop-blur-2xl border border-white/10 rounded-full py-2.5 px-4 shadow-2xl'
            : 'top-0 w-full bg-transparent border-transparent rounded-none shadow-none backdrop-blur-none py-6 px-6 md:px-12'
        }`}
      >
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') navigate('/');
          }}
        >
          <div className="relative flex items-center justify-center">
            <img
              src="/logoPositivo.png"
              alt="logo"
              className={`transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] object-contain ${
                scrolled ? 'w-8 h-8' : 'w-10 h-10'
              }`}
            />
          </div>

          <span
            className={`font-bold tracking-tight text-white leading-none whitespace-nowrap transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
              scrolled ? 'text-lg opacity-100' : 'text-xl md:text-2xl'
            }`}
          >
            EnrutApp
          </span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className={`relative overflow-hidden transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] font-semibold rounded-full flex items-center justify-center group ${
            scrolled
              ? 'btn-primary h-9 px-5 text-sm hover:scale-105'
              : 'btn-primary h-10 px-6 text-sm hover:scale-105 shadow-lg shadow-white/5'
          }`}
        >
          <span className="relative z-10">Iniciar sesión</span>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </nav>

      {/* Header tipo Hero */}
      <header id="inicio" className="relative pt-20 pb-6 px-4 md:px-8">
        <div className="absolute inset-0 z-0">
          <img
            src="https://i.pinimg.com/originals/ec/cc/f7/ecccf7cc87338d7f8ea12a8e80f56418.jpg"
            alt="Fondo"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-linear-to-r from-gray-950/90 via-gray-950/60 to-gray-950/30"
            style={{
              background:
                'linear-gradient(to right, rgba(3, 7, 18, 0.9), rgba(3, 7, 18, 0.6), rgba(3, 7, 18, 0.3))',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-caption font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              Precios online exclusivos
            </div>

            <h1 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
              Selecciona tu viaje
            </h1>

            <p className="text-white/80 text-sm md:text-base max-w-3xl">
              Recuerda: los precios online son exclusivos de nuestra web y
              pueden cambiar en otros puntos de venta.
            </p>
          </div>

          {/* Formulario (estilo del hero) */}
          <div className="mt-4 w-full content-box-outline-auth-small bg-white rounded-2xl shadow-2xl p-3 md:p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="text-gray-500 subtitle2 mb-1 block">
                  Origen
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 pointer-events-none z-20">
                    <md-icon className="text-xl">location_on</md-icon>
                  </div>
                  <CityAutocomplete
                    value={formTemporal.origen}
                    onChange={value =>
                      setFormTemporal(prev => ({
                        ...prev,
                        origen: value,
                        origenId: '',
                      }))
                    }
                    onSelect={city =>
                      setFormTemporal(prev => ({
                        ...prev,
                        origen: city.city,
                        origenId: city.idUbicacion || city.id || '',
                      }))
                    }
                    placeholder="Ciudad de origen"
                    items={ubicacionesItems}
                    inputClassName="w-full !pl-14 !pr-4 py-3 input bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleIntercambiar}
                  className="p-2 rounded-full bg-white border border-gray-200 text-gray-700 shadow-md hover:shadow-lg hover:scale-110 transition-all flex items-center justify-center"
                  title="Intercambiar origen y destino"
                >
                  <md-icon className="text-xl">swap_vert</md-icon>
                </button>
              </div>

              <div className="md:col-span-3">
                <label className="text-gray-500 subtitle2 mb-1 block">
                  Destino
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 pointer-events-none z-20">
                    <md-icon className="text-xl">flag</md-icon>
                  </div>
                  <CityAutocomplete
                    value={formTemporal.destino}
                    onChange={value =>
                      setFormTemporal(prev => ({
                        ...prev,
                        destino: value,
                        destinoId: '',
                      }))
                    }
                    onSelect={city =>
                      setFormTemporal(prev => ({
                        ...prev,
                        destino: city.city,
                        destinoId: city.idUbicacion || city.id || '',
                      }))
                    }
                    placeholder="Ciudad de destino"
                    items={ubicacionesItems}
                    inputClassName="w-full !pl-14 !pr-4 py-3 input bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-500 subtitle2 mb-1 block">
                  Fecha de ida
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 pointer-events-none">
                    <md-icon className="text-xl">event</md-icon>
                  </div>
                  <input
                    type="date"
                    value={formTemporal.fecha}
                    min={getTodayDate()}
                    onChange={e =>
                      setFormTemporal(prev => ({
                        ...prev,
                        fecha: e.target.value,
                      }))
                    }
                    className="w-full !pl-14 !pr-12 py-3 input bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-500 subtitle2 mb-1 block">
                  Regreso (opcional)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 pointer-events-none">
                    <md-icon className="text-xl">event</md-icon>
                  </div>
                  <input
                    type="date"
                    value={formTemporal.fechaRegreso || ''}
                    min={getTodayDate()}
                    onChange={e =>
                      setFormTemporal(prev => ({
                        ...prev,
                        fechaRegreso: e.target.value,
                      }))
                    }
                    className="w-full !pl-14 !pr-12 py-3 input bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <button
                  onClick={handleNuevaBusqueda}
                  disabled={isLoading}
                  className="w-full btn btn-primary font-medium text-subtitle2 flex items-center justify-center gap-2 py-3 rounded-xl disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <md-icon className="animate-spin">refresh</md-icon>
                      <span>Buscando…</span>
                    </>
                  ) : (
                    <>
                      <md-icon>search</md-icon>
                      <span className="hidden sm:inline">Buscar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 py-6">
        {/* Encabezado de resultados */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
              Resultados de tu búsqueda
            </h2>
            <p className="text-gray-500 text-sm font-semibold">
              {origenLabel} <span className="text-gray-400">→</span>{' '}
              {destinoLabel}
              {busqueda.fecha ? (
                <span className="text-gray-400">
                  {' '}
                  · {formatearFecha(busqueda.fecha)}
                </span>
              ) : null}
            </p>
          </div>

          <div className="text-gray-500 text-xs font-bold">
            {!isLoading ? (
              <span>
                {viajes.length} {viajes.length === 1 ? 'viaje' : 'viajes'}
              </span>
            ) : (
              <span>Buscando…</span>
            )}
          </div>
        </div>

        {/* Horarios (izquierda) + Mapa (derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <section className="lg:col-span-7 order-1">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 lg:min-h-[520px]">
              <HorarioCardsPanel
                slots={slotsConDatos}
                selectedSlotId={filtroHorario}
                onSelectSlot={handleSelectSlot}
                onOpenSeats={handleOpenSeats}
                origenLabel={origenLabel}
                destinoLabel={destinoLabel}
                fechaLabel={
                  busqueda.fecha ? formatearFecha(busqueda.fecha) : ''
                }
                isLoading={isLoading}
              />
            </div>
          </section>

          <section className="lg:col-span-5 order-2">
            {ubicacionOrigen?.latitud &&
            ubicacionOrigen?.longitud &&
            ubicacionDestino?.latitud &&
            ubicacionDestino?.longitud ? (
              <div className="bg-black border border-gray-200 rounded-2xl overflow-hidden h-[320px] sm:h-[380px] lg:h-[520px] flex flex-col">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-gray-900 font-black text-sm">
                    Mapa de la ruta
                  </p>
                  <p className="text-gray-500 text-xs font-semibold truncate">
                    {origenLabel} <span className="text-gray-400">→</span>{' '}
                    {destinoLabel}
                    {busqueda.fecha ? (
                      <span className="text-gray-400">
                        {' '}
                        · {formatearFecha(busqueda.fecha)}
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="flex-1 min-h-0">
                  <GoogleMapComponent
                    origen={ubicacionOrigen}
                    destino={ubicacionDestino}
                    height="100%"
                    initialZoom={10}
                    interactive={true}
                    enableMarkerHoverInfo={true}
                    originInfoContent={tripInfoContent}
                    destinationInfoContent={tripInfoContent}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-[240px] sm:h-[280px] lg:h-[520px] flex flex-col">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-gray-900 font-black text-sm">
                    Mapa de la ruta
                  </p>
                  <p className="text-gray-500 text-xs font-semibold truncate">
                    Selecciona un origen y destino
                  </p>
                </div>

                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-gray-400 text-sm font-semibold text-center">
                    Selecciona un origen y destino para ver la ruta en el mapa.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Etiqueta de viajes recomendados */}
        <div
          id="viajes"
          className="flex items-center justify-between gap-3 mb-4"
        >
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-lg md:text-xl font-black text-gray-900 truncate">
              Viajes disponibles
            </h3>
            <span className="bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
              EN LÍNEA
            </span>
          </div>

          <span className="text-gray-500 text-xs font-bold shrink-0">
            {filtroHorario === 'todos'
              ? 'Todas las franjas'
              : 'Filtrado por franja'}
          </span>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                <md-icon className="text-xl text-red-500">error</md-icon>
              </span>
              <div>
                <p className="text-gray-900 font-black text-sm">
                  No pudimos cargar los viajes
                </p>
                <p className="text-gray-500 text-xs font-semibold">{error}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Lista de viajes */}
        {!isLoading && viajesFiltrados.length > 0 && (
          <div className="space-y-4">
            {viajesFiltrados.map((viaje, index) => (
              <div
                key={viaje.id}
                className="bg-black rounded-2xl border border-gray-200 transition-all duration-300 hover:border-blue-400 overflow-hidden shadow-sm"
              >
                <div className="p-6">
                  <div className="grid md:grid-cols-12 gap-6 items-center">
                    {/* Logo y categoría */}
                    <div className="md:col-span-2">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <md-icon className="text-2xl text-gray-600">
                            directions_bus
                          </md-icon>
                        </div>
                        <div className="text-center">
                          <h4 className="text-gray-900 font-bold text-sm">
                            {viaje.categoria}
                          </h4>
                          <p className="text-gray-400 text-xs">
                            {viaje.categoriaDesc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Horarios */}
                    <div className="md:col-span-6">
                      <div className="flex bg-black items-center gap-4">
                        {/* Salida */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="p-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-600">
                              <md-icon className="text-xl">
                                {viaje.icono}
                              </md-icon>
                            </span>
                            <span className="text-3xl font-black text-gray-900">
                              {viaje.horaSalida}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold">
                            {viaje.origenTerminal}
                          </p>
                        </div>

                        {/* Ruta */}
                        <div className="flex flex-col items-center gap-1 px-4">
                          <span className="text-xs text-gray-400 font-semibold">
                            {viaje.rutas} ruta
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="h-0.5 w-12 bg-gray-300"></div>
                            <md-icon
                              className="text-xl"
                              style={{ color: '#3b82f6' }}
                            >
                              arrow_forward
                            </md-icon>
                            <div className="h-0.5 w-12 bg-gray-300"></div>
                          </div>
                        </div>

                        {/* Llegada */}
                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-3xl font-black text-gray-900">
                              {viaje.horaLlegada}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold">
                            {viaje.destinoTerminal}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Precio y acción */}
                    <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4">
                      <div className="text-right">
                        {index === 0 && (
                          <div className="flex items-center justify-end gap-2 mb-2">
                            <span className="p-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-600">
                              <md-icon className="text-sm">bolt</md-icon>
                            </span>
                            <span className="text-gray-500 text-xs font-bold">
                              {viaje.etiqueta}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-black-400 line-through text-sm">
                            {formatearPrecio(viaje.precioAnterior)}
                          </span>
                        </div>
                        <div className="text-3xl font-black text-blue">
                          {formatearPrecio(viaje.precio)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenSeats(viaje)}
                        className="btn btn-primary font-medium text-subtitle2 px-6 py-3 rounded-xl whitespace-nowrap hover:scale-105 transition-transform"
                      >
                        Ver sillas
                      </button>
                    </div>
                  </div>

                  {/* Enlace ver detalles */}
                  {/* Removido: Ver detalles */}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && viajes.length > 0 && viajesFiltrados.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                <md-icon className="text-xl" style={{ color: '#6b7280' }}>
                  info
                </md-icon>
              </span>
              <div className="min-w-0">
                <p className="text-gray-900 font-black text-sm">
                  No hay viajes en esta franja
                </p>
                <p className="text-gray-500 text-xs font-semibold">
                  Prueba seleccionando otra franja horaria para ver más
                  opciones.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!isLoading && viajes.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-4">
              <md-icon className="text-3xl" style={{ color: '#9ca3af' }}>
                search_off
              </md-icon>
            </div>
            <p className="text-gray-900 font-black text-lg mb-1">
              Sin resultados
            </p>
            <p className="text-gray-500 text-sm">
              No encontramos viajes disponibles para{' '}
              <span className="font-bold text-gray-700">{origenLabel}</span>
              {' → '}
              <span className="font-bold text-gray-700">{destinoLabel}</span>
              {busqueda.fecha ? (
                <>
                  {' '}
                  el{' '}
                  <span className="font-bold text-gray-700">
                    {formatearFecha(busqueda.fecha)}
                  </span>
                </>
              ) : null}
              . Intenta con otra fecha u otro destino.
            </p>
          </div>
        )}
      </main>

      {/* Modal de sillas */}
      <SeatsModal
        isOpen={seatsModalOpen}
        onClose={() => {
          setSeatsModalOpen(false);
          setSelectedViaje(null);
        }}
        viaje={selectedViaje}
      />
    </div>
  );
};

export default ResultadosBusqueda;
