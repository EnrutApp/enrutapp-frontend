import Modal from '../../../../shared/components/modal/Modal';
import AddressAutocomplete from '../../../../shared/components/addressAutocomplete/AddressAutocomplete';
import apiClient from '../../../../shared/services/apiService';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useEffect, useState } from 'react';
import { obtenerCategoriasLicencia } from '../../../../shared/services/categoriasLicenciaApi';
import catalogService from '../../../../shared/services/catalogService';

export default function EditConductorModal({
  isOpen,
  onClose,
  conductor,
  onUpdateConductor,
}) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (isOpen && conductor) {
      setForm({
        nombre: conductor.usuario?.nombre || '',
        telefono: conductor.usuario?.telefono || '',
        direccion: conductor.usuario?.direccion || '',
        idCiudad: conductor.usuario?.ciudad?.idCiudad || '',
        tipoDoc: conductor.usuario?.tipoDocumento?.idTipoDoc || '',
        numDocumento: conductor.usuario?.numDocumento || '',
        correo: conductor.usuario?.correo || '',

        numeroLicencia:
          conductor.numeroLicencia || conductor.usuario?.numDocumento || '',
        idCategoriaLicencia: conductor.idCategoriaLicencia || '',
        fechaVencimientoLicencia:
          conductor.fechaVencimientoLicencia?.split('T')[0] || '',
        observaciones: conductor.observaciones || '',
      });
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, conductor]);

  useEffect(() => {
    if (!isOpen) {
      setForm({});
      setError(null);
      setFieldErrors({});
      setActiveTab('basic');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      obtenerCategoriasLicencia()
        .then(res => {
          setCategorias(res.data || res || []);
        })
        .catch(() => setCategorias([]));

      catalogService
        .getCities()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            setCiudades(res.data);
          }
        })
        .catch(() => setCiudades([]));

      catalogService
        .getDocumentTypes()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            setTiposDoc(res.data);
          }
        })
        .catch(() => setTiposDoc([]));
    }
  }, [isOpen]);

  const handleAddressSelect = addressData => {
    if (addressData) {
      setForm(prev => ({ ...prev, direccion: addressData.address }));
      if (fieldErrors.direccion) {
        setFieldErrors(prev => ({ ...prev, direccion: null }));
      }
    }
  };

  const handleAddressChange = newAddress => {
    setForm(prev => ({ ...prev, direccion: newAddress }));
    if (fieldErrors.direccion) {
      setFieldErrors(prev => ({ ...prev, direccion: null }));
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 10) return;
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }

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
    } else if (!/^3\d{9}$/.test(form.telefono)) {
      errors.telefono = 'El teléfono debe tener 10 dígitos y empezar por 3';
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

    if (!form.idCategoriaLicencia) {
      errors.idCategoriaLicencia = 'Selecciona una categoría de licencia';
    }
    if (!form.fechaVencimientoLicencia) {
      errors.fechaVencimientoLicencia =
        'La fecha de vencimiento es obligatoria';
    } else {
      const fechaVencimiento = new Date(form.fechaVencimientoLicencia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaVencimiento < hoy) {
        errors.fechaVencimientoLicencia = 'La licencia está vencida';
      }
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
      const usuarioPayload = {
        nombre: form.nombre?.trim(),
        telefono: form.telefono?.trim(),
        direccion: form.direccion?.trim(),
        idCiudad: parseInt(form.idCiudad),
        tipoDoc: form.tipoDoc?.trim(),
      };

      const responseUsuario = await apiClient.put(
        `/usuarios/${conductor.idUsuario}`,
        usuarioPayload
      );

      if (!responseUsuario?.success) {
        throw new Error(
          responseUsuario?.message || 'Error al actualizar usuario'
        );
      }

      const conductorPayload = {
        numeroLicencia: form.numeroLicencia?.trim(),
        idCategoriaLicencia: form.idCategoriaLicencia?.trim(),
        fechaVencimientoLicencia: form.fechaVencimientoLicencia,
        observaciones: form.observaciones?.trim() || null,
      };

      await onUpdateConductor(conductor.idConductor, conductorPayload);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar el conductor');
    } finally {
      setLoading(false);
    }
  };

  const getLicenseStatus = () => {
    if (!form.fechaVencimientoLicencia) return null;

    const fechaVencimiento = new Date(form.fechaVencimientoLicencia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diasRestantes = Math.ceil(
      (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes < 0) {
      return { tipo: 'vencida', mensaje: '¡Licencia vencida!' };
    } else if (diasRestantes <= 30) {
      return {
        tipo: 'proxima',
        mensaje: `Licencia próxima a vencer (${diasRestantes} días)`,
      };
    }
    return null;
  };

  const licenseStatus = getLicenseStatus();

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
              <h2 className="h2 font-medium text-primary">Editar conductor</h2>
              <p className="h5 text-secondary font-medium">
                Actualiza la información personal y de licencia
              </p>
            </div>

            <div className="flex gap-2 mb-6 border-b border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('basic');
                  setError(null);
                }}
                className={`px-6 py-3 font-medium transition-all relative ${
                  activeTab === 'basic'
                    ? 'text-primary'
                    : 'text-secondary hover:text-primary'
                }`}
                disabled={loading}
              >
                Información básica
                {activeTab === 'basic' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('license');
                  setError(null);
                }}
                className={`px-6 py-3 font-medium transition-all relative ${
                  activeTab === 'license'
                    ? 'text-primary'
                    : 'text-secondary hover:text-primary'
                }`}
                disabled={loading}
              >
                Información de licencia
                {activeTab === 'license' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === 'basic' && (
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
                      className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.nombre
                          ? 'border-red focus:ring-red/20 focus:border-red'
                          : 'border-border focus:ring-primary/20 focus:border-primary'
                      }`}
                      disabled={loading}
                    />
                    {fieldErrors.nombre && (
                      <span className="text-red text-sm mt-1">
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
                            className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${
                              fieldErrors.tipoDoc
                                ? 'border-red'
                                : 'border-border'
                            }`}
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
                          <span className="text-red text-sm mt-1">
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
                        type="hidden"
                        value={form.direccion || ''}
                      />
                      <div className="relative">
                        <AddressAutocomplete
                          value={form.direccion || ''}
                          onChange={handleAddressChange}
                          onSelect={handleAddressSelect}
                          placeholder="Dirección completa"
                          disabled={loading}
                          country="co"
                        />
                      </div>
                      {fieldErrors.direccion && (
                        <span className="text-red text-sm mt-1">
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
                          className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${
                            fieldErrors.idCiudad
                              ? 'border-red'
                              : 'border-border'
                          }`}
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
                        <span className="text-red text-sm mt-1">
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
                      className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.telefono
                          ? 'border-red focus:ring-red/20 focus:border-red'
                          : 'border-border focus:ring-primary/20 focus:border-primary'
                      }`}
                      disabled={loading}
                    />
                    {fieldErrors.telefono && (
                      <span className="text-red text-sm mt-1">
                        {fieldErrors.telefono}
                      </span>
                    )}
                  </div>

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
                        className="w-full px-4 py-3 input bg-surface border rounded-lg text-secondary cursor-not-allowed opacity-75"
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
                        className="w-full px-4 py-3 input bg-surface border rounded-lg text-secondary cursor-not-allowed opacity-75"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'license' && (
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col gap-1">
                    <label
                      className="subtitle1 text-primary font-medium"
                      htmlFor="numeroLicencia"
                    >
                      Número de licencia
                    </label>
                    <input
                      id="numeroLicencia"
                      name="numeroLicencia"
                      type="text"
                      value={form.numeroLicencia || ''}
                      className="w-full px-4 py-3 input bg-surface border rounded-lg text-secondary cursor-not-allowed opacity-75"
                      disabled
                      readOnly
                    />
                    <span className="text-xs text-secondary mt-1">
                      El número de licencia es el mismo que el número de
                      documento
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className="subtitle1 text-primary font-medium"
                      htmlFor="idCategoriaLicencia"
                    >
                      Categoría de licencia <span className="text-red">*</span>
                    </label>
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        id="idCategoriaLicencia"
                        name="idCategoriaLicencia"
                        required
                        value={form.idCategoriaLicencia || ''}
                        onChange={handleChange}
                        className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${
                          fieldErrors.idCategoriaLicencia
                            ? 'border-red'
                            : 'border-border'
                        }`}
                        disabled={loading}
                      >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map(cat => (
                          <option
                            key={cat.idCategoriaLicencia}
                            value={cat.idCategoriaLicencia}
                          >
                            {cat.nombreCategoria} - {cat.descripcion}
                          </option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors.idCategoriaLicencia && (
                      <span className="text-red text-sm mt-1">
                        {fieldErrors.idCategoriaLicencia}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className="subtitle1 text-primary font-medium"
                      htmlFor="fechaVencimientoLicencia"
                    >
                      Fecha de vencimiento <span className="text-red">*</span>
                    </label>
                    <input
                      id="fechaVencimientoLicencia"
                      name="fechaVencimientoLicencia"
                      type="date"
                      required
                      value={form.fechaVencimientoLicencia || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 input bg-fill border rounded-lg text-secondary focus:outline-none focus:ring-2 transition-all date-secondary ${
                        fieldErrors.fechaVencimientoLicencia
                          ? 'border-red focus:ring-red/20 focus:border-red'
                          : 'border-border focus:ring-primary/20 focus:border-primary'
                      }`}
                      disabled={loading}
                    />
                    {fieldErrors.fechaVencimientoLicencia && (
                      <span className="text-red text-sm mt-1">
                        {fieldErrors.fechaVencimientoLicencia}
                      </span>
                    )}
                    {licenseStatus && (
                      <div
                        className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${
                          licenseStatus.tipo === 'vencida'
                            ? 'bg-red/10 border border-red/30'
                            : 'bg-yellow/10 border border-yellow/30'
                        }`}
                      >
                        <md-icon
                          className={`text-sm ${
                            licenseStatus.tipo === 'vencida'
                              ? 'text-red'
                              : 'text-yellow-600'
                          }`}
                        >
                          {licenseStatus.tipo === 'vencida'
                            ? 'error'
                            : 'warning'}
                        </md-icon>
                        <span
                          className={`text-sm ${
                            licenseStatus.tipo === 'vencida'
                              ? 'text-red'
                              : 'text-yellow-600'
                          }`}
                        >
                          {licenseStatus.mensaje}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className="subtitle1 text-primary font-medium"
                      htmlFor="observaciones"
                    >
                      Observaciones
                    </label>
                    <textarea
                      id="observaciones"
                      name="observaciones"
                      rows="3"
                      placeholder="Información adicional sobre la licencia (opcional)"
                      value={form.observaciones || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

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
                  {loading ? 'Actualizando...' : 'Actualizar conductor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </Modal>
  );
}
