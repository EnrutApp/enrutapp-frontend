import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import Modal from '../../../shared/components/modal/Modal';
import { encomiendasService } from '../api/encomiendasService';
import { useEffect, useRef, useState } from 'react';
import { turnoService } from '../../../shared/services/turnoService';

const toDateInput = val => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return '';
  return d.toISOString().split('T')[0];
};

export default function EditEncomiendaModal({ isOpen, onClose, encomienda, onUpdated }) {
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !encomienda) return;
    setForm({
      remitenteNombre: encomienda.remitenteNombre || '',
      remitenteTel: encomienda.remitenteTel || '',
      origenNombre: encomienda.origenNombre || '',
      destinatarioNombre: encomienda.destinatarioNombre || '',
      destinatarioTel: encomienda.destinatarioTel || '',
      destinoNombre: encomienda.destinoNombre || '',
      descripcion: encomienda.descripcion || '',
      observaciones: encomienda.observaciones || '',
      precio: encomienda.precio != null ? String(encomienda.precio) : '',
      peso: encomienda.peso != null ? String(encomienda.peso) : '',
      idTurno: encomienda.idTurno || '',
      fecha: toDateInput(encomienda.fecha),
      hora: encomienda.hora || '',
      estado: encomienda.estado || 'Pendiente',
    });
    setExistingPhoto(encomiendasService.resolvePhoto(encomienda));
    setFile(null);
    setPreviewUrl(null);
    setError(null);

    turnoService.getTurnos().then(res => {
      const list = res?.data || res;
      setTurnos(Array.isArray(list) ? list.filter(t => t.estado === 'Programado' || t.idTurno === encomienda.idTurno) : []);
    }).catch(() => {});
  }, [isOpen, encomienda]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleRemoveNewFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const validate = () => {
    if (!form.remitenteNombre?.trim()) return 'El nombre del remitente es obligatorio';
    if (!form.destinatarioNombre?.trim()) return 'El nombre del destinatario es obligatorio';
    if (!form.descripcion?.trim()) return 'La descripción es obligatoria';
    if (!form.precio || isNaN(parseFloat(form.precio))) return 'El precio es obligatorio';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    const msg = validate();
    if (msg) { setError(msg); return; }

    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
      });
      if (file) fd.append('foto', file);

      const updated = await encomiendasService.update(encomienda.idEncomienda, fd);
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Error al actualizar la encomienda'
      );
    } finally {
      setLoading(false);
    }
  };

  const turnoLabel = t => {
    const origen = t?.ruta?.origen?.ubicacion?.nombreUbicacion || '?';
    const destino = t?.ruta?.destino?.ubicacion?.nombreUbicacion || '?';
    const fecha = t?.fecha ? new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '';
    return `${origen} → ${destino} · ${fecha} ${t.hora || ''}`;
  };

  const photoToShow = previewUrl || existingPhoto;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-3xl">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title row */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-secondary p-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
                disabled={loading}
              >
                <md-icon className="text-xl flex items-center justify-center">close</md-icon>
              </button>
              <div>
                <h2 className="h4 font-medium text-primary">Editar encomienda</h2>
                <p className="text-secondary text-sm">Guía: {encomienda?.guia}</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-6 py-2 font-medium flex items-center gap-2 shrink-0"
            >
              <md-icon className="text-sm">save</md-icon>
              Guardar
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2 bg-red/10 border border-red rounded-lg text-sm text-red">
              {error}
            </div>
          )}

          <div className="flex gap-6">
            {/* Left: form */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">

              {/* Envía */}
              <div>
                <span className="text-sm font-medium text-primary block mb-2">Envía</span>
                <div className="flex flex-col gap-2">
                  <input name="remitenteNombre" value={form.remitenteNombre || ''} onChange={handleChange} placeholder="Nombre del remitente"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />
                  <input name="remitenteTel" value={form.remitenteTel || ''} onChange={handleChange} placeholder="Teléfono (opcional)"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />
                  <input name="origenNombre" value={form.origenNombre || ''} onChange={handleChange} placeholder="Origen"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />
                </div>
              </div>

              {/* Recibe */}
              <div>
                <span className="text-sm font-medium text-primary block mb-2">Recibe</span>
                <div className="flex flex-col gap-2">
                  <input name="destinatarioNombre" value={form.destinatarioNombre || ''} onChange={handleChange} placeholder="Nombre del destinatario"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />
                  <input name="destinatarioTel" value={form.destinatarioTel || ''} onChange={handleChange} placeholder="Teléfono (opcional)"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />
                  <input name="destinoNombre" value={form.destinoNombre || ''} onChange={handleChange} placeholder="Destino"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />
                </div>
              </div>

              {/* Cuando */}
              <div>
                <span className="text-sm font-medium text-primary block mb-2">Cuando</span>
                <div className="flex flex-col gap-2">
                  <input name="fecha" value={form.fecha || ''} onChange={handleChange} type="date"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary focus:outline-none focus:border-primary" />
                  <input name="hora" value={form.hora || ''} onChange={handleChange} type="time"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary focus:outline-none focus:border-primary" />
                  {turnos.length > 0 && (
                    <div className="relative">
                      <select name="idTurno" value={form.idTurno || ''} onChange={handleChange}
                        className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary focus:outline-none focus:border-primary appearance-none">
                        <option value="">Sin turno vinculado</option>
                        {turnos.map(t => (
                          <option key={t.idTurno} value={t.idTurno}>{turnoLabel(t)}</option>
                        ))}
                      </select>
                      <md-icon className="absolute right-3 top-3 text-secondary pointer-events-none">arrow_drop_down</md-icon>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div>
                <span className="text-sm font-medium text-primary block mb-2">Estado</span>
                <div className="relative">
                  <select name="estado" value={form.estado || 'Pendiente'} onChange={handleChange}
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary focus:outline-none focus:border-primary appearance-none">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Por enviar">Por enviar</option>
                    <option value="En tránsito">En tránsito</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                  <md-icon className="absolute right-3 top-3 text-secondary pointer-events-none">arrow_drop_down</md-icon>
                </div>
              </div>

              {/* Descripción */}
              <textarea name="descripcion" value={form.descripcion || ''} onChange={handleChange} placeholder="Descripción" rows={3}
                className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary resize-none" />

              {/* Observaciones */}
              <input name="observaciones" value={form.observaciones || ''} onChange={handleChange} placeholder="Observaciones (opcional)"
                className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />

              {/* Precio y Peso */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <span className="text-sm font-medium text-primary block mb-2">Precio</span>
                  <input name="precio" value={form.precio || ''} onChange={handleChange} type="number" min="0" step="0.01" placeholder="Precio"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-primary block mb-2">Peso (kg)</span>
                  <input name="peso" value={form.peso || ''} onChange={handleChange} type="number" min="0" step="0.01" placeholder="Peso (opcional)"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            {/* Right: foto */}
            <div className="flex flex-col gap-2" style={{ width: '200px', minWidth: '200px' }}>
              <span className="text-sm font-medium text-primary">Foto</span>
              <div
                className="border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary transition-colors relative"
                style={{ height: '300px' }}
                onClick={() => fileRef.current?.click()}
              >
                {photoToShow ? (
                  <>
                    <img src={photoToShow} alt="preview" className="w-full h-full object-cover" />
                    {previewUrl && (
                      <button type="button" onClick={e => { e.stopPropagation(); handleRemoveNewFile(); }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80">
                        <md-icon className="text-sm">close</md-icon>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="w-16 h-16 bg-fill rounded-2xl flex items-center justify-center">
                      <md-icon className="text-secondary text-2xl">add_photo_alternate</md-icon>
                    </div>
                    <span className="text-secondary text-sm text-center px-4">Adjunta aquí la foto</span>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-secondary btn-sm w-full">
                {existingPhoto ? 'Cambiar foto' : 'Subir foto'}
              </button>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        </form>
      </main>
    </Modal>
  );
}
