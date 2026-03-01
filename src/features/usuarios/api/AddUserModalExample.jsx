/**
 * ============================================
 * EJEMPLO PRÁCTICO: COMPONENTE REFACTORIZADO
 * ============================================
 * Ejemplo de cómo refactorizar AddUserModal usando React Hook Form + Yup
 * Puedes adaptar esto gradualmente a tu componente actual
 */

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import apiClient from '../../../../shared/services/apiService';
import catalogService from '../../../../shared/services/catalogService';

import {
  usuarioStep1Schema,
  usuarioStep2Schema,
  usuarioStep3Schema,
  licenseSchema,
} from './usuariosValidationSchemas';

/**
 * REFACTORIZACIÓN PASO A PASO
 * ==========================
 *
 * OPCIÓN A: Migración gradual (mantiene logic actual)
 * OPCIÓN B: Uso full de React Hook Form (recomendado)
 */

/**
 * ============================================
 * OPCIÓN A: MIGRACIÓN GRADUAL
 * ============================================
 * Mantiene la estructura actual pero usa schemas Yup
 */

export const AddUserModalGradual = ({
  // eslint-disable-next-line unused-imports/no-unused-vars
  isOpen,
  // eslint-disable-next-line unused-imports/no-unused-vars
  onClose,
  // eslint-disable-next-line unused-imports/no-unused-vars
  onConfirm,
  isClientMode = false,
}) => {
  // Tu estado actual se mantiene
  // eslint-disable-next-line no-undef
  const [currentStep, setCurrentStep] = React.useState(1);
  // eslint-disable-next-line unused-imports/no-unused-vars, no-undef
  const [form, setForm] = React.useState({});
  // eslint-disable-next-line unused-imports/no-unused-vars, no-undef
  const [fieldErrors, setFieldErrors] = React.useState({});
  // ... resto del estado

  /**
   * Validar step usando schemas Yup
   */
  const validateStepWithYup = async (step, data) => {
    try {
      let schema;

      switch (step) {
        case 1:
          schema = usuarioStep1Schema;
          break;
        case 2:
          schema = usuarioStep2Schema;
          break;
        case 3:
          schema = usuarioStep3Schema;
          break;
        case 4:
          schema = licenseSchema;
          break;
        default:
          return { isValid: true, errors: {} };
      }

      // Valida el objeto completo del formulario
      await schema.validate(data, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (validationError) {
      // Transforma errores Yup al formato actual
      const errors = {};
      validationError.inner.forEach(error => {
        errors[error.path] = error.message;
      });
      return { isValid: false, errors };
    }
  };

  /**
   * Reemplaza tu validateStep actual con esta versión
   */
  // eslint-disable-next-line unused-imports/no-unused-vars
  const handleNextStep = async () => {
    const { isValid, errors } = await validateStepWithYup(currentStep, form);

    if (!isValid) {
      setFieldErrors(errors);
      // eslint-disable-next-line no-undef
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    // El resto de tu lógica se mantiene igual...
    if (currentStep === 1) {
      try {
        // eslint-disable-next-line no-undef
        setLoading(true);

        const docRes = await apiClient.get(
          `/usuarios/check-document/${form.tipoDoc}/${form.numDocumento}`
        );
        if (docRes.exists) {
          setFieldErrors({ numDocumento: 'El documento ya está registrado' });
          // eslint-disable-next-line no-undef
          setError('El documento ya está registrado');
          return;
        }

        const emailRes = await apiClient.get(
          `/usuarios/check-email/${form.correo}`
        );
        if (emailRes.exists) {
          setFieldErrors({
            correo: 'El correo electrónico ya está registrado',
          });
          // eslint-disable-next-line no-undef
          setError('El correo electrónico ya está registrado');
          return;
        }
      // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (err) {
        // eslint-disable-next-line no-undef
        setError('Error al validar los datos');
      } finally {
        // eslint-disable-next-line no-undef
        setLoading(false);
      }
    }

    // eslint-disable-next-line no-undef
    setError(null);
    setFieldErrors({});
    setCurrentStep(prev => Math.min(prev + 1, isClientMode ? 3 : 4));
  };

  // El resto del componente se mantiene igual...
};

/**
 * ============================================
 * OPCIÓN B: FULL REACT HOOK FORM + YUP
 * ============================================
 * Refactorización completa (recomendado para nuevos proyectos)
 */

export const AddUserModalModern = ({
  isOpen,
  onClose,
  onConfirm,
  isClientMode = false,
}) => {
  // eslint-disable-next-line no-undef
  const [currentStep, setCurrentStep] = React.useState(1);
  // eslint-disable-next-line no-undef
  const [loading, setLoading] = React.useState(false);
  // eslint-disable-next-line no-undef
  const [error, setError] = React.useState(null);
  // eslint-disable-next-line no-undef
  const [success, setSuccess] = React.useState(false);
  // Catálogos
  // eslint-disable-next-line no-undef
  const [ciudades, setCiudades] = React.useState([]);
  // eslint-disable-next-line no-undef
  const [roles, setRoles] = React.useState([]);
  // eslint-disable-next-line no-undef
  const [tiposDoc, setTiposDoc] = React.useState([]);
  // eslint-disable-next-line no-undef
  const [categorias, setCategorias] = React.useState([]);
  // eslint-disable-next-line unused-imports/no-unused-vars, no-undef
  const [isConductor, setIsConductor] = React.useState(false);

  const totalSteps = isClientMode ? 3 : 4;

  /**
   * Determina el schema según el paso actual
   */
  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1:
        return usuarioStep1Schema;
      case 2:
        return usuarioStep2Schema;
      case 3:
        return usuarioStep3Schema;
      case 4:
        return licenseSchema;
      default:
        return Yup.object({});
    }
  };

  /**
   * useForm con resolver Yup
   */
  const {
    register,
    // eslint-disable-next-line unused-imports/no-unused-vars
    handleSubmit,
    formState: { errors },
    watch,
    // eslint-disable-next-line unused-imports/no-unused-vars
    setValue,
    trigger,
    reset,
    getValues,
  } = useForm({
    resolver: yupResolver(getCurrentSchema()),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  /**
   * Observa cambios en rol para detectar conductores
   */
  const selectedRole = watch('idRol');

  // eslint-disable-next-line no-undef
  React.useEffect(() => {
    if (selectedRole) {
      const role = roles.find(r => r.idRol === selectedRole);
      const esConductor = role?.nombreRol?.toLowerCase() === 'conductor';
      setIsConductor(esConductor);
    }
  }, [selectedRole, roles]);

  /**
   * Carga inicial de catálogos
   */
  // eslint-disable-next-line no-undef
  React.useEffect(() => {
    if (!isOpen) {
      reset();
      setCurrentStep(1);
      setError(null);
      setSuccess(false);
      setIsConductor(false);
      return;
    }

    const loadCatalogs = async () => {
      try {
        const [citiesRes, rolesRes, docsRes, categoriasRes] = await Promise.all(
          [
            catalogService.getCities(),
            catalogService.getRoles(),
            catalogService.getDocumentTypes(),
            apiClient.get('/categorias-licencia'),
          ]
        );

        if (citiesRes.success && Array.isArray(citiesRes.data)) {
          setCiudades(citiesRes.data);
        }

        if (rolesRes.success && Array.isArray(rolesRes.data)) {
          setRoles(rolesRes.data.filter(r => r.estado));
        }

        if (docsRes.success && Array.isArray(docsRes.data)) {
          setTiposDoc(docsRes.data);
        }

        if (categoriasRes.success && Array.isArray(categoriasRes.data)) {
          setCategorias(categoriasRes.data);
        }
      } catch (err) {
        console.error('Error loading catalogs:', err);
      }
    };

    loadCatalogs();
  }, [isOpen, reset]);

  /**
   * Validación y avance de paso
   */
  const handleNextStep = async () => {
    const isValid = await trigger();

    if (!isValid) {
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    // Validaciones adicionales paso 1 (duplicados)
    if (currentStep === 1) {
      try {
        setLoading(true);
        const { numDocumento, tipoDoc, correo } = getValues();

        const docRes = await apiClient.get(
          `/usuarios/check-document/${tipoDoc}/${numDocumento}`
        );
        if (docRes.exists) {
          setError('El documento ya está registrado');
          return;
        }

        const emailRes = await apiClient.get(`/usuarios/check-email/${correo}`);
        if (emailRes.exists) {
          setError('El correo electrónico ya está registrado');
          return;
        }
      // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (err) {
        setError('Error al validar los datos');
        return;
      } finally {
        setLoading(false);
      }
    }

    setError(null);

    // Avanza al siguiente paso
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Envío final del formulario
      handleSubmitForm();
    }
  };

  /**
   * Retrocesso de paso
   */
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  /**
   * Envío final del formulario
   */
  const handleSubmitForm = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    try {
      setLoading(true);
      const formData = getValues();

      const response = await apiClient.post('/usuarios', {
        ...formData,
        // mapear campos según tu API
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onConfirm(response.data);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderizado condicional por paso
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Paso 1: Identificación y Acceso</h3>

            <div className="form-group">
              <label>Tipo de Documento *</label>
              <select {...register('tipoDoc')}>
                <option value="">Selecciona...</option>
                {tiposDoc.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {errors.tipoDoc && (
                <span className="error">{errors.tipoDoc.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Número de Documento *</label>
              <input
                {...register('numDocumento')}
                type="text"
                inputMode="numeric"
                placeholder="Ingresa 6-12 dígitos"
                maxLength="12"
              />
              {errors.numDocumento && (
                <span className="error">{errors.numDocumento.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Correo Electrónico *</label>
              <input
                {...register('correo')}
                type="email"
                placeholder="usuario@ejemplo.com"
              />
              {errors.correo && (
                <span className="error">{errors.correo.message}</span>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3>Paso 2: Datos Personales</h3>

            <div className="form-group">
              <label>Nombre Completo *</label>
              <input
                {...register('nombre')}
                type="text"
                placeholder="Juan Pérez"
              />
              {errors.nombre && (
                <span className="error">{errors.nombre.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Teléfono *</label>
              <input
                {...register('telefono')}
                type="tel"
                inputMode="numeric"
                placeholder="Ingresa 7-10 dígitos"
                maxLength="10"
              />
              {errors.telefono && (
                <span className="error">{errors.telefono.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Dirección *</label>
              <input
                {...register('direccion')}
                type="text"
                placeholder="Calle 123 #45 - 6"
              />
              {errors.direccion && (
                <span className="error">{errors.direccion.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Ciudad *</label>
              <select {...register('idCiudad')}>
                <option value="">Selecciona...</option>
                {ciudades.map(ciudad => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
              {errors.idCiudad && (
                <span className="error">{errors.idCiudad.message}</span>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3>Paso 3: Asignación de Rol</h3>

            <div className="form-group">
              <label>Rol del Usuario *</label>
              <select {...register('idRol')}>
                <option value="">Selecciona...</option>
                {roles.map(rol => (
                  <option key={rol.idRol} value={rol.idRol}>
                    {rol.nombreRol}
                  </option>
                ))}
              </select>
              {errors.idRol && (
                <span className="error">{errors.idRol.message}</span>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h3>Paso 4: Información de Licencia</h3>

            <div className="form-group">
              <label>Categoría de Licencia *</label>
              <select {...register('idCategoriaLicencia')}>
                <option value="">Selecciona...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.idCategoriaLicencia && (
                <span className="error">
                  {errors.idCategoriaLicencia.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Fecha de Vencimiento *</label>
              <input {...register('fechaVencimientoLicencia')} type="date" />
              {errors.fechaVencimientoLicencia && (
                <span className="error">
                  {errors.fechaVencimientoLicencia.message}
                </span>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Nuevo Usuario">
      <div className="modal-content">
        {/* Barra de progreso */}
        <div className="progress-bar">
          <span>
            {currentStep} de {totalSteps}
          </span>
        </div>

        {/* Contenido del paso */}
        {renderStep()}

        {/* Mensaje de error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Mensaje de éxito */}
        {success && (
          <div className="alert alert-success">
            ¡Usuario creado exitosamente!
          </div>
        )}

        {/* Botones de navegación */}
        <div className="modal-actions">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="btn btn-secondary"
          >
            Anterior
          </button>

          <button
            onClick={handleNextStep}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading
              ? 'Cargando...'
              : currentStep === totalSteps
                ? 'Crear Usuario'
                : 'Siguiente'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddUserModalModern;
