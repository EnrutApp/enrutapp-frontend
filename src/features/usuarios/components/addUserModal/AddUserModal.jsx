import Modal from '../../../../shared/components/modal/Modal';
import apiClient from '../../../../shared/services/apiService';
import catalogService from '../../../../shared/services/catalogService';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useState, useEffect } from 'react';

const AddUserModal = ({ isOpen, onClose, onConfirm, isClientMode = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [ciudades, setCiudades] = useState([]);
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState([]);
  const [tiposDoc, setTiposDoc] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConductor, setIsConductor] = useState(false);
  const [showLicenseOptions, setShowLicenseOptions] = useState(false);
  const [licenseCompletionMethod, setLicenseCompletionMethod] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [licenseForm, setLicenseForm] = useState({});

  const totalSteps = isClientMode ? 3 : 4;

  useEffect(() => {
    if (!isOpen) {
      setForm({});
      setError(null);
      setFieldErrors({});
      setSuccess(false);
      setGeneratedPassword(null);
      setCurrentStep(1);
      setShowConfirmation(false);
      setIsConductor(false);
      setShowLicenseOptions(false);
      setLicenseCompletionMethod(null);
      setLicenseForm({});
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

      // Cargar categorías de licencia
      apiClient
        .get('/categorias-licencia')
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            setCategorias(res.data);
          }
        })
        .catch(() => setCategorias([]));
    }
  }, [isOpen]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Si se cambia el rol, verificar si es conductor
    if (name === 'idRol') {
      const selectedRole = roles.find(r => r.idRol === value);
      const esConductor = selectedRole?.nombreRol?.toLowerCase() === 'conductor';
      setIsConductor(esConductor);

      // Reset license options if changing from conductor to another role
      if (!esConductor) {
        setShowLicenseOptions(false);
        setLicenseCompletionMethod(null);
        setLicenseForm({});
      }
    }

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
    setError(null);
  };

  const validateStep = step => {
    const errors = {};

    if (step === 1) {
      if (!form.tipoDoc) {
        errors.tipoDoc = 'Selecciona un tipo de documento';
      }
      if (!form.numDocumento?.trim()) {
        errors.numDocumento = 'El número de documento es obligatorio';
      }
      if (!form.correo?.trim()) {
        errors.correo = 'El correo es obligatorio';
      } else if (!form.correo.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
        errors.correo = 'El correo no es válido';
      }
    } else if (step === 2) {
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
    } else if (step === 3 && !isClientMode) {
      // Paso 3: Rol del usuario
      if (!form.idRol) {
        errors.idRol = 'Selecciona un rol';
      }
    }

    return errors;
  };

  const handleNextStep = async () => {
    const errors = validateStep(currentStep);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    if (currentStep === 1) {
      try {
        setLoading(true);

        const docRes = await apiClient.get(
          `/usuarios/check-document/${form.tipoDoc}/${form.numDocumento}`
        );
        if (docRes.exists) {
          setFieldErrors({ numDocumento: 'El documento ya está registrado' });
          setError('El documento ya está registrado');
          setLoading(false);
          return;
        }

        const emailRes = await apiClient.get(
          `/usuarios/check-email/${form.correo}`
        );
        if (emailRes.exists) {
          setFieldErrors({
            correo: 'El correo electrónico ya está registrado',
          });
          setError('El correo electrónico ya está registrado');
          setLoading(false);
          return;
        }
      } catch (err) {

        setError('Error al validar los datos');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    if (currentStep === 2) {
    }

    // Si es paso 3 y es conductor, mostrar opciones de licencia
    if (currentStep === 3 && !isClientMode && isConductor) {
      setShowLicenseOptions(true);
      setError(null);
      setFieldErrors({});
      return;
    }

    setError(null);
    setFieldErrors({});
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    // Si está en opciones de licencia, volver al paso 3
    if (showLicenseOptions && !licenseCompletionMethod) {
      setShowLicenseOptions(false);
      return;
    }

    // Si está en formulario de licencia, volver a opciones
    if (showLicenseOptions && licenseCompletionMethod === 'now') {
      setLicenseCompletionMethod(null);
      setLicenseForm({});
      return;
    }

    setError(null);
    setFieldErrors({});
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleLicenseMethodSelect = (method) => {
    setLicenseCompletionMethod(method);

    if (method === 'invite') {
      // Si elige invitación, ir directo a confirmación
      setCurrentStep(4);
    }
    // Si elige 'now', quedarse en el mismo paso para mostrar formulario
  };

  const handleLicenseFormChange = (e) => {
    const { name, value } = e.target;
    setLicenseForm({ ...licenseForm, [name]: value });

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: null });
    }
  };

  const handleLicenseFormSubmit = () => {
    const errors = {};

    if (!licenseForm.idCategoriaLicencia) {
      errors.idCategoriaLicencia = 'Selecciona una categoría';
    }
    if (!licenseForm.fechaVencimientoLicencia) {
      errors.fechaVencimientoLicencia = 'Ingresa la fecha de vencimiento';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Por favor completa todos los campos de la licencia');
      return;
    }

    // Ir a confirmación
    setError(null);
    setFieldErrors({});
    setCurrentStep(4);
  };

  function generarPasswordAleatoria(length = 10) {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  const handleConfirmAndCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const requiredFields = isClientMode
      ? [
        'nombre',
        'correo',
        'tipoDoc',
        'numDocumento',
        'telefono',
        'direccion',
        'idCiudad',
      ]
      : [
        'nombre',
        'correo',
        'tipoDoc',
        'numDocumento',
        'telefono',
        'direccion',
        'idCiudad',
        'idRol',
      ];

    for (const field of requiredFields) {
      if (!form[field]) {
        setError('Por favor completa todos los campos requeridos');
        setLoading(false);
        return;
      }
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!form.tipoDoc || !uuidRegex.test(form.tipoDoc)) {

      setError('El tipo de documento seleccionado no es válido');
      setFieldErrors({ tipoDoc: 'Selecciona un tipo de documento válido' });
      setLoading(false);
      return;
    }

    if (!form.correo.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('El correo no es válido.');
      setLoading(false);
      return;
    }

    try {
      const emailChk = await apiClient.get(
        `/usuarios/check-email/${encodeURIComponent(form.correo)}`
      );
      if (emailChk?.exists) {
        setError('El correo ya está registrado.');
        setLoading(false);
        return;
      }

      const docChk = await apiClient.get(
        `/usuarios/check-document/${encodeURIComponent(form.tipoDoc)}/${encodeURIComponent(form.numDocumento)}`
      );
      if (docChk?.exists) {
        setError('El número de documento ya está registrado.');
        setLoading(false);
        return;
      }
    } catch (preErr) {

    }

    const password = generarPasswordAleatoria(10);
    setGeneratedPassword(password);

    try {
      let finalIdRol = form.idRol;
      if (isClientMode && roles.length > 0) {
        const rolCliente = roles.find(r => r.nombreRol === 'Cliente');
        finalIdRol = rolCliente ? rolCliente.idRol : form.idRol;
      }

      if (!finalIdRol || !uuidRegex.test(finalIdRol)) {


        setError('El rol seleccionado no es válido');
        setFieldErrors({ idRol: 'Selecciona un rol válido' });
        setLoading(false);
        return;
      }

      const payload = {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        contrasena: password,
        tipoDoc: form.tipoDoc.trim(),
        numDocumento: form.numDocumento.trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        idCiudad: parseInt(form.idCiudad),
        idRol: finalIdRol.trim(),
        estado: true,
      };

      const response = await apiClient.post('/usuarios', payload);
      if (!response?.success)
        throw new Error(response?.message || 'Error al agregar usuario');

      // Si es conductor y eligió completar ahora, crear el conductor
      if (isConductor && licenseCompletionMethod === 'now') {
        const conductorPayload = {
          idUsuario: response.data.idUsuario,
          numeroLicencia: form.numDocumento, // Usar el número de documento como licencia por defecto
          idCategoriaLicencia: licenseForm.idCategoriaLicencia,
          fechaVencimientoLicencia: licenseForm.fechaVencimientoLicencia,
          observaciones: licenseForm.observaciones || null,
        };

        await apiClient.post('/conductores', conductorPayload);
      }

      setSuccess(true);
      setShowConfirmation(true);
    } catch (err) {
      if (err?.message && Array.isArray(err.message)) {
        setError(err.message.join(', '));
      } else {
        setError(err.message || 'Error al agregar usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div
      className="flex flex-col gap-4"
      onKeyDown={async e => {
        if (e.key === 'Enter' && !loading) {
          e.preventDefault();
          await handleNextStep();
        }
      }}
    >
      <div className="grid grid-cols-2 gap-4">
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
            <div className="text-secondary text-sm">Cargando tipos...</div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="subtitle1 text-primary font-medium"
            htmlFor="numDocumento"
          >
            Número de documento <span className="text-red">*</span>
          </label>
          <input
            id="numDocumento"
            name="numDocumento"
            type="text"
            required
            placeholder="Número de documento"
            value={form.numDocumento || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${fieldErrors.numDocumento
              ? 'border-red focus:ring-red/20 focus:border-red'
              : 'border-border focus:ring-primary/20 focus:border-primary'
              }`}
            disabled={loading}
          />
          {fieldErrors.numDocumento && (
            <span className="text-red-500 text-sm mt-1">
              {fieldErrors.numDocumento}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="subtitle1 text-primary font-medium" htmlFor="correo">
          Correo electrónico <span className="text-red">*</span>
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          required
          placeholder="correo@ejemplo.com"
          value={form.correo || ''}
          onChange={handleChange}
          className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${fieldErrors.correo
            ? 'border-red focus:ring-red/20 focus:border-red'
            : 'border-border focus:ring-primary/20 focus:border-primary'
            }`}
          disabled={loading}
        />
        {fieldErrors.correo && (
          <span className="text-red-500 text-sm mt-1">
            {fieldErrors.correo}
          </span>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div
      className="flex flex-col gap-4"
      onKeyDown={async e => {
        if (e.key === 'Enter' && !loading) {
          e.preventDefault();
          await handleNextStep();
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <label className="subtitle1 text-primary font-medium" htmlFor="nombre">
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
  );

  const renderStep3 = () => (
    <div
      className="flex flex-col gap-4"
      onKeyDown={async e => {
        if (e.key === 'Enter' && !loading) {
          e.preventDefault();
          await handleNextStep();
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <label className="subtitle1 text-primary font-medium" htmlFor="idRol">
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
            className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${fieldErrors.idRol ? 'border-red-500' : 'border-border'}`}
            disabled={loading}
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
          <span className="text-red-500 text-sm mt-1">{fieldErrors.idRol}</span>
        )}
        <p className="text-xs text-secondary mt-1">
          El usuario recibirá una contraseña generada automáticamente por correo
          electrónico
        </p>
      </div>
    </div>
  );

  const renderLicenseOptions = () => (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-4">
        <h3 className="h4 font-medium text-primary mb-1">
          ¿Cómo deseas completar la información?
        </h3>
        <p className="subtitle2 text-secondary">
          Selecciona cómo completar los datos de licencia del conductor
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleLicenseMethodSelect('now')}
          className="p-6 content-box-outline-6-small hover:border-primary rounded-xl transition-all hover:shadow-md text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center group-hover:bg-primary/20 transition-colors">
              <md-icon className="text-blue text-xl">person_add</md-icon>
            </div>
            <div className="flex flex-col">
              <h3 className="subtitle1 font-normal text-primary ">Crear nuevo usuario conductor</h3>
              <p className="text-secondary text-sm">
                Registra un nuevo usuario con rol de conductor y configura sus datos de licencia en un solo proceso
              </p>
            </div>
            <md-icon className="text-secondary text-lg">call_made</md-icon>
          </div>
        </button>

        <button
          onClick={() => handleLicenseMethodSelect('invite')}
          className="p-6 content-box-outline-6-small hover:border-primary rounded-xl transition-all hover:shadow-md text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center group-hover:bg-primary/20 transition-colors">
              <md-icon className="text-blue text-xl">mail</md-icon>
            </div>
            <div className="flex flex-col gap-4 justify-between">
              <div className='flex-col'>
                <h3 className="subtitle1 font-normal text-primary ">Enviar invitación al conductor</h3>
                <p className="text-secondary text-sm">
                  El conductor recibirá un correo con sus credenciales y podrá completar sus datos de licencia al iniciar sesión
                </p>
              </div>
            </div>
            <md-icon className="text-secondary text-lg">call_made</md-icon>
          </div>
        </button>
      </div>

      <button
        onClick={() => setShowLicenseOptions(false)}
        className="btn btn-secondary w-full mt-4"
      >
        Atrás
      </button>
    </div>
  );

  const renderLicenseForm = () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="subtitle1 text-primary font-medium">
          Categoría de licencia <span className="text-red">*</span>
        </label>
        <div className="select-wrapper w-full">
          <md-icon className="text-sm">arrow_drop_down</md-icon>
          <select
            name="idCategoriaLicencia"
            value={licenseForm.idCategoriaLicencia || ''}
            onChange={handleLicenseFormChange}
            className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${fieldErrors.idCategoriaLicencia ? 'border-red-500' : 'border-border'}`}
            disabled={loading}
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map(cat => (
              <option key={cat.idCategoriaLicencia} value={cat.idCategoriaLicencia}>
                {cat.nombreCategoria}
              </option>
            ))}
          </select>
        </div>
        {fieldErrors.idCategoriaLicencia && (
          <span className="text-red-500 text-sm mt-1">
            {fieldErrors.idCategoriaLicencia}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="subtitle1 text-primary font-medium">
          Fecha de vencimiento <span className="text-red">*</span>
        </label>
        <input
          type="date"
          name="fechaVencimientoLicencia"
          value={licenseForm.fechaVencimientoLicencia || ''}
          onChange={handleLicenseFormChange}
          className={`w-full px-4 py-3 input bg-fill border border-border rounded-lg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all date-secondary ${fieldErrors.fechaVencimientoLicencia
            ? 'border-red focus:ring-red/20 focus:border-red'
            : 'border-border focus:ring-primary/20 focus:border-primary'
            }`}
          disabled={loading}
        />
        <span className="text-xs text-secondary mt-1">La fecha debe ser futura</span>
        {fieldErrors.fechaVencimientoLicencia && (
          <span className="text-red-500 text-sm mt-1">
            {fieldErrors.fechaVencimientoLicencia}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="subtitle1 text-primary font-medium">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={licenseForm.observaciones || ''}
          onChange={handleLicenseFormChange}
          placeholder="Información adicional sobre la licencia (opcional)"
          rows="3"
          className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          disabled={loading}
        />
      </div>

      <div className="flex justify-between items-center gap-2 pt-2 mt-4">
        <button
          type="button"
          onClick={() => {
            setLicenseCompletionMethod(null);
            setLicenseForm({});
          }}
          className="btn btn-secondary w-1/2"
          disabled={loading}
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={handleLicenseFormSubmit}
          className="btn btn-primary w-1/2"
          disabled={loading}
        >
          Continuar
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => {
    const tipoDocSeleccionado = tiposDoc.find(
      t => t.idTipoDoc === form.tipoDoc
    );
    const ciudadSeleccionada = ciudades.find(
      c => c.idCiudad === parseInt(form.idCiudad)
    );
    const rolSeleccionado = roles.find(r => r.idRol === form.idRol);

    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl content-box-outline-4-small p-6 space-y-4">
          <div className="flex items-start gap-3">
            <md-icon className="text-primary mt-1">person</md-icon>
            <div className="flex-1">
              <p className="text-xs text-secondary font-medium mb-1">
                Nombre completo
              </p>
              <p className="text-primary font-medium">{form.nombre}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <md-icon className="text-primary mt-1">badge</md-icon>
            <div className="flex-1">
              <p className="text-xs text-secondary font-medium mb-1">
                {tipoDocSeleccionado?.nombreTipoDoc}
              </p>
              <p className="text-primary font-medium">{form.numDocumento}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <md-icon className="text-primary mt-1">email</md-icon>
            <div className="flex-1">
              <p className="text-xs text-secondary font-medium mb-1">
                Correo electrónico
              </p>
              <p className="text-primary font-medium">{form.correo}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <md-icon className="text-primary mt-1">call</md-icon>
            <div className="flex-1">
              <p className="text-xs text-secondary font-medium mb-1">
                Teléfono
              </p>
              <p className="text-primary font-medium">{form.telefono}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <md-icon className="text-primary mt-1">location_on</md-icon>
            <div className="flex-1">
              <p className="text-xs text-secondary font-medium mb-1">
                Dirección
              </p>
              <p className="text-primary font-medium">{form.direccion}</p>
              <p className="text-secondary text-sm">
                {ciudadSeleccionada?.nombreCiudad}
              </p>
            </div>
          </div>

          {!isClientMode && (
            <div className="flex items-start gap-3">
              <md-icon className="text-primary mt-1">
                admin_panel_settings
              </md-icon>
              <div className="flex-1">
                <p className="text-xs text-secondary font-medium mb-1">
                  Rol asignado
                </p>
                <p className="text-primary font-medium">
                  {rolSeleccionado?.nombreRol}
                </p>
              </div>
            </div>
          )}

          {/* Mostrar información de licencia si es conductor y se completó */}
          {isConductor && licenseCompletionMethod === 'now' && (
            <>
              <div className="flex items-start gap-3">
                <md-icon className="text-primary mt-1">card_membership</md-icon>
                <div className="flex-1">
                  <p className="text-xs text-secondary font-medium mb-1">
                    Categoría de licencia
                  </p>
                  <p className="text-primary font-medium">
                    {categorias.find(c => c.idCategoriaLicencia === licenseForm.idCategoriaLicencia)?.nombreCategoria || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <md-icon className="text-primary mt-1">event</md-icon>
                <div className="flex-1">
                  <p className="text-xs text-secondary font-medium mb-1">
                    Vencimiento de licencia
                  </p>
                  <p className="text-primary font-medium">
                    {licenseForm.fechaVencimientoLicencia
                      ? new Date(licenseForm.fechaVencimientoLicencia).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : '-'}
                  </p>
                </div>
              </div>

              {licenseForm.observaciones && (
                <div className="flex items-start gap-3">
                  <md-icon className="text-primary mt-1">note</md-icon>
                  <div className="flex-1">
                    <p className="text-xs text-secondary font-medium mb-1">
                      Observaciones
                    </p>
                    <p className="text-primary font-medium">
                      {licenseForm.observaciones}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Indicador de invitación pendiente */}
          {isConductor && licenseCompletionMethod === 'invite' && (
            <div className="lex flex-col md:flex-row gap-6 mt-2 p-4 rounded-xl bg-background border border-border">
              <md-icon className="text-blue mt-1">mail</md-icon>
              <div className="flex-1">
                <p className="text-xs text-blue font-medium mb-1">
                  Invitación pendiente
                </p>
                <p className="text-secondary text-xs">
                  El conductor completará sus datos de licencia al iniciar sesión por primera vez
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg content-box-outline-4-small p-4">
          <div className="flex gap-3">
            <md-icon className="text-blue">info</md-icon>
            <div className="flex-1">
              <p className="text-blue text-sm font-medium mb-1">
                Información importante
              </p>
              <p className="text-secondary text-xs">
                Se generará una contraseña automática que será enviada al correo
                del usuario. Por favor, verifica que todos los datos sean
                correctos antes de confirmar.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green/20 rounded-full animate-ping"></div>

        <div className="flex items-center justify-center mb-4 mt-3 animate-scale-in">
          <md-icon className="text-green text-3xl">person</md-icon>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="h4 font-medium text-primary animate-slide-up">
          ¡{isClientMode ? 'Cliente' : 'Usuario'} creado exitosamente!
        </h2>
        <p className="text-secondary subtitle1 font-light animate-slide-up mt-2">
          El {isClientMode ? 'cliente' : 'usuario'}{' '}
          <span className="font-semibold text-primary">{form.nombre}</span> ha{' '}
          <br /> sido registrado correctamente.
        </p>
      </div>

      <div
        className="content-box-outline-4-small p-4 max-w-md w-full mb-3 animate-slide-up"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="flex items-start gap-3">
          <md-icon className="text-blue">mail</md-icon>
          <div className="flex-1">
            <p className="text-sm text-primary font-medium mb-1">
              Credenciales enviadas
            </p>
            <p className="text-xs text-secondary">
              Se ha enviado un correo a{' '}
              <span className="font-medium text-primary">{form.correo}</span>{' '}
              con las credenciales de acceso
              {isConductor && licenseCompletionMethod === 'invite' &&
                ' y las instrucciones para completar su perfil de conductor'}.
            </p>
          </div>
        </div>
      </div>

      {isConductor && licenseCompletionMethod === 'now' && (
        <div
          className="content-box-outline-4-small p-4 max-w-md w-full mb-8 animate-slide-up bg-green/10 border-green/30"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-start gap-3">
            <md-icon className="text-green">check_circle</md-icon>
            <div className="flex-1">
              <p className="text-sm text-primary font-medium mb-1">
                Perfil de conductor completo
              </p>
              <p className="text-xs text-secondary">
                La información de licencia ha sido registrada exitosamente.
              </p>
            </div>
          </div>
        </div>
      )}

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
                  <h2 className="h2 font-medium text-primary">
                    {isClientMode ? 'Añadir cliente' : 'Añadir usuario'}
                  </h2>
                  <p className="h5 text-secondary font-medium">
                    {currentStep === 1 && 'Identificación y acceso'}
                    {currentStep === 2 && 'Información personal y contacto'}
                    {currentStep === 3 &&
                      !isClientMode &&
                      !showLicenseOptions &&
                      'Asignar rol y permisos'}
                    {currentStep === 3 &&
                      !isClientMode &&
                      showLicenseOptions &&
                      !licenseCompletionMethod &&
                      'Datos de Licencia'}
                    {currentStep === 3 &&
                      !isClientMode &&
                      showLicenseOptions &&
                      licenseCompletionMethod === 'now' &&
                      'Información de licencia'}
                    {currentStep === 3 && isClientMode && 'Confirma los datos'}
                    {currentStep === 4 && !isClientMode && 'Confirma los datos'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-8">
                  {[...Array(totalSteps)].map((_, index) => {
                    const step = index + 1;
                    return (
                      <div key={step} className="flex items-center">
                        <div
                          className={`
                                                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 transform
                                                    ${currentStep >= step
                              ? 'bg-primary text-on-primary shadow-md scale-110 ring-4 ring-primary/20'
                              : 'bg-fill text-secondary scale-100'
                            }
                                                    ${currentStep === step ? 'animate-pulse' : ''}
                                                    font-semibold
                                                `}
                        >
                          {currentStep > step ? (
                            <md-icon className="text-base">check</md-icon>
                          ) : (
                            step
                          )}
                        </div>
                        {step < totalSteps && (
                          <div
                            className={`h-1 w-16 transition-all duration-300 ${currentStep > step ? 'bg-primary' : 'bg-fill'}`}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && !isClientMode && !showLicenseOptions && renderStep3()}
                  {currentStep === 3 && !isClientMode && showLicenseOptions && !licenseCompletionMethod && renderLicenseOptions()}
                  {currentStep === 3 && !isClientMode && showLicenseOptions && licenseCompletionMethod === 'now' && renderLicenseForm()}
                  {((currentStep === 3 && isClientMode) ||
                    (currentStep === 4 && !isClientMode)) &&
                    renderConfirmation()}

                  {error && (
                    <div className="bg-red/10 border border-red/30 rounded-lg p-3 mt-4">
                      <p className="text-red text-sm">{error}</p>
                    </div>
                  )}

                  {/* Solo mostrar botones Anterior/Siguiente si no está en opciones de licencia o formulario de licencia */}
                  {!(showLicenseOptions && currentStep === 3) && (
                    <div className="flex justify-between items-center gap-2 pt-2 mt-8">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className={`btn btn-secondary w-1/2 ${currentStep === 1 ? 'invisible' : ''}`}
                        disabled={loading || currentStep === 1}
                      >
                        Anterior
                      </button>

                      {currentStep < totalSteps ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          {loading && (
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          )}
                          {loading ? 'Validando...' : 'Siguiente'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleConfirmAndCreate}
                          className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          {loading && (
                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          )}
                          {loading ? 'Creando...' : 'Confirmar y crear'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
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

export default AddUserModal;
