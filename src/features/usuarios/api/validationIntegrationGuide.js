/**
 * ============================================
 * GUÍA DE INTEGRACIÓN - REACT HOOK FORM + YUP
 * ============================================
 * Ejemplos de cómo integrar los esquemas de validación
 * en tu componente AddUserModal con React Hook Form
 */

/**
 * OPCIÓN 1: USO BÁSICO CON useForm Y register
 * ============================================
 * Para integrar en AddUserModal
 */

// En la parte superior del componente:
// import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import {
//   usuarioStep1Schema,
//   usuarioStep2Schema,
//   usuarioStep3Schema,
//   licenseSchema
// } from './usuariosValidationSchemas';

/*
const AddUserModal = ({ isOpen, onClose, onConfirm, isClientMode = false }) => {
  // Determina el esquema según el paso actual
  const getValidationSchema = (step) => {
    switch(step) {
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    reset
  } = useForm({
    resolver: yupResolver(getValidationSchema(currentStep)),
    mode: 'onBlur', // Valida al salir del campo
    reValidateMode: 'onChange'
  });

  const handleNextStep = async () => {
    // Valida el paso actual
    const isValid = await trigger();
    if (!isValid) return;

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  // En el formulario:
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {currentStep === 1 && (
        <>
          <select {...register('tipoDoc')}>
            {tiposDoc.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {errors.tipoDoc && (
            <span className="error">{errors.tipoDoc.message}</span>
          )}

          <input
            {...register('numDocumento')}
            placeholder="Número de documento"
            type="text"
            inputMode="numeric"
          />
          {errors.numDocumento && (
            <span className="error">{errors.numDocumento.message}</span>
          )}

          <input
            {...register('correo')}
            placeholder="Correo electrónico"
            type="email"
          />
          {errors.correo && (
            <span className="error">{errors.correo.message}</span>
          )}
        </>
      )}

      {currentStep === 2 && (
        <>
          <input
            {...register('nombre')}
            placeholder="Nombre completo"
            type="text"
          />
          {errors.nombre && (
            <span className="error">{errors.nombre.message}</span>
          )}

          <input
            {...register('telefono')}
            placeholder="Teléfono"
            type="tel"
            inputMode="numeric"
          />
          {errors.telefono && (
            <span className="error">{errors.telefono.message}</span>
          )}

          <input
            {...register('direccion')}
            placeholder="Dirección"
            type="text"
          />
          {errors.direccion && (
            <span className="error">{errors.direccion.message}</span>
          )}

          <select {...register('idCiudad')}>
            <option value="">Selecciona una ciudad</option>
            {ciudades.map(ciudad => (
              <option key={ciudad.id} value={ciudad.id}>
                {ciudad.nombre}
              </option>
            ))}
          </select>
          {errors.idCiudad && (
            <span className="error">{errors.idCiudad.message}</span>
          )}
        </>
      )}

      {currentStep === 3 && (
        <>
          <select {...register('idRol')}>
            <option value="">Selecciona un rol</option>
            {roles.map(rol => (
              <option key={rol.idRol} value={rol.idRol}>
                {rol.nombreRol}
              </option>
            ))}
          </select>
          {errors.idRol && (
            <span className="error">{errors.idRol.message}</span>
          )}
        </>
      )}

      {currentStep === 4 && (
        <>
          <select {...register('idCategoriaLicencia')}>
            <option value="">Selecciona categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {errors.idCategoriaLicencia && (
            <span className="error">{errors.idCategoriaLicencia.message}</span>
          )}

          <input
            {...register('fechaVencimientoLicencia')}
            type="date"
          />
          {errors.fechaVencimientoLicencia && (
            <span className="error">
              {errors.fechaVencimientoLicencia.message}
            </span>
          )}
        </>
      )}

      <button onClick={handlePrevStep}>Anterior</button>
      <button onClick={handleNextStep}>Siguiente</button>
    </Modal>
  );
}
*/

/**
 * OPCIÓN 2: VALIDACIÓN POR PASOS CON ESQUEMA PARCIAL
 * ===============================================
 * Si prefieres mantener tu enfoque actual con validación manual
 * pero usando los esquemas Yup
 */

/*
import {
  usuarioStep1Schema,
  usuarioStep2Schema,
  usuarioStep3Schema,
  licenseSchema
} from './usuariosValidationSchemas';

const validateStep = async (step, formData) => {
  try {
    let schema;
    
    switch(step) {
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

    // Valida los datos contra el esquema
    await schema.validate(formData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (validationError) {
    // Transforma errores Yup al formato que esperas
    const errors = {};
    validationError.inner.forEach(error => {
      errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};

// En tu handleNextStep:
const handleNextStep = async () => {
  const { isValid, errors } = await validateStep(currentStep, form);
  
  if (!isValid) {
    setFieldErrors(errors);
    setError('Por favor completa todos los campos correctamente');
    return;
  }

  // Continuación del flujo...
  setCurrentStep(prev => Math.min(prev + 1, totalSteps));
};
*/

/**
 * OPCIÓN 3: VALIDACIÓN EN TIEMPO REAL (onBlur/onChange)
 * =====================================================
 * Para validar campos individuales mientras el usuario escribe
 */

/*
const validateField = async (fieldName, fieldValue, step) => {
  try {
    let schema;
    
    switch(step) {
      case 1:
        schema = usuarioStep1Schema.fields[fieldName];
        break;
      case 2:
        schema = usuarioStep2Schema.fields[fieldName];
        break;
      case 3:
        schema = usuarioStep3Schema.fields[fieldName];
        break;
      case 4:
        schema = licenseSchema.fields[fieldName];
        break;
      default:
        return null;
    }

    if (!schema) return null;

    // Valida solo el campo específico
    await schema.validate(fieldValue);
    return null; // Sin error
  } catch (error) {
    return error.message; // Retorna el mensaje de error
  }
};

const handleFieldBlur = async (e) => {
  const { name, value } = e.target;
  
  const error = await validateField(name, value, currentStep);
  
  setFieldErrors(prev => ({
    ...prev,
    [name]: error
  }));
};
*/

/**
 * OPCIÓN 4: VALIDADORES PERSONALIZADOS - USO DIRECTO
 * ==================================================
 * Si prefieres usar los validadores de forma independiente
 */

/*
import {
  isNumericOnly,
  isLettersOnly,
  isAlphanumeric,
  isValidEmail,
  isDateInValidRange
} from './usuariosValidationSchemas';

// Ejemplo: Validación de número de documento en tiempo real
const handleDocumentoChange = (e) => {
  const value = e.target.value;

  // Solo permite números
  if (!isNumericOnly(value) && value !== '') {
    console.warn('El campo solo acepta números');
    return;
  }

  setForm({ ...form, numDocumento: value });
};

// Ejemplo: Validación de nombre en tiempo real
const handleNombreChange = (e) => {
  const value = e.target.value;

  // Solo permite letras y espacios
  if (!isLettersOnly(value) && value !== '') {
    console.warn('El nombre solo puede contener letras');
    return;
  }

  setForm({ ...form, nombre: value });
};

// Ejemplo: Validación de dirección
const handleDireccionChange = (e) => {
  const value = e.target.value;

  // Solo permite alfanuméricos
  if (!isAlphanumeric(value) && value !== '') {
    console.warn('Dirección inválida');
    return;
  }

  setForm({ ...form, direccion: value });
};

// Ejemplo: Validación de fecha
const handleFechaChange = (dateValue) => {
  if (!isDateInValidRange(dateValue)) {
    setError('No puede ser pasada ni mayor a 1 año');
    return;
  }

  setForm({ ...form, fechaVencimiento: dateValue });
};
*/

/**
 * EJEMPLO COMPLETO: CAMPO CON VALIDACIÓN EN TIEMPO REAL
 * ====================================================
 */

/*
const NumeroDocumentoInput = ({ value, onChange, error }) => {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;

    // Solo permite números
    const numericOnly = inputValue.replace(/[^\d]/g, '');

    // Limita a 12 caracteres
    if (numericOnly.length <= 12) {
      onChange(numericOnly);
    }
  };

  const handleBlur = async () => {
    const { isValid, errors } = await usuarioStep1Schema
      .validateAt('numDocumento', { numDocumento: value })
      .then(() => ({ isValid: true, errors: {} }))
      .catch(err => ({ isValid: false, errors: { [err.path]: err.message } }));

    // Mostrar error si es necesario
    if (!isValid) {
      console.error(errors.numDocumento);
    }
  };

  return (
    <div className="form-group">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="Ingresa 10 dígitos"
        inputMode="numeric"
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
*/

/**
 * MENSAJES DE ERROR PERSONALIZADOS
 * ================================
 * Puedes personalizar los mensajes directamente en los esquemas
 * o crear un archivo separado de mensajes de error
 */

const errorMessages = {
  // Paso 1
  tipoDoc: 'Selecciona un tipo de documento',
  numDocumento: 'Solo se permiten números',
  correo: 'Formato de correo inválido - debe contener @ y dominio',

  // Paso 2
  nombre: 'El nombre no debe contener números',
  telefono: 'Solo números permitidos',
  direccion: 'Dirección inválida - solo letras, números, espacios, # y -',
  idCiudad: 'Selecciona una ciudad',

  // Paso 3
  idRol: 'Selecciona un rol',

  // Paso 4
  idCategoriaLicencia: 'Selecciona una categoría de licencia',
  fechaVencimientoLicencia: 'No puede ser pasada ni mayor a 1 año',

  // Globales
  minCharacters: 'Mínimo 2 caracteres',
  required: 'Este campo es obligatorio',
};

/**
 * PATRONES DE REGEX DISPONIBLES
 * =============================
 * Para usar en validaciones adicionales
 */

const patterns = {
  onlyNumbers: /^\d+$/,
  onlyLetters: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  alphanumeric: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{7,10}$/,
  fourDigits: /^\d{4}$/,
  placa: /^[A-Z]{3}\d{3}$/,
};

export { errorMessages, patterns };
