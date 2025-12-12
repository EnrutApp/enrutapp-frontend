import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useEffect, useRef, useState } from 'react';

export default function EditConductorModal({
  isOpen,
  onClose,
  conductor,
  onUpdateConductor,
  onUpdateFoto,
}) {
  const [form, setForm] = useState({});
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        idConductor: conductor?.idConductor,
        nombre: conductor?.nombre || '',
        apellido: conductor?.apellido || '',
        cedula: conductor?.cedula || '',
        telefono: conductor?.telefono || '',
        correo: conductor?.correo || '',
        licencia: conductor?.licencia || '',
        estado:
          typeof conductor?.estado === 'boolean'
            ? conductor.estado
            : conductor?.estado === 'Activo',
      });
    } else {
      setForm({});
      setError(null);
    }
  }, [isOpen, conductor]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    try {
      await onUpdateConductor?.(form.idConductor, {
        nombre: form.nombre,
        apellido: form.apellido,
        cedula: form.cedula,
        telefono: form.telefono,
        correo: form.correo || undefined,
        licencia: form.licencia,
        estado: form.estado,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar el conductor');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeFoto = () => fileRef.current?.click();
  const handleFileChange = async e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUpdating(true);
    setError(null);
    try {
      await onUpdateFoto?.(form.idConductor, f);
    } catch (err) {
      setError(err.message || 'Error al actualizar la foto');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
        <div className="flex items-center gap-1 mb-4">
          <button
            type="button"
            onClick={onClose}
            className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75"
          >
            <md-icon className="text-xl">close</md-icon>
          </button>
        </div>
        <div className="px-20">
          <div className="leading-tight mb-5">
            <h2 className="h2 font-medium text-primary">Editar conductor</h2>
            <p className="h5 text-secondary font-medium">
              Actualiza la información o su foto
            </p>
          </div>

          <div className="mb-4">
            <label className="subtitle1 text-primary font-medium">Foto</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleChangeFoto}
                disabled={updating}
              >
                <md-icon className="text-sm">image</md-icon>
                Cambiar foto
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="subtitle1 text-primary font-medium">
                  Nombre
                </label>
                <input
                  name="nombre"
                  value={form.nombre || ''}
                  onChange={handleChange}
                  className="w-full px-4 input bg-fill border rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="subtitle1 text-primary font-medium">
                  Apellido
                </label>
                <input
                  name="apellido"
                  value={form.apellido || ''}
                  onChange={handleChange}
                  className="w-full px-4 input bg-fill border rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="subtitle1 text-primary font-medium">
                  Cédula
                </label>
                <input
                  name="cedula"
                  value={form.cedula || ''}
                  onChange={handleChange}
                  className="w-full px-4 input bg-fill border rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="subtitle1 text-primary font-medium">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  value={form.telefono || ''}
                  onChange={handleChange}
                  className="w-full px-4 input bg-fill border rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="subtitle1 text-primary font-medium">
                  Licencia
                </label>
                <input
                  name="licencia"
                  value={form.licencia || ''}
                  onChange={handleChange}
                  className="w-full px-4 input bg-fill border rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="subtitle1 text-primary font-medium">
                  Correo
                </label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo || ''}
                  onChange={handleChange}
                  className="w-full px-4 input bg-fill border rounded-lg"
                />
              </div>
            </div>
            {error && <div className="text-red mb-2">{error}</div>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn px-5 text-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <md-filled-button
                className="btn-add px-24"
                type="submit"
                disabled={updating}
              >
                {updating ? 'Actualizando...' : 'Actualizar'}
              </md-filled-button>
            </div>
          </form>
        </div>
      </main>
    </Modal>
  );
}
