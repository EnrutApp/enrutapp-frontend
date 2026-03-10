import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import Modal from '../../../shared/components/modal/Modal';
import { encomiendasService } from '../api/encomiendasService';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { turnoService } from '../../../shared/services/turnoService';

const initialForm = {
  remitenteNombre: '',
  remitenteTel: '',
  origenNombre: '',
  destinatarioNombre: '',
  destinatarioTel: '',
  destinoNombre: '',
  descripcion: '',
  observaciones: '',
  precio: '',
  peso: '',
  idTurno: '',
  fecha: '',
  hora: '',
};

export default function AddEncomiendaModal({ isOpen, onClose, onCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setFile(null);
      setPreviewUrl(null);
      setError(null);
      setLoading(false);
      setSuccess(false);
      return;
    }
    turnoService.getTurnos().then(res => {
      const list = res?.data || res;
      setTurnos(Array.isArray(list) ? list.filter(t => t.estado === 'Programado') : []);
    }).catch(() => {});
  }, [isOpen]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const validate = () => {
    if (!form.remitenteNombre.trim()) return 'El nombre del remitente es obligatorio';
    if (!form.destinatarioNombre.trim()) return 'El nombre del destinatario es obligatorio';
    if (!form.descripcion.trim()) return 'La descripción es obligatoria';
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

      await encomiendasService.create(fd);
      setSuccess(true);
      onCreated?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Error al crear la encomienda'
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

  const handleAgregarUsuario = () => {
    onClose();
    navigate('/admin/clientes');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-3xl">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <md-icon className="text-green text-3xl mb-4">local_shipping</md-icon>
            <h2 className="h4 font-medium text-primary mb-2">¡Encomienda registrada!</h2>
            <p className="text-secondary text-sm mb-8">La encomienda ya está disponible en el sistema</p>
            <button onClick={onClose} className="btn btn-primary px-10 py-3">Finalizar</button>
          </div>
        ) : (
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
                  <h2 className="h4 font-medium text-primary">Agregar nueva encomienda</h2>
                  <p className="text-secondary text-sm">Información básica de la encomienda</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary px-6 py-2 font-medium flex items-center gap-2 shrink-0"
              >
                <md-icon className="text-sm">add</md-icon>
                Agregar
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-2 bg-red/10 border border-red rounded-lg text-sm text-red">
                {error}
              </div>
            )}

            {/* Two column layout */}
            <div className="flex gap-6">
              {/* Left: form */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">

                {/* Envía */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary">Envía</span>
                    <button type="button" onClick={handleAgregarUsuario} className="text-xs text-secondary px-2 py-0.5 border border-border rounded-full cursor-pointer hover:border-primary hover:text-primary transition-colors">
                      + Agregar cliente
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        name="remitenteNombre"
                        value={form.remitenteNombre}
                        onChange={handleChange}
                        placeholder="Nombre"
                        className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary"
                      />
                      <md-icon className="absolute right-3 top-3 text-secondary pointer-events-none">arrow_drop_down</md-icon>
                    </div>
                    <div className="relative">
                      <input
                        name="origenNombre"
                        value={form.origenNombre}
                        onChange={handleChange}
                        placeholder="Origen"
                        className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary"
                      />
                      <md-icon className="absolute right-3 top-3 text-secondary pointer-events-none">arrow_drop_down</md-icon>
                    </div>
                  </div>
                </div>

                {/* Recibe */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary">Recibe</span>
                    <button type="button" onClick={handleAgregarUsuario} className="text-xs text-secondary px-2 py-0.5 border border-border rounded-full cursor-pointer hover:border-primary hover:text-primary transition-colors">
                      + Agregar cliente
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        name="destinatarioNombre"
                        value={form.destinatarioNombre}
                        onChange={handleChange}
                        placeholder="Nombre"
                        className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary"
                      />
                      <md-icon className="absolute right-3 top-3 text-secondary pointer-events-none">arrow_drop_down</md-icon>
                    </div>
                    <div className="relative">
                      <input
                        name="destinoNombre"
                        value={form.destinoNombre}
                        onChange={handleChange}
                        placeholder="Destino"
                        className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary"
                      />
                      <md-icon className="absolute right-3 top-3 text-secondary pointer-events-none">arrow_drop_down</md-icon>
                    </div>
                  </div>
                </div>

                {/* Cuando */}
                <div>
                  <span className="text-sm font-medium text-primary block mb-2">Cuando</span>
                  <div className="flex flex-col gap-2">
                    <input
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      type="date"
                      placeholder="Fecha"
                      className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary"
                    />
                    <input
                      name="hora"
                      value={form.hora}
                      onChange={handleChange}
                      type="time"
                      placeholder="Hora"
                      className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary"
                    />
                    {turnos.length > 0 && (
                      <div className="relative">
                        <select
                          name="idTurno"
                          value={form.idTurno}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary focus:outline-none focus:border-primary appearance-none"
                        >
                          <option value="">Vincular a turno (opcional)</option>
                          {turnos.map(t => (
                            <option key={t.idTurno} value={t.idTurno}>{turnoLabel(t)}</option>
                          ))}
                        </select>
                        <md-icon className="absolute right-3 top-3 text-secondary pointer-events-none">arrow_drop_down</md-icon>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción"
                  rows={3}
                  className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary resize-none"
                />

                {/* Observaciones */}
                <input
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  placeholder="Observaciones (opcional)"
                  className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary"
                />

                {/* Precio */}
                <div>
                  <span className="text-sm font-medium text-primary block mb-2">Precio</span>
                  <input
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    placeholder="Precio de la encomienda"
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-fill border border-border rounded-xl text-primary placeholder-secondary focus:outline-none focus:border-primary"
                  />
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
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleRemoveFile(); }}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                      >
                        <md-icon className="text-sm">close</md-icon>
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="w-16 h-16 bg-fill rounded-2xl flex items-center justify-center">
                        <md-icon className="text-secondary text-2xl">add</md-icon>
                      </div>
                      <span className="text-secondary text-sm text-center px-4">Adjunta aquí la foto</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="btn btn-secondary btn-sm w-full"
                >
                  Subir foto
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </form>
        )}
      </main>
    </Modal>
  );
}
