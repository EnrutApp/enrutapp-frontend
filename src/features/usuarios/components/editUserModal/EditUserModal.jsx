import Modal from '../../../../shared/components/modal/Modal';
import apiClient from '../../../../shared/services/apiService';
import catalogService from '../../../../shared/services/catalogService';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useState, useEffect } from 'react';

const EditUserModal = ({ isOpen, onClose, onConfirm, onSave, itemData, user }) => {
  const data = itemData || user;
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [ciudades, setCiudades] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const isProfileEdit = !!user;

  useEffect(() => {
    if (isOpen && data) {
      setForm({ ...data });
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, data]);

  useEffect(() => {
    if (!isOpen) {
      setForm({});
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      catalogService
        .getCities()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            setCiudades(res.data);
          }
        })
        .catch(() => setCiudades([]));

      catalogService
        .getRoles()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            setRoles(res.data.filter(r => r.estado));
          }
        })
        .catch(() => setRoles([]));

      catalogService
        .getDocumentTypes()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            setTiposDoc(res.data);
          } else {
            setTiposDoc([]);
          }
        })
        .catch(() => setTiposDoc([]));
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

    if (!form.nombre?.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    if (!form.telefono?.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    }
    if (!form.direccion?.trim()) {
      errors.direccion = 'La dirección es obligatoria';
    }
    if (!form.idCiudad) {
      errors.idCiudad = 'Selecciona una ciudad';
    }
    if (!form.tipoDoc) {
      errors.tipoDoc = 'Selecciona un tipo de documento';
    }
    if (!isProfileEdit && !form.idRol) {
      errors.idRol = 'Selecciona un rol';
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

    try {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!form.tipoDoc || !uuidRegex.test(form.tipoDoc)) {
        setError('El tipo de documento seleccionado no es válido');
        setFieldErrors({ tipoDoc: 'Selecciona un tipo de documento válido' });
        setLoading(false);
        return;
      }

      if (!isProfileEdit && (!form.idRol || !uuidRegex.test(form.idRol))) {
        setError('El rol seleccionado no es válido');
        setFieldErrors({ idRol: 'Selecciona un rol válido' });
        setLoading(false);
        return;
      }

      const payload = {
        nombre: form.nombre?.trim(),
        telefono: form.telefono?.trim(),
        direccion: form.direccion?.trim(),
        idCiudad: parseInt(form.idCiudad),
        tipoDoc: form.tipoDoc?.trim(),
      };

      if (!isProfileEdit) {
        payload.idRol = form.idRol?.trim();
      }

      const response = await apiClient.put(
        `/usuarios/${form.idUsuario}`,
        payload
      );
      if (!response?.success)
        throw new Error(response?.message || 'Error al actualizar usuario');

      // Usar onSave si es edición de perfil, sino onConfirm
      if (isProfileEdit && onSave) {
        await onSave(response?.data);
      } else if (onConfirm) {
        onConfirm(response?.data);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const isAdminUser =
    form.rol?.nombreRol?.toLowerCase() === 'administrador' ||
    roles.find(r => r.idRol === form.idRol)?.nombreRol?.toLowerCase() ===
    'administrador';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isProfileEdit ? "md" : "lg"}>
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

          <div className={isProfileEdit ? "px-4" : "px-8 md:px-20"}>
            <div className="leading-tight mb-6">
              <h2 className="h2 font-medium text-primary">Editar {isProfileEdit ? 'perfil' : 'usuario'}</h2>
              <p className="h5 text-secondary font-medium">
                {isProfileEdit
                  ? 'Actualiza tu información personal'
                  : isAdminUser
                    ? 'Editando usuario Administrador - Rol protegido'
                    : 'Actualiza la información del usuario'}
              </p>
            </div>

            {!isProfileEdit && isAdminUser && (
              <div className="mb-6 rounded-lg content-box-outline-4-small p-4">
                <div className="flex items-center gap-3">
                  <md-icon className="text-blue">info</md-icon>
                  <p className="text-sm text-primary">
                    El campo <span className="font-semibold">Rol</span> está
                    protegido para usuarios administradores.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col gap-1">
                  <label
                    className="subtitle1 text-primary font-medium"
                    htmlFor="nombre"
                  >
                    Nombre completo <span className="text-red">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    placeholder="Escribe el nombre completo"
                    value={form.nombre || ''}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${fieldErrors.nombre
                      ? 'border-red focus:ring-red/20 focus:border-red'
                      : 'border-border focus:ring-primary/20 focus:border-primary'
                      }`}
                    disabled={loading}
                  />
                  {fieldErrors.nombre && (
                    <span className="text-red-500 text-sm mt-1">
                      {fieldErrors.nombre}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="subtitle1 text-primary font-medium"
                    htmlFor="tipoDoc"
                  >
                    Tipo de documento <span className="text-red">*</span>
                  </label>
                  {tiposDoc.length > 0 ? (
                    <>
                      <div className="select-wrapper w-full">
                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                        <select
                          id="tipoDoc"
                          name="tipoDoc"
                          required
                          value={form.tipoDoc || ''}
                          onChange={handleChange}
                          className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${fieldErrors.tipoDoc ? 'border-red-500' : 'border-border'}`}
                          disabled={loading}
                        >
                          <option value="">Selecciona</option>
                          {tiposDoc.map(t => (
                            <option key={t.idTipoDoc} value={t.idTipoDoc}>
                              {t.nombreTipoDoc}
                            </option>
                          ))}
                        </select>
                      </div>
                      {fieldErrors.tipoDoc && (
                        <span className="text-red-500 text-sm mt-1">
                          {fieldErrors.tipoDoc}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="text-secondary text-sm">
                      Cargando tipos...
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label
                      className="subtitle1 text-primary font-medium"
                      htmlFor="direccion"
                    >
                      Dirección <span className="text-red">*</span>
                    </label>
                    <input
                      id="direccion"
                      name="direccion"
                      type="text"
                      required
                      placeholder="Dirección completa"
                      value={form.direccion || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${fieldErrors.direccion
                        ? 'border-red focus:ring-red/20 focus:border-red'
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                        }`}
                      disabled={loading}
                    />
                    {fieldErrors.direccion && (
                      <span className="text-red-500 text-sm mt-1">
                        {fieldErrors.direccion}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className="subtitle1 text-primary font-medium"
                      htmlFor="idCiudad"
                    >
                      Ciudad <span className="text-red">*</span>
                    </label>
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        id="idCiudad"
                        name="idCiudad"
                        required
                        value={form.idCiudad || ''}
                        onChange={handleChange}
                        className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${fieldErrors.idCiudad ? 'border-red-500' : 'border-border'}`}
                        disabled={loading}
                      >
                        <option value="">Selecciona la ciudad</option>
                        {ciudades.map(c => (
                          <option key={c.idCiudad} value={c.idCiudad}>
                            {c.nombreCiudad}
                          </option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors.idCiudad && (
                      <span className="text-red-500 text-sm mt-1">
                        {fieldErrors.idCiudad}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="subtitle1 text-primary font-medium"
                    htmlFor="telefono"
                  >
                    Teléfono <span className="text-red">*</span>
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="text"
                    required
                    placeholder="Número de teléfono"
                    value={form.telefono || ''}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${fieldErrors.telefono
                      ? 'border-red focus:ring-red/20 focus:border-red'
                      : 'border-border focus:ring-primary/20 focus:border-primary'
                      }`}
                    disabled={loading}
                  />
                  {fieldErrors.telefono && (
                    <span className="text-red-500 text-sm mt-1">
                      {fieldErrors.telefono}
                    </span>
                  )}
                </div>

                {!isProfileEdit && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label
                          className="subtitle1 text-primary font-medium"
                          htmlFor="numDocumento"
                        >
                          Número de documento
                        </label>
                        <input
                          id="numDocumento"
                          name="numDocumento"
                          type="text"
                          value={form.numDocumento || ''}
                          className="w-full px-4 py-3 input bg-surface border rounded-lg text-secondary cursor-not-allowed"
                          disabled
                          readOnly
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label
                          className="subtitle1 text-primary font-medium"
                          htmlFor="correo"
                        >
                          Correo electrónico
                        </label>
                        <input
                          id="correo"
                          name="correo"
                          type="email"
                          value={form.correo || ''}
                          className="w-full px-4 py-3 input bg-surface border rounded-lg text-secondary cursor-not-allowed"
                          disabled
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        className="subtitle1 text-primary font-medium"
                        htmlFor="idRol"
                      >
                        Rol del usuario <span className="text-red">*</span>
                      </label>
                      <div className="select-wrapper w-full">
                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                        <select
                          id="idRol"
                          name="idRol"
                          required
                          value={form.idRol || ''}
                          onChange={handleChange}
                          disabled={isAdminUser || loading}
                          className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${isAdminUser
                            ? 'opacity-50 cursor-not-allowed bg-surface'
                            : ''
                            } ${fieldErrors.idRol ? 'border-red-500' : 'border-border'}`}
                        >
                          <option value="">Selecciona un rol</option>
                          {roles.map(r => (
                            <option key={r.idRol} value={r.idRol}>
                              {r.nombreRol}
                            </option>
                          ))}
                        </select>
                      </div>
                      {fieldErrors.idRol && (
                        <span className="text-red-500 text-sm mt-1">
                          {fieldErrors.idRol}
                        </span>
                      )}
                      {isAdminUser && (
                        <p className="text-xs text-secondary">
                          El rol de administrador no se puede modificar
                        </p>
                      )}
                    </div>
                  </>
                )}
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
                  className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    isProfileEdit ? 'Actualizar' : 'Actualizar usuario'
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

export default EditUserModal;
