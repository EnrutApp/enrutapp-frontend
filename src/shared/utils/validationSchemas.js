import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Debe ser un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  remember: yup.boolean().default(false),
});

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es obligatorio'),
  email: yup
    .string()
    .email('Debe ser un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'
    )
    .required('La contraseña es obligatoria'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirmar contraseña es obligatorio'),
  documentNumber: yup
    .string()
    .min(6, 'El número de documento debe tener al menos 6 caracteres')
    .required('El número de documento es obligatorio'),
  phone: yup
    .string()
    .matches(/^3\d{9}$/, 'El teléfono debe tener 10 dígitos y empezar por 3')
    .required('El teléfono es obligatorio'),
  address: yup
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .required('La dirección es obligatoria'),
  idCiudad: yup
    .mixed()
    .test(
      'is-valid-idCiudad',
      'La ciudad es obligatoria',
      value =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !isNaN(Number(value))
    )
    .required('La ciudad es obligatoria'),
  roleId: yup.string().required('Debe seleccionar un rol'),
  documentType: yup.string().required('Debe seleccionar un tipo de documento'),
});

export const userSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es obligatorio'),
  email: yup
    .string()
    .email('Debe ser un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  documentNumber: yup
    .string()
    .min(6, 'El número de documento debe tener al menos 6 caracteres')
    .required('El número de documento es obligatorio'),
  phone: yup
    .string()
    .matches(/^3\d{9}$/, 'El teléfono debe tener 10 dígitos y empezar por 3')
    .required('El teléfono es obligatorio'),
  address: yup
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .required('La dirección es obligatoria'),
  city: yup
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .required('La ciudad es obligatoria'),
  roleId: yup.string().required('Debe seleccionar un rol'),
  documentType: yup.string().required('Debe seleccionar un tipo de documento'),
});

export const createUserSchema = userSchema.shape({
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'
    )
    .required('La contraseña es obligatoria'),
});

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('La contraseña actual es obligatoria'),
  newPassword: yup
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'
    )
    .notOneOf(
      [yup.ref('currentPassword')],
      'La nueva contraseña debe ser diferente a la actual'
    )
    .required('La nueva contraseña es obligatoria'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Las contraseñas deben coincidir')
    .required('Confirmar nueva contraseña es obligatorio'),
});

export const reservaSchema = yup.object().shape({
  origen: yup
    .string()
    .min(2, 'El origen debe tener al menos 2 caracteres')
    .required('El origen es obligatorio'),
  destino: yup
    .string()
    .min(2, 'El destino debe tener al menos 2 caracteres')
    .required('El destino es obligatorio'),
  fecha: yup
    .date()
    .min(new Date(), 'La fecha debe ser igual o posterior a hoy')
    .required('La fecha es obligatoria')
    .typeError('La fecha debe ser válida'),
  hora: yup
    .string()
    .required('La hora es obligatoria')
    .matches(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      'La hora debe estar en formato HH:mm'
    ),
  idConductor: yup
    .mixed()
    .test(
      'is-valid-conductor',
      'Debes seleccionar un conductor',
      value => value !== undefined && value !== null && value !== ''
    )
    .required('El conductor es obligatorio'),
  pasajeros: yup
    .array()
    .of(
      yup.object().shape({
        nombre: yup
          .string()
          .min(2, 'El nombre del pasajero debe tener al menos 2 caracteres')
          .required('El nombre del pasajero es obligatorio'),
      })
    )
    .min(1, 'Debe haber al menos un pasajero')
    .required('Los pasajeros son obligatorios'),
  estado: yup
    .string()
    .oneOf(['Pendiente', 'Activo', 'Completada', 'Cancelada'])
    .default('Pendiente'),
});

// Esquema de validación para búsqueda de viajes
export const searchViajeSchema = yup.object().shape({
  origen: yup
    .string()
    .min(2, "La ciudad de origen debe tener al menos 2 caracteres")
    .required("La ciudad de origen es obligatoria"),
  destino: yup
    .string()
    .min(2, "La ciudad de destino debe tener al menos 2 caracteres")
    .required("La ciudad de destino es obligatoria")
    .test(
      "not-same-as-origen",
      "Origen y destino no pueden ser la misma ciudad",
      function(value) {
        return value && this.parent.origen && value.toLowerCase() !== this.parent.origen.toLowerCase();
      }
    ),
  fecha: yup
    .date()
    .typeError("La fecha debe ser válida")
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "No puedes seleccionar una fecha en el pasado"
    )
    .required("La fecha es obligatoria"),
  fechaRegreso: yup
    .date()
    .nullable()
    .typeError("La fecha de regreso debe ser válida")
    .test(
      "is-after-ida",
      "La fecha de regreso debe ser posterior a la fecha de ida",
      function(value) {
        if (!value) return true; // Si no hay fecha de regreso, está bien
        return value > this.parent.fecha;
      }
    ),
  tipoViaje: yup
    .string()
    .oneOf(["Hoy", "Mañana"], "Tipo de viaje no válido")
    .default("Hoy"),
});

// Esquema de validación para reserva de viaje
export const reservaViajeSchema = yup.object().shape({
  viajeId: yup
    .number()
    .positive("ID de viaje debe ser positivo")
    .required("El viaje es obligatorio"),
  asientosSeleccionados: yup
    .array()
    .of(yup.number().positive())
    .min(1, "Debes seleccionar al menos 1 asiento")
    .max(10, "Máximo 10 asientos por reserva")
    .required("Los asientos son obligatorios"),
  precioTotal: yup
    .number()
    .positive("El precio debe ser positivo")
    .required("El precio total es obligatorio"),
});

export default {
  loginSchema,
  registerSchema,
  userSchema,
  createUserSchema,
  changePasswordSchema,
  reservaSchema,
  searchViajeSchema,
  reservaViajeSchema,
};
