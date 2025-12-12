import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Nota: Las posiciones dependen del diseño de `public/pdf/contrato.pdf`.
// Ajusta estos valores una vez valides visualmente el PDF generado.
export const CONTRATO_POS = {
  page1: {
    // Nota: coordenadas en puntos (0,0) abajo-izquierda. Ajustar con VITE_PDF_DEBUG=true.
    // Sección donde va el pasajero principal (Señor(a) ____ / NIT número ____)
    titularNombre: { x: 135, y: 560, size: 10 },
    titularDocumento: { x: 135, y: 538, size: 10 },

    // SEGUNDA. CONDICIONES: "vehículo tipo ____ con capacidad de ____ pasajeros, de placas ____"
    tipoVehiculo: { x: 295, y: 312, size: 9 },
    capacidad: { x: 440, y: 312, size: 9 },
    placa: { x: 190, y: 297, size: 9 },

    // TERCERA. ÁREA DE OPERACIÓN (aproximado; ajustar)
    origen: { x: 310, y: 275, size: 9 },
    destino: { x: 270, y: 260, size: 9 },

    // Fechas en TERCERA (día/mes/año separados). Ajustar con VITE_PDF_DEBUG=true.
    // "... el día __ del mes de __ de ____"
    fechaOrigenDia: { x: 395, y: 252, size: 9 },
    fechaOrigenMes: { x: 470, y: 252, size: 9 },
    fechaOrigenAnio: { x: 210, y: 232, size: 9 },
    // "... al día __ del mes de __ de ____"
    fechaDestinoDia: { x: 270, y: 232, size: 9 },
    fechaDestinoMes: { x: 400, y: 232, size: 9 },
    fechaDestinoAnio: { x: 520, y: 232, size: 9 },
  },
  page3: {
    // Tabla: LISTADO DE PASAJEROS
    // row1Y: baseline del texto de la fila 1.
    // nombreX/documentoX: inicio de columnas.
    row1Y: 603,
    rowHeight: 22,
    nombreX: 175,
    documentoX: 390,
    size: 9,
    maxRows: 20,
  },
};

const safe = v => (v == null ? '' : String(v));

const formatFechaParts = dateStr => {
  if (!dateStr) return { dia: '', mes: '', anio: '' };
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return { dia: '', mes: '', anio: '' };

  const dia = String(d.getDate());
  const mes = String(d.getMonth() + 1);
  const anio = String(d.getFullYear());
  return { dia, mes, anio };
};

export async function generateContratoPdf({
  templateUrl = '/pdf/contrato.pdf',
  data,
  debug = false,
}) {
  const templateBytes = await fetch(templateUrl).then(r => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Si el template viene con fuentes embebidas, StandardFonts sirve para el overlay.
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const page1 = pages[0];
  const page3 = pages[2] || pages[pages.length - 1];

  const p1 = CONTRATO_POS.page1;

  const fechaO = formatFechaParts(data?.fechaOrigen);
  const fechaD = formatFechaParts(data?.fechaDestino);

  const drawGrid = (page, step = 50) => {
    const { width, height } = page.getSize();
    const gridColor = rgb(1, 0.85, 0.85);
    const labelColor = rgb(1, 0, 0);

    for (let x = 0; x <= width; x += step) {
      page.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: 0.5,
        color: gridColor,
      });
      page.drawText(String(Math.round(x)), {
        x: x + 2,
        y: height - 12,
        size: 7,
        font,
        color: labelColor,
      });
    }

    for (let y = 0; y <= height; y += step) {
      page.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: 0.5,
        color: gridColor,
      });
      page.drawText(String(Math.round(y)), {
        x: width - 28,
        y: y + 2,
        size: 7,
        font,
        color: labelColor,
      });
    }
  };

  const drawMarker = (page, label, pos) => {
    const { width, height } = page.getSize();
    const x = Math.max(0, Math.min(pos.x, width));
    const y = Math.max(0, Math.min(pos.y, height));

    // Cruz
    page.drawLine({
      start: { x: x - 6, y },
      end: { x: x + 6, y },
      thickness: 1,
      color: rgb(1, 0, 0),
    });
    page.drawLine({
      start: { x, y: y - 6 },
      end: { x, y: y + 6 },
      thickness: 1,
      color: rgb(1, 0, 0),
    });

    // Punto
    page.drawCircle({ x, y, size: 2, color: rgb(1, 0, 0) });

    // Etiqueta
    const tag = `${label} (${Math.round(pos.x)},${Math.round(pos.y)})`;
    page.drawText(tag, {
      x: x + 8,
      y: y + 4,
      size: 7,
      font,
      color: rgb(1, 0, 0),
    });
  };

  const draw = (page, text, pos, labelForDebug) => {
    page.drawText(safe(text), {
      x: pos.x,
      y: pos.y,
      size: pos.size || 10,
      font,
      color: rgb(0, 0, 0),
    });

    if (debug) {
      drawMarker(page, labelForDebug || 'campo', pos);
    }
  };

  if (debug) {
    drawGrid(page1, 50);
    drawGrid(page3, 50);
    const p1Size = page1.getSize();
    const p3Size = page3.getSize();
    page1.drawText(
      `DEBUG: page1 ${Math.round(p1Size.width)}x${Math.round(p1Size.height)}`,
      {
        x: 20,
        y: p1Size.height - 20,
        size: 8,
        font,
        color: rgb(1, 0, 0),
      }
    );
    page3.drawText(
      `DEBUG: page3 ${Math.round(p3Size.width)}x${Math.round(p3Size.height)}`,
      {
        x: 20,
        y: p3Size.height - 20,
        size: 8,
        font,
        color: rgb(1, 0, 0),
      }
    );
  }

  // Página 1: datos generales
  draw(page1, data?.titularNombre, p1.titularNombre, 'titularNombre');
  draw(page1, data?.titularDocumento, p1.titularDocumento, 'titularDocumento');
  draw(page1, data?.placa, p1.placa, 'placa');
  draw(page1, data?.tipoVehiculo, p1.tipoVehiculo, 'tipoVehiculo');
  draw(page1, safe(data?.capacidadPasajeros), p1.capacidad, 'capacidad');
  draw(page1, data?.origen, p1.origen, 'origen');
  draw(page1, data?.destino, p1.destino, 'destino');

  // TERCERA: fechas separadas
  draw(page1, fechaO.dia, p1.fechaOrigenDia, 'fechaOrigenDia');
  draw(page1, fechaO.mes, p1.fechaOrigenMes, 'fechaOrigenMes');
  draw(page1, fechaO.anio, p1.fechaOrigenAnio, 'fechaOrigenAnio');
  draw(page1, fechaD.dia, p1.fechaDestinoDia, 'fechaDestinoDia');
  draw(page1, fechaD.mes, p1.fechaDestinoMes, 'fechaDestinoMes');
  draw(page1, fechaD.anio, p1.fechaDestinoAnio, 'fechaDestinoAnio');

  // Página 3: lista de pasajeros (simple: 1 línea por pasajero)
  const p3 = CONTRATO_POS.page3;
  const pasajeros = Array.isArray(data?.pasajeros) ? data.pasajeros : [];

  if (debug) {
    drawMarker(page3, 'page3.nombreX', {
      x: p3.nombreX,
      y: p3.row1Y,
      size: p3.size,
    });
    drawMarker(page3, 'page3.documentoX', {
      x: p3.documentoX,
      y: p3.row1Y,
      size: p3.size,
    });
  }

  pasajeros.slice(0, p3.maxRows || 20).forEach((p, idx) => {
    const y = p3.row1Y - idx * (p3.rowHeight || 22);
    const nombre = safe(p?.nombre);
    const documento = safe(p?.documento);

    if (nombre) {
      page3.drawText(nombre, {
        x: p3.nombreX,
        y,
        size: p3.size || 9,
        font,
        color: rgb(0, 0, 0),
      });
    }

    if (documento) {
      page3.drawText(documento, {
        x: p3.documentoX,
        y,
        size: p3.size || 9,
        font,
        color: rgb(0, 0, 0),
      });
    }
  });

  return await pdfDoc.save();
}
