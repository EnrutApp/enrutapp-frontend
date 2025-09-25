import * as yup from "yup";

// Esquema de validación para login
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Debe ser un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
  password: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es obligatoria"),
});

// Esquema de validación para registro
export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .required("El nombre es obligatorio"),
  email: yup
    .string()
    .email("Debe ser un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial"
    )
    .required("La contraseña es obligatoria"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Las contraseñas deben coincidir")
    .required("Confirmar contraseña es obligatorio"),
  documentNumber: yup
    .string()
    .min(6, "El número de documento debe tener al menos 6 caracteres")
    .required("El número de documento es obligatorio"),
  phone: yup
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .required("El teléfono es obligatorio"),
  address: yup
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .required("La dirección es obligatoria"),
  city: yup
    .string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .required("La ciudad es obligatoria"),
  roleId: yup.string().required("Debe seleccionar un rol"),
  documentType: yup.string().required("Debe seleccionar un tipo de documento"),
});

// Esquema de validación para crear/actualizar usuario
export const userSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .required("El nombre es obligatorio"),
  email: yup
    .string()
    .email("Debe ser un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
  documentNumber: yup
    .string()
    .min(6, "El número de documento debe tener al menos 6 caracteres")
    .required("El número de documento es obligatorio"),
  phone: yup
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .required("El teléfono es obligatorio"),
  address: yup
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .required("La dirección es obligatoria"),
  city: yup
    .string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .required("La ciudad es obligatoria"),
  roleId: yup.string().required("Debe seleccionar un rol"),
  documentType: yup.string().required("Debe seleccionar un tipo de documento"),
});

// Esquema de validación para crear usuario (incluye contraseña)
export const createUserSchema = userSchema.shape({
  password: yup
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial"
    )
    .required("La contraseña es obligatoria"),
});

// Esquema de validación para cambio de contraseña
export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required("La contraseña actual es obligatoria"),
  newPassword: yup
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial"
    )
    .notOneOf(
      [yup.ref("currentPassword")],
      "La nueva contraseña debe ser diferente a la actual"
    )
    .required("La nueva contraseña es obligatoria"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword"), null], "Las contraseñas deben coincidir")
    .required("Confirmar nueva contraseña es obligatorio"),
});

export default {
  loginSchema,
  registerSchema,
  userSchema,
  createUserSchema,
  changePasswordSchema,
};
