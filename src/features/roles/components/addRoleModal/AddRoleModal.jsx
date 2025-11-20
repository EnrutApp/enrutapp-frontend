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
    placeholder: 'Aqui el nombre del rol',
  },
  {
    label: 'Descripción',
    name: 'descripcion',
    type: 'textarea',
    required: false,
    placeholder: 'Describe las funciones y permisos de este rol',
  },
];

const AddRoleModal = ({ isOpen, onClose, onConfirm }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

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
        estado: true,
      };

      const response = await roleService.createRole(payload);
      if (!response?.success)
        throw new Error(response?.message || 'Error al agregar rol');

      setSuccess(true);
      if (onConfirm) onConfirm(response?.data);
    } catch (err) {
      setError(err.message || 'Error al agregar rol');
    } finally {
      setLoading(false);
    }
  };

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green/20 rounded-full animate-ping"></div>

        <div className="flex items-center justify-center mb-4 mt-3 animate-scale-in">
          <md-icon className="text-green text-3xl">admin_panel_settings</md-icon>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="h4 font-medium text-primary animate-slide-up">
          ¡Rol creado exitosamente!
        </h2>
        <p className="text-secondary subtitle1 font-light animate-slide-up mt-2">
          El rol <span className="font-semibold text-primary">{form.nombreRol}</span> ha sido registrado correctamente.
        </p>
      </div>

      <div
        className="content-box-outline-4-small p-4 max-w-md w-full mb-8 animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="flex items-start gap-3">
          <md-icon className="text-blue">check_circle</md-icon>
          <div className="flex-1">
            <p className="text-sm text-primary font-medium mb-1">
              Rol disponible
            </p>
            <p className="text-xs text-secondary">
              El rol ya está disponible para ser asignado a usuarios.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (onConfirm) onConfirm();
          onClose();
        }}
        className="btn btn-primary px-10 py-3 animate-slide-up"
        style={{ animationDelay: '0.3s' }}
      >
        Finalizar
      </button>

      {/* Estilos inline solo para las animaciones */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes scale-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes slide-up {
                    0% {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes fade-in {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                .animate-scale-in {
                    animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                    opacity: 0;
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `,
        }}
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <main className="relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
          {!success && (
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
          )}

          <div className="px-8 md:px-20">
            {!success ? (
              <>
                <div className="leading-tight mb-6">
                  <h2 className="h2 font-medium text-primary">Añadir rol</h2>
                  <p className="h5 text-secondary font-medium">
                    Crea un nuevo rol para asignar a los usuarios
                  </p>
                </div>

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
                            className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all resize-none ${fieldErrors[field.name]
                                ? 'border-red focus:ring-red/20 focus:border-red'
                                : 'border-border focus:ring-primary/20 focus:border-primary'
                              }`}
                            disabled={loading}
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
                            className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${fieldErrors[field.name]
                                ? 'border-red focus:ring-red/20 focus:border-red'
                                : 'border-border focus:ring-primary/20 focus:border-primary'
                              }`}
                            disabled={loading}
                          />
                        )}
                        {fieldErrors[field.name] && (
                          <span className="text-red-500 text-sm mt-1">
                            {fieldErrors[field.name]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="bg-red/10 border border-red/30 rounded-lg p-3 mb-4">
                      <p className="text-red text-sm">{error}</p>
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
                      className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading && (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      {loading ? 'Creando...' : 'Crear rol'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              renderSuccess()
            )}
          </div>
        </div>
      </main>
    </Modal>
  );
};

export default AddRoleModal;
