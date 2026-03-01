import * as Yup from 'yup';

/**
 * ============================================
 * ESQUEMAS DE VALIDACIÓN - FORMULARIO USUARIOS
 * ============================================
 * Esquemas Yup para formulario multi-pasos de Añadir Usuario
 * con reglas estrictas de validación por campo
 */

/**
 * PASO 1: Identificación y Acceso
 * Campos: Tipo de documento, Número de documento, Correo electrónico
 */
export const usuarioStep1Schema = Yup.object({
  tipoDoc: Yup.string()
    .required('Selecciona un tipo de documento')
    .typeError('Tipo de documento es requerido'),

  numDocumento: Yup.string()
    .required('El número de documento es obligatorio')
    .matches(/^\d{10}$/, 'El documento debe tener exactamente 10 dígitos')
    .length(10, 'El documento debe tener exactamente 10 dígitos')
    .test(
      'only-numbers',
      'Solo se permiten números',
      value => !value || /^\d{10}$/.test(value)
    ),

  correo: Yup.string()
    .required('El correo electrónico es obligatorio')
    .email('El correo electrónico debe ser válido')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'El correo electrónico debe ser válido'
    )
    .test(
      'valid-email-format',
      'El correo electrónico debe contener @ y dominio válido',
      value => {
        if (!value) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
    ),
});

/**
 * PASO 2: Datos Personales
 * Campos: Nombre completo, Teléfono, Dirección, Ciudad
 */
export const usuarioStep2Schema = Yup.object({
  nombre: Yup.string()
    .required('El nombre completo es obligatorio')
    .min(2, 'Mínimo 2 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre no debe contener números')
    .test('no-numbers', 'El nombre no debe contener números', value => {
      if (!value) return true;
      return !/\d/.test(value);
    })
    .test('only-letters-spaces', 'Solo letras y espacios permitidos', value => {
      if (!value) return true;
      return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
    }),

  telefono: Yup.string()
    .required('El teléfono es obligatorio')
    .matches(/^\d+$/, 'Solo números permitidos')
    .min(7, 'Mínimo 7 dígitos')
    .max(10, 'Máximo 10 dígitos')
    .test('only-numbers', 'Solo números permitidos', value => {
      if (!value) return true;
      return /^\d+$/.test(value);
    }),

  direccion: Yup.string()
    .required('La dirección es obligatoria')
    .min(5, 'Mínimo 5 caracteres')
    .matches(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]+$/,
      'Dirección inválida - solo letras, números, espacios, # y -'
    ),

  idCiudad: Yup.string()
    .required('Selecciona una ciudad')
    .typeError('Ciudad es requerida'),
});

/**
 * PASO 3: Roles
 * Campos: Rol del usuario
 */
export const usuarioStep3Schema = Yup.object({
  idRol: Yup.string()
    .required('Selecciona un rol')
    .typeError('Rol es requerido'),
});

/**
 * PASO 4: Completar Perfil / Licencia (solo para conductores)
 * Campos: Categoría de licencia, Fecha de vencimiento
 */
export const licenseSchema = Yup.object({
  idCategoriaLicencia: Yup.string()
    .required('Selecciona una categoría de licencia')
    .typeError('Categoría de licencia es requerida'),

  fechaVencimientoLicencia: Yup.date()
    .required('La fecha de vencimiento es obligatoria')
    .typeError('Ingresa una fecha válida')
    .test(
      'valid-date',
      'No puede ser pasada ni mayor a 1 año',
      function (value) {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        oneYearFromNow.setHours(0, 0, 0, 0);

        return value >= today && value <= oneYearFromNow;
      }
    ),
});

/**
 * ============================================
 * ESQUEMAS GLOBALES PARA OTROS FORMULARIOS
 * ============================================
 */

/**
 * Campo de texto corto (ej. Línea, Nombre corto)
 * Validación mínima de 2 caracteres
 */
export const shortTextFieldSchema = Yup.string()
  .required('Este campo es obligatorio')
  .min(2, 'Mínimo 2 caracteres')
  .trim();

/**
 * Campo de texto alfanumérico
 * Permite letras, números, guiones, # y espacios
 */
export const alphanumericFieldSchema = Yup.string()
  .required('Este campo es obligatorio')
  .min(2, 'Mínimo 2 caracteres')
  .matches(
    /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]+$/,
    'Solo letras, números, espacios, # y - permitidos'
  );

/**
 * Campo de fecha (ej. Fecha de origen)
 * Validación: No puede ser pasada ni mayor a 1 año
 */
export const futureOrPresentDateSchema = Yup.date()
  .required('La fecha es obligatoria')
  .typeError('Ingresa una fecha válida')
  .test(
    'valid-date-range',
    'No puede ser pasada ni mayor a 1 año',
    function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      oneYearFromNow.setHours(0, 0, 0, 0);

      return value >= today && value <= oneYearFromNow;
    }
  );

/**
 * Campo de año (ej. Año de fabricación)
 * Solo números, mínimo 4 dígitos
 */
export const yearFieldSchema = Yup.string()
  .required('El año es obligatorio')
  .matches(/^\d{4}$/, 'Ingresa un año válido (4 dígitos)')
  .test('only-numbers', 'Solo números permitidos', value => {
    if (!value) return true;
    return /^\d{4}$/.test(value);
  });

/**
 * Campo de placa vehicular
 * Formato: 3 letras + 3 números (ej: ABC123)
 */
export const placaVehicularSchema = Yup.string()
  .required('La placa es obligatoria')
  .min(2, 'La placa debe tener mínimo 2 caracteres')
  .matches(
    /^[A-Z]{3}\d{3}$/,
    'Formato inválido - debe ser ABC123 (3 letras mayúsculas + 3 números)'
  )
  .test('has-min-digits', 'La placa debe tener mínimo 2 dígitos', value => {
    if (!value) return true;
    const digits = (value.match(/\d/g) || []).length;
    return digits >= 2;
  })
  .uppercase('La placa debe estar en mayúsculas');

/**
 * Campo de VIN (Vehicle Identification Number)
 * Formato: 17 caracteres alfanuméricos
 */
export const vinSchema = Yup.string()
  .required('El VIN es obligatorio')
  .min(17, 'El VIN debe tener exactamente 17 caracteres')
  .max(17, 'El VIN debe tener exactamente 17 caracteres')
  .length(17, 'El VIN debe tener exactamente 17 caracteres')
  .matches(
    /^[A-HJ-NPR-Z0-9]{17}$/,
    'Formato inválido - VIN debe contener 17 caracteres alfanuméricos (sin I, O, Q)'
  )
  .test('valid-vin-format', 'VIN inválido - revisa el formato', value => {
    if (!value) return true;
    // VIN válido: 17 caracteres, sin I, O, Q
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(value);
  })
  .uppercase('El VIN debe estar en mayúsculas');

/**
 * Campo de número de teléfono
 * Solo números, 10 dígitos
 */
export const phoneFieldSchema = Yup.string()
  .required('El teléfono es obligatorio')
  .matches(/^\d+$/, 'Solo números permitidos')
  .length(10, 'El teléfono debe tener 10 dígitos')
  .test('only-numbers', 'Solo números permitidos', value => {
    if (!value) return true;
    return /^\d{10}$/.test(value);
  });

/**
 * Campo solo números (genérico)
 * Ejemplo uso: Número de pasajeros, ID externo, etc.
 */
export const numericOnlyFieldSchema = Yup.string()
  .required('Este campo es obligatorio')
  .matches(/^\d+$/, 'Solo números permitidos')
  .test('only-numbers', 'Solo números permitidos', value => {
    if (!value) return true;
    return /^\d+$/.test(value);
  });

/**
 * Campo solo letras (genérico)
 * Ejemplo uso: Nombres, ciudades, referencias, etc.
 */
export const lettersOnlyFieldSchema = Yup.string()
  .required('Este campo es obligatorio')
  .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras permitidas')
  .test('no-numbers', 'No debe contener números', value => {
    if (!value) return true;
    return !/\d/.test(value);
  });

/**
 * ESQUEMAS COMPLETOS REUTILIZABLES
 */

/**
 * Esquema para crear contrato
 */
export const contratoSchema = Yup.object({
  linea: Yup.string()
    .required('La línea es obligatoria')
    .min(2, 'Mínimo 2 caracteres'),

  fechaOrigen: futureOrPresentDateSchema,

  descripcion: Yup.string()
    .required('La descripción es obligatoria')
    .min(5, 'Mínimo 5 caracteres'),
});

/**
 * Esquema para crear vehículo
 */
export const vehiculoSchema = Yup.object({
  nombreVehiculo: Yup.string()
    .required('El nombre del vehículo es obligatorio')
    .min(2, 'Mínimo 2 caracteres'),

  vin: vinSchema,

  placa: placaVehicularSchema,

  marcaVehiculo: Yup.string()
    .required('La marca es obligatoria')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras permitidas'),

  anioFabricacion: yearFieldSchema,

  capacidadPasajeros: Yup.string()
    .required('Capacidad es obligatoria')
    .matches(/^\d+$/, 'Solo números permitidos')
    .test('valid-number', 'Capacidad debe ser entre 1 y 100', value => {
      if (!value) return false;
      const num = parseInt(value);
      return num >= 1 && num <= 100;
    }),
});

/**
 * ============================================
 * VALIDADORES PERSONALIZADOS REUTILIZABLES
 * ============================================
 */

/**
 * Valida que solo contenga números
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido
 */
export const isNumericOnly = value => {
  if (!value) return true;
  return /^\d+$/.test(value);
};

/**
 * Valida que solo contenga letras y espacios
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido
 */
export const isLettersOnly = value => {
  if (!value) return true;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value);
};

/**
 * Valida que sea alfanumérico (letras, números, espacios, -, #)
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido
 */
export const isAlphanumeric = value => {
  if (!value) return true;
  return /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]+$/.test(value);
};

/**
 * Valida que sea un email válido
 * @param {string} value - Valor a validar
 * @returns {boolean} true si es válido
 */
export const isValidEmail = value => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

/**
 * Valida rango de fechas (hoy a 1 año)
 * @param {Date} value - Fecha a validar
 * @returns {boolean} true si está dentro del rango
 */
export const isDateInValidRange = value => {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  oneYearFromNow.setHours(0, 0, 0, 0);

  return value >= today && value <= oneYearFromNow;
};
