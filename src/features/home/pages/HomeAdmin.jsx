import '@material/web/icon/icon.js';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { ROUTES } from '../../../routes/constants/routeConstants';
import turnoService from '../../turnos/api/turnoService';

const toNumber = value => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrencyCOP = value => {
  const safe = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(0)}`;
  }
};

const parseDateOnlyLocal = value => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === 'string') {
    const s = value.trim();
    // Captura YYYY-MM-DD al inicio, incluso si viene con hora/UTC (e.g. 2025-12-12T00:00:00.000Z)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      return new Date(y, mo - 1, d);
    }
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return d;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const startOfDay = date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameLocalDay = (a, b) => {
  const da = startOfDay(a);
  const db = startOfDay(b);
  return da.getTime() === db.getTime();
};

const getWeekStartMonday = date => {
  const d = startOfDay(date);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const inRange = (date, start, endExclusive) => {
  const t = date.getTime();
  return t >= start.getTime() && t < endExclusive.getTime();
};

const parseHoraToMinutes = hora => {
  const raw = String(hora ?? '').trim();
  if (!raw) return Number.POSITIVE_INFINITY;

  // Formatos comunes: "HH:mm" / "H:mm" / "H:mm AM" / "H:MMAM"
  const m = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return Number.POSITIVE_INFINITY;
  let h = Number(m[1] ?? 0);
  const min = Number(m[2] ?? 0);
  const ap = (m[3] ?? '').toUpperCase();
  if (ap === 'AM') {
    if (h === 12) h = 0;
  } else if (ap === 'PM') {
    if (h !== 12) h += 12;
  }
  return h * 60 + min;
};

const HomeAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = useMemo(() => new Date(), []);
  const day = useMemo(() => today.getDate(), [today]);
  const month = useMemo(
    () => today.toLocaleString('es-ES', { month: 'long' }),
    [today]
  );
  const weekday = useMemo(
    () => today.toLocaleString('es-ES', { weekday: 'long' }),
    [today]
  );

  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIngresos, setLoadingIngresos] = useState(false);
  const [error, setError] = useState('');
  const [ingresosHoy, setIngresosHoy] = useState(0);

  const nombreSaludo = useMemo(() => {
    const full = user?.nombre || user?.usuario?.nombre || '';
    const first = String(full).trim().split(' ')[0];
    return first || 'Administrador';
  }, [user]);

  const todayStart = useMemo(() => startOfDay(today), [today]);
  const tomorrowStart = useMemo(() => addDays(todayStart, 1), [todayStart]);

  const weekStart = useMemo(() => getWeekStartMonday(today), [today]);
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const lastWeekStart = useMemo(() => addDays(weekStart, -7), [weekStart]);
  const lastWeekEnd = useMemo(() => weekStart, [weekStart]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await turnoService.getTurnos();
        const data = Array.isArray(res)
          ? res
          : res?.data ?? res?.data?.data ?? [];
        if (!mounted) return;
        setTurnos(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setError('No se pudieron cargar los datos del dashboard.');
        setTurnos([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const turnosHoy = useMemo(() => {
    const list = Array.isArray(turnos) ? turnos : [];
    return list
      .filter(t => {
        const fecha = parseDateOnlyLocal(t?.fecha);
        if (Number.isNaN(fecha.getTime())) return false;
        return inRange(fecha, todayStart, tomorrowStart);
      })
      .sort((a, b) => parseHoraToMinutes(a?.hora) - parseHoraToMinutes(b?.hora));
  }, [turnos, todayStart, tomorrowStart]);

  const turnosEstaSemana = useMemo(() => {
    const list = Array.isArray(turnos) ? turnos : [];
    return list.filter(t => {
      const fecha = parseDateOnlyLocal(t?.fecha);
      if (Number.isNaN(fecha.getTime())) return false;
      return inRange(fecha, weekStart, weekEnd);
    });
  }, [turnos, weekStart, weekEnd]);

  const turnosSemanaPasada = useMemo(() => {
    const list = Array.isArray(turnos) ? turnos : [];
    return list.filter(t => {
      const fecha = parseDateOnlyLocal(t?.fecha);
      if (Number.isNaN(fecha.getTime())) return false;
      return inRange(fecha, lastWeekStart, lastWeekEnd);
    });
  }, [turnos, lastWeekStart, lastWeekEnd]);

  const viajesSemanaDiff = useMemo(() => {
    const nowCount = turnosEstaSemana.length;
    const prevCount = turnosSemanaPasada.length;
    return nowCount - prevCount;
  }, [turnosEstaSemana.length, turnosSemanaPasada.length]);

  const mensajeSemana = useMemo(() => {
    if (loading) return 'Cargando…';
    const nowCount = turnosEstaSemana.length;
    const prevCount = turnosSemanaPasada.length;
    if (nowCount === 0 && prevCount === 0) return 'Aún no hay turnos esta semana';
    if (nowCount > prevCount) return 'Esta semana está más ocupada que la pasada';
    if (nowCount < prevCount) return 'Esta semana está más tranquila que la pasada';
    return 'Esta semana está igual que la pasada';
  }, [loading, turnosEstaSemana.length, turnosSemanaPasada.length]);

  const viajesPorDiaSemana = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const rows = days.map(d => {
      const count = turnosEstaSemana.reduce((acc, t) => {
        const fecha = parseDateOnlyLocal(t?.fecha);
        if (Number.isNaN(fecha.getTime())) return acc;
        return isSameLocalDay(fecha, d) ? acc + 1 : acc;
      }, 0);

      const label = d.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
      });

      return { iso: d.toISOString().slice(0, 10), label, count };
    });
    return rows;
  }, [turnosEstaSemana, weekStart]);

  useEffect(() => {
    let mounted = true;

    const loadIngresosHoy = async () => {
      if (!turnosHoy.length) {
        setIngresosHoy(0);
        return;
      }

      setLoadingIngresos(true);
      try {
        const ids = turnosHoy.map(t => t?.idTurno).filter(Boolean);
        const batches = [];
        const chunkSize = 6;
        for (let i = 0; i < ids.length; i += chunkSize) {
          batches.push(ids.slice(i, i + chunkSize));
        }

        let total = 0;
        for (const batch of batches) {
          const results = await Promise.all(
            batch.map(async id => {
              try {
                const res = await turnoService.getTurnoById(id);
                return res?.data ?? res?.data?.data ?? null;
              } catch {
                return null;
              }
            })
          );

          for (const t of results) {
            if (!t) continue;
            const pasajes = Array.isArray(t.pasajes) ? t.pasajes : [];
            const encomiendas = Array.isArray(t.encomiendas) ? t.encomiendas : [];
            const totalPasajes = pasajes.reduce(
              (acc, p) => acc + toNumber(p?.precio),
              0
            );
            const totalEncomiendas = encomiendas.reduce(
              (acc, e) => acc + toNumber(e?.precio),
              0
            );
            total += totalPasajes + totalEncomiendas;
          }
        }

        if (!mounted) return;
        setIngresosHoy(total);
      } finally {
        if (!mounted) return;
        setLoadingIngresos(false);
      }
    };

    loadIngresosHoy();
    return () => {
      mounted = false;
    };
  }, [turnosHoy]);

  return (
    <section className="list-enter flex gap-4 max-w-7xl mx-auto">
      <div className="flex-1 max-w-2xl">
        <div className="mb-4">
          <h1 className="h4 font-bold">Hola, {nombreSaludo}</h1>
          <p className="text-secondary subtitle2">
            {weekday.charAt(0).toUpperCase() + weekday.slice(1)}, {day} de{' '}
            {month.charAt(0).toUpperCase() + month.slice(1)}
          </p>
        </div>

        <div className="bg-primary text-on-primary content-box-small mb-4">
          <span className="opacity-08 h5 font-light">Ingresos de hoy</span>
          <span className="h3 font-bold">
            {loadingIngresos ? 'Cargando…' : formatCurrencyCOP(ingresosHoy)}
          </span>
        </div>

        <div className="content-box-outline-small">
          <div className="flex flex-col mb-3">
            <span className="subtitle2">Viajes de hoy</span>
            <span className="h4">
              {weekday.charAt(0).toUpperCase() + weekday.slice(1)}, {day} de{' '}
              {month.charAt(0).toUpperCase() + month.slice(1)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {error ? (
              <div className="content-box-outline-2-small">
                <span className="subtitle2 text-secondary">{error}</span>
              </div>
            ) : loading ? (
              <div className="content-box-outline-2-small">
                <span className="subtitle2 text-secondary">Cargando…</span>
              </div>
            ) : turnosHoy.length === 0 ? (
              <div className="content-box-outline-2-small">
                <span className="subtitle2 text-secondary">
                  No hay viajes programados para hoy
                </span>
              </div>
            ) : (
              turnosHoy.slice(0, 6).map(t => {
                const rutaLabel = t?.ruta
                  ? `${t.ruta.origen?.ubicacion?.nombreUbicacion || 'Origen'} - ${t.ruta.destino?.ubicacion?.nombreUbicacion || 'Destino'
                  }`
                  : 'Ruta';

                const conductorNombre = t?.conductor?.usuario
                  ? `${t.conductor.usuario.nombre || ''} ${t.conductor.usuario.apellido || ''
                    }`.trim() || 'Sin conductor'
                  : 'Sin conductor';

                const hora = String(t?.hora || '').trim() || '—';

                return (
                  <div key={t.idTurno} className="content-box-outline-2-small">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <span className="subtitle2">{hora} | {rutaLabel}</span>
                        <h2 className="h5">{conductorNombre}</h2>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-primary btn-lg flex items-center"
                          onClick={() => navigate(ROUTES.ADMIN.TURNOS)}
                        >
                          <md-icon slot="edit" className="text-sm">
                            edit
                          </md-icon>
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md content-box-outline-small">
        <div className="mb-4">
          <h1 className="h4 font-light text-primary">Resumen semanal</h1>
          <p className="text-secondary subtitle2">
            {mensajeSemana}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="content-box-outline-3-small">
            <div className="flex flex-col">
              <span className="subtitle2 font-light">Viajes esta semana</span>
              <h2 className="h3 text-primary font-bold">
                {loading ? '—' : `${turnosEstaSemana.length} viajes`}
              </h2>
            </div>
          </div>

          <div className="content-box-outline-3-small">
            <div className="flex flex-col gap-2">
              <div>
                <span className="subtitle2 font-light">Semana pasada</span>
                <h2 className="h3 text-primary font-bold">
                  {loading ? '—' : `${turnosSemanaPasada.length} viajes`}
                </h2>
              </div>
              <button
                className="btn btn-primary btn-lg font-medium self-start"
                onClick={() => navigate(ROUTES.ADMIN.TURNOS)}
                disabled={loading}
              >
                <md-icon slot="icon" className="text-sm">
                  {viajesSemanaDiff >= 0 ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                </md-icon>
                {loading
                  ? '—'
                  : `${viajesSemanaDiff >= 0 ? '+' : ''}${viajesSemanaDiff} Viajes`}
              </button>
            </div>
          </div>

          <div className="content-box-outline-3-small">
            <div className="flex flex-col">
              <span className="subtitle2 font-light">Viajes de la semana</span>
              <div className="mt-3 flex flex-col gap-2">
                {loading ? (
                  <span className="subtitle2 text-secondary">Cargando…</span>
                ) : viajesPorDiaSemana.every(r => r.count === 0) ? (
                  <span className="subtitle2 text-secondary">
                    Sin viajes en la semana
                  </span>
                ) : (
                  viajesPorDiaSemana.map(r => (
                    <div
                      key={r.iso}
                      className="flex justify-between items-center"
                    >
                      <span className="subtitle2 text-secondary">{r.label}</span>
                      <span className="subtitle2 text-primary font-medium">
                        {r.count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAdmin;
