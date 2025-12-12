import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useEffect, useMemo, useState } from 'react';

import turnoService from '../turnos/api/turnoService';

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

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

const getMonthYearFromDate = dateLike => {
  // Evita bugs de zona horaria: si viene un ISO, usamos la parte YYYY-MM-DD
  // para calcular mes/año y para agrupar por día.
  if (typeof dateLike === 'string') {
    const match = dateLike.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = Number(match[1]);
      const monthIndex = Number(match[2]) - 1;
      const iso = `${match[1]}-${match[2]}-${match[3]}`;
      if (
        Number.isFinite(year) &&
        Number.isFinite(monthIndex) &&
        monthIndex >= 0 &&
        monthIndex <= 11
      ) {
        return { monthIndex, year, iso };
      }
    }
  }

  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(date.getTime())) return null;
  const iso = date.toISOString().slice(0, 10);
  return { monthIndex: date.getUTCMonth(), year: date.getUTCFullYear(), iso };
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const FinanzasPage = () => {
  const now = new Date();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState('');

  // Totales calculados
  const [ingresosPasajes, setIngresosPasajes] = useState(0);
  const [ingresosEncomiendas, setIngresosEncomiendas] = useState(0);
  const [ingresosPorDia, setIngresosPorDia] = useState([]);

  const yearsOptions = useMemo(() => {
    const current = now.getFullYear();
    return [current, current - 1, current - 2];
  }, [now]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await turnoService.getTurnos();
        // apiClient retorna response.data (objeto del backend), no el response de axios
        // Backend: { success: true, data: [...] }
        const data = Array.isArray(response) ? response : response?.data || [];
        if (!mounted) return;
        setTurnos(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setError('No se pudieron cargar los datos de finanzas.');
        setTurnos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const turnosFiltrados = useMemo(() => {
    return (turnos ?? []).filter(t => {
      const parsed = getMonthYearFromDate(t?.fecha);
      if (!parsed) return false;
      return (
        parsed.monthIndex === selectedMonthIndex && parsed.year === selectedYear
      );
    });
  }, [turnos, selectedMonthIndex, selectedYear]);

  useEffect(() => {
    let cancelled = false;

    const calcular = async () => {
      setIngresosPasajes(0);
      setIngresosEncomiendas(0);
      setIngresosPorDia([]);

      if (!turnosFiltrados.length) return;

      // Estimación base con lo que viene en /turnos (sin pedir detalle)
      // Ingreso real (ventas): cantidad de pasajes * precioBase de la ruta.
      // Si luego cargamos detalle, tomamos el precio real de cada pasaje/encomienda.
      const estimadoPorPasajes = turnosFiltrados.reduce((acc, t) => {
        const countPasajes = toNumber(t?._count?.pasajes);
        const precioBase = toNumber(t?.ruta?.precioBase);
        return acc + countPasajes * precioBase;
      }, 0);
      const estimadoBase = estimadoPorPasajes;

      // Para encomiendas no existe un “precio por ruta” claro.
      // Intentamos leer el precio real desde el detalle de turno; si falla, queda en 0.
      setIngresosPasajes(estimadoBase);

      // Cargar detalle sólo para turnos con movimiento.
      const idsConMovimiento = turnosFiltrados
        .filter(t => (t?._count?.pasajes ?? 0) > 0 || (t?._count?.encomiendas ?? 0) > 0)
        .map(t => t?.idTurno)
        .filter(Boolean);

      if (!idsConMovimiento.length) {
        // Ingresos por día usando el estimado (pasajes vendidos * precioBase)
        const mapDia = new Map();
        for (const t of turnosFiltrados) {
          const parsed = getMonthYearFromDate(t?.fecha);
          if (!parsed) continue;
          const key = parsed.iso;
          const monto =
            toNumber(t?._count?.pasajes) * toNumber(t?.ruta?.precioBase);
          mapDia.set(key, (mapDia.get(key) ?? 0) + monto);
        }
        const rows = Array.from(mapDia.entries())
          .map(([iso, monto]) => ({ iso, monto }))
          .sort((a, b) => (a.iso < b.iso ? -1 : 1));
        setIngresosPorDia(rows);
        return;
      }

      setLoadingDetalle(true);

      try {
        let totalPasajesReal = 0;
        let totalEncomiendasReal = 0;
        const mapDia = new Map();

        const batches = chunk(idsConMovimiento, 8);
        for (const batchIds of batches) {
          const results = await Promise.all(
            batchIds.map(async id => {
              try {
                const response = await turnoService.getTurnoById(id);
                // Backend: { success: true, data: turno }
                return Array.isArray(response)
                  ? null
                  : (response?.data ?? null);
              } catch {
                return null;
              }
            }),
          );

          if (cancelled) return;

          for (const turnoDetalle of results) {
            if (!turnoDetalle) continue;
            const parsed = getMonthYearFromDate(turnoDetalle?.fecha);
            if (!parsed) continue;
            const key = parsed.iso;

            const sumaPasajes = (turnoDetalle?.pasajes ?? []).reduce(
              (acc, p) => acc + toNumber(p?.precio),
              0,
            );
            const sumaEncomiendas = (turnoDetalle?.encomiendas ?? []).reduce(
              (acc, e) => acc + toNumber(e?.precio),
              0,
            );

            // Fallback: si no vienen pasajes detallados, usamos count * precioBase
            const fallbackPasajes =
              toNumber(turnoDetalle?._count?.pasajes) *
              toNumber(turnoDetalle?.ruta?.precioBase);
            const pasajesFinalTurno =
              sumaPasajes > 0 ? sumaPasajes : fallbackPasajes;

            totalPasajesReal += pasajesFinalTurno;
            totalEncomiendasReal += sumaEncomiendas;
            mapDia.set(
              key,
              (mapDia.get(key) ?? 0) + pasajesFinalTurno + sumaEncomiendas,
            );
          }
        }

        // Si por alguna razón no vinieron precios reales de pasajes, mantenemos el estimado.
        const pasajesFinal =
          totalPasajesReal > 0 ? totalPasajesReal : estimadoBase;
        setIngresosPasajes(pasajesFinal);
        setIngresosEncomiendas(totalEncomiendasReal);

        const rows = Array.from(mapDia.entries())
          .map(([iso, monto]) => ({ iso, monto }))
          .sort((a, b) => (a.iso < b.iso ? -1 : 1));
        setIngresosPorDia(rows);
      } finally {
        if (!cancelled) setLoadingDetalle(false);
      }
    };

    calcular();

    return () => {
      cancelled = true;
    };
  }, [turnosFiltrados]);

  const ingresosTotal = ingresosPasajes + ingresosEncomiendas;
  const balance = ingresosTotal;

  const actividad = useMemo(() => {
    const totalPasajes = turnosFiltrados.reduce(
      (acc, t) => acc + toNumber(t?._count?.pasajes),
      0,
    );
    const totalEncomiendas = turnosFiltrados.reduce(
      (acc, t) => acc + toNumber(t?._count?.encomiendas),
      0,
    );
    const turnosConMovimiento = turnosFiltrados.reduce((acc, t) => {
      const has =
        toNumber(t?._count?.pasajes) > 0 || toNumber(t?._count?.encomiendas) > 0;
      return acc + (has ? 1 : 0);
    }, 0);

    return {
      turnosMes: turnosFiltrados.length,
      turnosConMovimiento,
      totalPasajes,
      totalEncomiendas,
    };
  }, [turnosFiltrados]);

  const daysInSelectedMonth = useMemo(() => {
    const d = new Date(selectedYear, selectedMonthIndex + 1, 0);
    return d.getDate();
  }, [selectedYear, selectedMonthIndex]);

  const promedioDia = daysInSelectedMonth ? ingresosTotal / daysInSelectedMonth : 0;
  const promedioSemana = daysInSelectedMonth
    ? ingresosTotal / (daysInSelectedMonth / 7)
    : 0;

  return (
    <section className="list-enter">
      <div className="flex justify-between items-center mb-6">
        <h1 className="h4 font-medium">Finanzas</h1>

        <div className="flex gap-2 items-center">
          <div className="select-wrapper">
            <md-icon className="text-sm">arrow_drop_down</md-icon>
            <select
              name="Mes"
              className="select-filter"
              value={String(selectedMonthIndex)}
              onChange={e => setSelectedMonthIndex(Number(e.target.value))}
            >
              {MONTHS_ES.map((m, idx) => (
                <option key={m} value={String(idx)}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="select-wrapper">
            <md-icon className="text-sm">arrow_drop_down</md-icon>
            <select
              name="Año"
              className="select-filter"
              value={String(selectedYear)}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {yearsOptions.map(y => (
                <option key={String(y)} value={String(y)}>
                  Año {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="content-box-outline-small mb-2">
          <span className="subtitle2 text-secondary">{error}</span>
        </div>
      ) : null}

      <div className="flex mt-4 gap-2 mb-2">
        <div className="content-box-outline-small">
          <div className="flex flex-col">
            <span className="subtitle2 font-light text-secondary">
              Total encomiendas
            </span>
            <h2 className="h4 text-primary font-bold">
              {loading ? 'Cargando…' : formatCurrencyCOP(ingresosEncomiendas)}
            </h2>
          </div>
        </div>

        <div className="content-box-outline-small relative">
          <div className="flex flex-col">
            <span className="subtitle2 font-light text-secondary">
              Ingresos
            </span>
            <h2 className="h4 text-blue font-bold">
              {loading ? 'Cargando…' : formatCurrencyCOP(ingresosTotal)}
            </h2>
          </div>
          <md-icon className="text-blue absolute-card">arrow_upward</md-icon>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="content-box-outline-small mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="subtitle2 font-light text-secondary">
                Actividad del mes
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex content-box-outline-5-small justify-between items-center">
                <span className="subtitle2">Turnos del mes</span>
                <span className="subtitle2 text-secondary">
                  {loading ? '—' : actividad.turnosMes}
                </span>
              </div>
              <div className="flex content-box-outline-5-small justify-between items-center">
                <span className="subtitle2">Turnos con movimiento</span>
                <span className="subtitle2 text-secondary">
                  {loading ? '—' : actividad.turnosConMovimiento}
                </span>
              </div>
              <div className="flex content-box-outline-5-small justify-between items-center">
                <span className="subtitle2">Pasajes vendidos</span>
                <span className="subtitle2 text-secondary">
                  {loading ? '—' : actividad.totalPasajes}
                </span>
              </div>
              <div className="flex content-box-outline-5-small justify-between items-center">
                <span className="subtitle2">Encomiendas registradas</span>
                <span className="subtitle2 text-secondary">
                  {loading ? '—' : actividad.totalEncomiendas}
                </span>
              </div>
            </div>
          </div>

          <div className="content-box-outline-small">
            <div className="flex flex-col mb-2">
              <span className="subtitle2 font-light text-secondary">
                Promedio de ingresos
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="h4 font-bold text-blue">
                  {loading ? '—' : formatCurrencyCOP(promedioDia)}
                </span>
                <span className="subtitle2 text-secondary">/ día</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="h4 font-bold text-blue">
                  {loading ? '—' : formatCurrencyCOP(promedioSemana)}
                </span>
                <span className="subtitle2 text-secondary">/ semana</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-primary text-on-primary content-box-small mb-2">
            <div className="flex flex-col">
              <span className="subtitle2 font-light opacity-80">Balance</span>
              <h2 className="h2 font-bold">
                {loading ? 'Cargando…' : formatCurrencyCOP(balance)}
              </h2>
            </div>
          </div>

          <div className="content-box-outline-3-small">
            <div className="flex flex-col">
              <span className="subtitle2 font-light text-secondary mb-4">
                Ingresos por día
              </span>
              <div className="h-44 overflow-auto">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-secondary">
                    <span className="subtitle2">Cargando…</span>
                  </div>
                ) : loadingDetalle ? (
                  <div className="h-full flex items-center justify-center text-secondary">
                    <span className="subtitle2">Calculando…</span>
                  </div>
                ) : ingresosPorDia.length ? (
                  <div className="space-y-2">
                    {ingresosPorDia.map(row => (
                      <div
                        key={row.iso}
                        className="flex content-box-outline-5-small justify-between items-center"
                      >
                        <span className="subtitle2">
                          {new Date(`${row.iso}T00:00:00`).toLocaleDateString(
                            'es-CO',
                            {
                              day: '2-digit',
                              month: 'short',
                            },
                          )}
                        </span>
                        <span className="text-secondary">
                          {formatCurrencyCOP(row.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-secondary">
                    <span className="subtitle2">Sin datos disponibles</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinanzasPage;
