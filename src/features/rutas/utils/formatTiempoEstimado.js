export const formatTiempoEstimado = tiempoEstimadoRaw => {
  const raw = String(tiempoEstimadoRaw ?? '').trim();
  if (!raw) return { valor: '0', unidad: 'min' };

  // Formato esperado: H:MM (p.ej. 0:24, 1:05)
  const hhmmMatch = raw.match(/^(\d+)\s*:\s*(\d{1,2})$/);
  if (hhmmMatch) {
    const horas = Number.parseInt(hhmmMatch[1], 10);
    const minutos = Number.parseInt(hhmmMatch[2], 10);
    const minutosTotales = horas * 60 + minutos;

    if (horas > 0) {
      return {
        valor: `${horas}:${String(minutos).padStart(2, '0')}`,
        unidad: 'hrs',
      };
    }

    return { valor: String(minutosTotales), unidad: 'min' };
  }

  // Si viene como número (asumimos minutos)
  const numeric = Number(raw.replace(',', '.'));
  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    const minutosTotales = Math.max(0, Math.round(numeric));
    if (minutosTotales >= 60) {
      const horas = Math.floor(minutosTotales / 60);
      const minutos = minutosTotales % 60;
      return {
        valor: `${horas}:${String(minutos).padStart(2, '0')}`,
        unidad: 'hrs',
      };
    }
    return { valor: String(minutosTotales), unidad: 'min' };
  }

  // Fallback: mostrar tal cual y asumir hrs (comportamiento previo)
  return { valor: raw, unidad: 'hrs' };
};
