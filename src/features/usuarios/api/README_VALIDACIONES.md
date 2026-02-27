# 📋 Esquemas de Validación - Guía Completa

## 📦 Archivos Creados

Tu proyecto ahora contiene estos 4 nuevos archivos en `/src/features/usuarios/api/`:

1. **`usuariosValidationSchemas.js`** - Esquemas Yup listos para usar
2. **`validationIntegrationGuide.js`** - Guías de integración (código comentado)
3. **`AddUserModalExample.jsx`** - Ejemplo completo refactorizado
4. **`reusableFormComponents.jsx`** - Componentes reutilizables

---

## 🚀 Inicio Rápido

### Opción A: Migración Gradual (Recomendado si tu componente ya funciona)

```javascript
// En tu AddUserModal actual
import {
  usuarioStep1Schema,
  usuarioStep2Schema,
  usuarioStep3Schema,
  licenseSchema
} from './usuariosValidationSchemas';

const validateStepWithYup = async (step, data) => {
  try {
    let schema;
    switch (step) {
      case 1: schema = usuarioStep1Schema; break;
      case 2: schema = usuarioStep2Schema; break;
      case 3: schema = usuarioStep3Schema; break;
      case 4: schema = licenseSchema; break;
      default: return { isValid: true, errors: {} };
    }

    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach(e => {
      errors[e.path] = e.message;
    });
    return { isValid: false, errors };
  }
};
```

### Opción B: Usar Componentes Reutilizables

```javascript
// Para campos numéricos
import { NumericInput } from './reusableFormComponents';

<NumericInput
  {...register('numDocumento')}
  label="Número de Documento"
  error={errors.numDocumento?.message}
  maxLength="12"
/>

// Para campos de solo letras
import { LettersOnlyInput } from './reusableFormComponents';

<LettersOnlyInput
  {...register('nombre')}
  label="Nombre Completo"
  error={errors.nombre?.message}
/>

// Para campos de teléfono
import { PhoneInput } from './reusableFormComponents';

<PhoneInput
  {...register('telefono')}
  label="Teléfono"
  error={errors.telefono?.message}
  countryCode="+57"
/>
```

---

## 📝 Esquemas Disponibles

### Paso 1: Identificación y Acceso
```javascript
import { usuarioStep1Schema } from './usuariosValidationSchemas';

// Validaciones incluidas:
// ✓ tipoDoc: Requerido, selección obligatoria
// ✓ numDocumento: Solo números, exactamente 10 dígitos
// ✓ correo: Email válido con @ y dominio
```

### Paso 2: Datos Personales
```javascript
import { usuarioStep2Schema } from './usuariosValidationSchemas';

// Validaciones incluidas:
// ✓ nombre: Solo letras (sin números), mín 2 caracteres
// ✓ telefono: Solo números, 7-10 dígitos
// ✓ direccion: Alfanumérico + '#' y '-', mín 5 caracteres
// ✓ idCiudad: Selección obligatoria
```

### Paso 3: Roles
```javascript
import { usuarioStep3Schema } from './usuariosValidationSchemas';

// Validaciones incluidas:
// ✓ idRol: Selección obligatoria
```

### Paso 4: Licencia (Conductores)
```javascript
import { licenseSchema } from './usuariosValidationSchemas';

// Validaciones incluidas:
// ✓ idCategoriaLicencia: Selección obligatoria
// ✓ fechaVencimientoLicencia: Fecha del hoy a máximo 1 año
```

### Esquemas Globales (Para otros formularios)
```javascript
import {
  contratoSchema,
  vehiculoSchema,
  shortTextFieldSchema,
  futureOrPresentDateSchema,
  placaVehicularSchema,
  yearFieldSchema,
  phoneFieldSchema,
  numericOnlyFieldSchema,
  lettersOnlyFieldSchema,
  alphanumericFieldSchema
} from './usuariosValidationSchemas';
```

---

## 🔍 Reglas de Validación - Referencia Rápida

| Campo | Tipo | Validaciones | Error |
|-------|------|-------------|-------|
| **Número Documento** | Numérico | Solo números, exactamente 10 dígitos | "El documento debe tener exactamente 10 dígitos" |
| **Nombre** | Texto | Solo letras, mín 2 caracteres | "El nombre no debe contener números" |
| **Teléfono** | Numérico | Solo números, 7-10 dígitos | "Solo números permitidos" |
| **Dirección** | Alfanumérico | Letras, números, espacios, '#', '-' | "Dirección inválida" |
| **Email** | Email | Formato válido con '@' | "formato de correo inválido" |
| **Fecha Lic.** | Fecha | Hoy a máximo 1 año | "No puede ser pasada ni mayor a 1 año" |
| **Placa** | Especial | 3 letras mayús + 3 números | "Formato inválido - ABC123" |

---

## 📚 Funciones Validadoras Disponibles

```javascript
import {
  isNumericOnly,
  isLettersOnly,
  isAlphanumeric,
  isValidEmail,
  isDateInValidRange
} from './usuariosValidationSchemas';

// Uso directo en tu código
if (!isNumericOnly(value)) {
  console.error('Solo números permitido');
}

if (!isLettersOnly(value)) {
  console.error('Solo letras permitidas');
}

if (!isAlphanumeric(value)) {
  console.error('Alfanumérico inválido');
}

if (!isValidEmail(value)) {
  console.error('Email inválido');
}

if (!isDateInValidRange(dateValue)) {
  console.error('Fecha fuera de rango');
}
```

---

## 🎯 Casos de Uso por Tipo de Formulario

### Caso 1: Formulario de Usuarios (Multi-pasos)
```javascript
// Usa los esquemas paso a paso
import {
  usuarioStep1Schema,
  usuarioStep2Schema,
  usuarioStep3Schema,
  licenseSchema
} from './usuariosValidationSchemas';

// Valida cada paso por separado
const validateStep = (stepNumber, data) => {
  const schemas = {
    1: usuarioStep1Schema,
    2: usuarioStep2Schema,
    3: usuarioStep3Schema,
    4: licenseSchema
  };
  
  return schemas[stepNumber]?.validate(data);
};
```

### Caso 2: Formulario de Contratos
```javascript
import { contratoSchema } from './usuariosValidationSchemas';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(contratoSchema),
  mode: 'onBlur'
});
```

### Caso 3: Formulario de Vehículos
```javascript
import { vehiculoSchema } from './usuariosValidationSchemas';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(vehiculoSchema),
  mode: 'onBlur'
});
```

### Caso 4: Input Individual con Validación
```javascript
import { NumericInput } from './reusableFormComponents';

// En tu componente
<NumericInput
  label="Capacidad (pasajeros)"
  placeholder="Ej: 45"
  maxLength="3"
  onChange={(e) => handleCapacityChange(e)}
/>
```

---

## 🛠️ Componentes Listos para Usar

### 1. NumericInput
Solo permite números, bloquea letras automáticamente
```jsx
<NumericInput
  label="Número de Documento"
  placeholder="Ingresa números"
  maxLength="12"
  error={error}
/>
```

### 2. LettersOnlyInput
Solo permite letras y espacios, bloquea números automáticamente
```jsx
<LettersOnlyInput
  label="Nombre Completo"
  placeholder="Juan Pérez"
  error={error}
/>
```

### 3. AlphanumericInput
Permite letras, números, espacios, '#' y '-'
```jsx
<AlphanumericInput
  label="Dirección"
  placeholder="Calle 123 #45"
  error={error}
/>
```

### 4. PhoneInput
Entrada de teléfono con código de país
```jsx
<PhoneInput
  label="Teléfono"
  countryCode="+57"
  error={error}
/>
```

### 5. DateInput
Input de fecha con validación de rango (hoy a 1 año)
```jsx
<DateInput
  label="Fecha de Vencimiento"
  error={error}
/>
```

### 6. SelectField
Select con validación integrada
```jsx
<SelectField
  label="Selecciona Rol"
  options={roles}
  error={error}
/>
```

---

## 🎨 Hooks Personalizados para Validación en Tiempo Real

```javascript
import {
  useDocumentValidation,
  useNameValidation,
  usePhoneValidation,
  useDateValidation
} from './reusableFormComponents';

// En tu componente
const { error, validateDocument } = useDocumentValidation();

const handleChange = (e) => {
  validateDocument(e.target.value); // Valida en tiempo real
};
```

---

## ✅ Checklist de Implementación

- [ ] Importa los esquemas necesarios
- [ ] Reemplaza las validaciones manuales actuales
- [ ] Usa los componentes reutilizables donde sea posible
- [ ] Prueba cada paso del formulario
- [ ] Verifica los mensajes de error
- [ ] Prueba con datos inválidos
- [ ] Prueba con números en campos de texto
- [ ] Prueba con letras en campos numéricos
- [ ] Prueba fechas en rango válido/inválido
- [ ] Prueba selects vacíos

---

## 🐛 Troubleshooting

### Error: "Schema is not defined"
**Solución:** Importa correctamente desde el archivo
```javascript
import { usuarioStep1Schema } from './usuariosValidationSchemas';
```

### Error: "Validation is not a function"
**Solución:** Asegúrate de usar `.validate()` correctamente
```javascript
await schema.validate(data, { abortEarly: false });
```

### Campos numéricos aceptan lettras
**Solución:** Usa el componente `NumericInput` o agrega `inputMode="numeric"`
```jsx
<input inputMode="numeric" onKeyPress={e => {
  if (!/\d/.test(e.key)) e.preventDefault();
}} />
```

### Validación no se ejecuta
**Solución:** Asegúrate de usar el resolver correcto en React Hook Form
```javascript
const { register } = useForm({
  resolver: yupResolver(schema),
  mode: 'onBlur'
});
```

---

## 📞 Mensajes de Error Específicos

### Paso 1 (Identificación)
- "Selecciona un tipo de documento" → tipoDoc vacío
- "Solo se permiten números" → numDocumento contiene letras
- "El documento debe tener exactamente 10 dígitos" → numDocumento ≠ 10
- "formato de correo inválido - debe contener @ y dominio" → email sin @

### Paso 2 (Datos Personales)
- "El nombre no debe contener números" → nombre contiene números
- "Mínimo 2 caracteres" → texto muy corto
- "Solo números permitidos" → teléfono contiene letras
- "Mínimo 7 dígitos" → teléfono < 7
- "Máximo 10 dígitos" → teléfono > 10
- "Dirección inválida" → caracteres no permitidos

### Paso 4 (Licencia)
- "No puede ser pasada ni mayor a 1 año" → fecha fuera de rango

---

## 🔄 Integración con React Hook Form

### Configuración Recomendada
```javascript
const { register, handleSubmit, formState: { errors }, trigger } = useForm({
  resolver: yupResolver(currentSchema),
  mode: 'onBlur', // Valida al salir del campo
  reValidateMode: 'onChange', // Re-valida al cambiar
  shouldFocusError: true // Enfoca el primer error
});
```

### Validación Manual de Campo
```javascript
const handleFieldChange = async (e) => {
  const { name } = e.target;
  // Valida solo este campo
  await trigger(name);
};
```

---

## 📦 Dependencias Utilizadas

- **yup** - Validación de esquemas (ya instalado)
- **react-hook-form** - Manejo de formularios (ya instalado)
- **@hookform/resolvers** - Integración Yup + React Hook Form (ya instalado)

No necesitas instalar nada más ✅

---

## 💡 Tips Pro

1. **Validación en tiempo real sin lag:** Usa `mode: 'onBlur'` en lugar de `onChange`

2. **Bloquear submit hasta validar:** Usa `trigger()` antes de proceder
```javascript
const isValid = await trigger();
if (!isValid) return;
```

3. **Mensaje de error personalizado:**
```javascript
.test('custom', 'Tu mensaje aquí', (value) => {
  return value && value.length > 5;
})
```

4. **Validar múltiples campos:**
```javascript
const fieldsTrigger = await trigger(['nombre', 'telefono']);
```

5. **Reset de formulario:**
```javascript
const { reset } = useForm();
reset(); // Limpia todos los campos y errores
```

---

## 📖 Referencias de Yup

- [Documentación oficial Yup](https://github.com/jquense/yup)
- [Métodos de validación disponibles](https://github.com/jquense/yup#api)
- [Validadores personalizados](https://github.com/jquense/yup#customization)

---

**¡Listo! Tu sistema de validaciones está completo y listo para usar.** 🎉

Cualquier duda, revisa los archivos comentados o consulta los ejemplos en `validationIntegrationGuide.js`
