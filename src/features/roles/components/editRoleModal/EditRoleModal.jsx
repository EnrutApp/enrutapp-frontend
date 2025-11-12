import Modal from '../../../../shared/components/modal/Modal';
import roleService from '../../api/roleService';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useState, useEffect } from 'react';

const roleFields = [
  {
    label: 'Nombre del rol',
    name: 'nombreRol',
    type: 'text',
    required: true,
    placeholder: 'Ej: Conductor, Supervisor, etc.',
  },
  {
    label: 'Descripción',
    name: 'descripcion',
    type: 'textarea',
    required: false,
    placeholder: 'Describe las funciones y permisos de este rol',
  },
];

const EditRoleModal = ({ isOpen, onClose, onConfirm, itemData }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && itemData) {
      setForm({ ...itemData });
      setError(null);
      setFieldErrors({});
      setSuccess(false);
    }
  }, [isOpen, itemData]);

  useEffect(() => {
    if (!isOpen) {
      setForm({});
      setError(null);
      setFieldErrors({});
      setSuccess(false);
    }
  }, [isOpen]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
    setError(null);
  };

  const validateForm = () => {
    const errors = {};

    if (!form.nombreRol?.trim()) {
      errors.nombreRol = 'El nombre del rol es obligatorio';
    }

    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        nombreRol: form.nombreRol.trim(),
        descripcion: form.descripcion?.trim() || null,
        estado: form.estado !== undefined ? form.estado : true,
      };

      const data = await roleService.updateRole(form.idRol, payload);
      if (!data?.success)
        throw new Error(data?.message || 'Error al actualizar rol');

      setSuccess(true);
      if (onConfirm) onConfirm(data?.data);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al actualizar rol');
    } finally {
      setLoading(false);
    }
  };

  const isAdminRole = form.nombreRol?.toLowerCase() === 'administrador';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <main className="relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
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

          <div className="px-8 md:px-20">
            <div className="leading-tight mb-6">
              <h2 className="h2 font-medium text-primary">Editar rol</h2>
              <p className="h5 text-secondary font-medium">
                {isAdminRole
                  ? 'Editando rol Administrador - Rol protegido'
                  : 'Actualiza la información del rol'}
              </p>
            </div>

            {isAdminRole && (
              <div className="mb-6 rounded-lg content-box-outline-4-small p-4">
                <div className="flex items-center gap-3">
                  <md-icon className="text-yellow-600">warning</md-icon>
                  <div className="flex-1">
                    <p className="text-sm text-primary font-medium mb-1">
                      Rol de sistema protegido
                    </p>
                    <p className="text-xs text-secondary">
                      El rol <span className="font-semibold">Administrador</span> no puede ser editado por seguridad del sistema.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 mb-6">
                {roleFields.map(field => (
                  <div key={field.name} className="flex flex-col gap-1">
                    <label
                      className="subtitle1 text-primary font-medium"
                      htmlFor={field.name}
                    >
                      {field.label} {field.required && <span className="text-red">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={field.name}
                        name={field.name}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        rows={3}
                        disabled={isAdminRole || loading}
                        className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all resize-none ${isAdminRole
                            ? 'opacity-50 cursor-not-allowed bg-surface'
                            : ''
                          } ${fieldErrors[field.name]
                            ? 'border-red focus:ring-red/20 focus:border-red'
                            : 'border-border focus:ring-primary/20 focus:border-primary'
                          }`}
                      />
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        disabled={isAdminRole || loading}
                        className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${isAdminRole
                            ? 'opacity-50 cursor-not-allowed bg-surface'
                            : ''
                          } ${fieldErrors[field.name]
                            ? 'border-red focus:ring-red/20 focus:border-red'
                            : 'border-border focus:ring-primary/20 focus:border-primary'
                          }`}
                      />
                    )}
                    {fieldErrors[field.name] && (
                      <span className="text-red-500 text-sm mt-1">
                        {fieldErrors[field.name]}
                      </span>
                    )}
                    {isAdminRole && field.name === 'nombreRol' && (
                      <p className="text-xs text-secondary">
                        El nombre del rol Administrador no se puede modificar
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red/10 border border-red/30 rounded-lg p-3 mb-4">
                  <p className="text-red text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green/10 border border-green/30 rounded-lg p-3 mb-4">
                  <p className="text-green text-sm font-medium">
                    ¡Rol actualizado correctamente!
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center gap-2 pt-2">
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
                  className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center"
                  disabled={loading || success || isAdminRole}
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : success ? (
                    'Actualizado'
                  ) : (
                    'Actualizar rol'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </Modal>
  );
};

export default EditRoleModal;
