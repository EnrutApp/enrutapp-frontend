# 📋 Esquemas de Validación - SUMARIO EJECUTIVO

## ✅ ¿Qué Se Ha Creado?

Se han creado **5 archivos nuevos** en `/src/features/usuarios/api/` con un sistema completo de validaciones Yup para tu formulario multi-pasos de usuarios:

### 📁 Archivos Creados

1. **`usuariosValidationSchemas.js`** ⭐
   - Esquemas Yup listos para usar
   - Validadores reutilizables
   - Esquemas globales para otros formularios

2. **`validationIntegrationGuide.js`** 📚
   - Guías de integración con código comentado
   - 4 opciones de implementación
   - Ejemplos paso a paso

3. **`AddUserModalExample.jsx`** 💡
   - Ejemplo refactorizado completo
   - Opción A: Migración gradual
   - Opción B: Full React Hook Form

4. **`reusableFormComponents.jsx`** 🧩
   - 8 componentes reutilizables
   - 4 hooks personalizados
   - Estilos CSS/Tailwind

5. **`AddUserModalWithValidationReady.jsx`** 🚀
   - Componente listo para copiar y pegar
   - Completamente funcional
   - Integración total con React Hook Form

6. **`README_VALIDACIONES.md`** 📖
   - Documentación completa
   - Referencia rápida
   - Checklist de implementación

---

## 🎯 Inicio Ultra Rápido

### Opción 1: Copiar y Pegar (3 minutos)
```javascript
// Importa el componente completamente funcional
import AddUserModalWithValidation from './usuariosValidationSchemas/AddUserModalWithValidationReady';

// Úsalo directamente en tu app
<AddUserModalWithValidation 
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={onConfirm}
/>
```

### Opción 2: Integración Gradual (10 minutos)
```javascript
// En tu AddUserModal actual
import {
  usuarioStep1Schema,
  usuarioStep2Schema,
  usuarioStep3Schema,
  licenseSchema
} from './usuariosValidationSchemas';

// Reemplaza validateStep con esto:
const validateStepWithYup = async (step, data) => {
  try {
    const schemas = {
      1: usuarioStep1Schema,
      2: usuarioStep2Schema,
      3: usuarioStep3Schema,
      4: licenseSchema
    };

    await schemas[step].validate(data, { abortEarly: false });
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

### Opción 3: Componentes Individuales (5 minutos por campo)
```javascript
import {
  NumericInput,
  LettersOnlyInput,
  PhoneInput
} from './reusableFormComponents';

// USA EN TU JSX:
<NumericInput
  {...register('numDocumento')}
  label="Número de Documento"
  error={errors.numDocumento?.message}
  maxLength="12"
/>
```

---

## 📊 Validaciones por Campo

| Campo | Tipo | Reglas | Mensajes |
|-------|------|--------|----------|
| **Número Doc** | Numérico | Solo números, exactamente 10 dígitos | "El documento debe tener exactamente 10 dígitos" |
| **Nombre** | Texto | Solo letras, mín 2 chars | "El nombre no debe contener números" |
| **Teléfono** | Numérico | Solo números, 7-10 dígitos | "Solo números permitidos" |
| **Dirección** | Alfanumérico | Letras + números + # - | "Dirección inválida" |
| **Email** | Email | Debe contener @ y dominio | "formato de correo inválido" |
| **Fecha Lic** | Fecha | Hoy a máximo 1 año | "No puede ser pasada ni mayor a 1 año" |

---

## 🚀 ¿Cómo Empezar?

### Paso 1: Revisa el componente listo para usar
Abre: `AddUserModalWithValidationReady.jsx`
- Tiene TODO implementado
- Solo cópialo y adáptalo

### Paso 2: Entiende los esquemas
Abre: `usuariosValidationSchemas.js`
- Aquí están todas las reglas de validación
- Puedes personalizarlas fácilmente

### Paso 3: Usa los componentes
Abre: `reusableFormComponents.jsx`
- 8 componentes listos para usar
- Bloquean entrada de forma automática

### Paso 4: Consulta la documentación
Lee: `README_VALIDACIONES.md`
- Guía completa
- Troubleshooting
- Tips Pro

---

## 💻 Ejemplo Mínimo Funcional

```javascript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { usuarioStep1Schema } from './usuariosValidationSchemas';

function MyForm() {
  const { register, formState: { errors }, handleSubmit } = useForm({
    resolver: yupResolver(usuarioStep1Schema),
    mode: 'onBlur'
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('numDocumento')} type="text" inputMode="numeric" />
      {errors.numDocumento && <p>{errors.numDocumento.message}</p>}
      
      <button type="submit">Enviar</button>
    </form>
  );
}
```

---

## ✨ Características Principales

✅ **Validaciones Estrictas**
- Bloquea números en campos de texto
- Bloquea letras en campos numéricos
- Valida formato de email
- Valida rangos de fecha

✅ **Mensajes Personalizados**
- Específicos para cada regla
- Claros y orientados al usuario
- En español

✅ **Multi-Paso**
- Paso 1: Identificación
- Paso 2: Datos Personales
- Paso 3: Rol
- Paso 4: Licencia (solo conductores)

✅ **Reutilizable**
- Esquemas para contratos
- Esquemas para vehículos
- Esquemas genéricos de campos

✅ **Sin Dependencies Nuevas**
- Yup ✓ ya está instalado
- React Hook Form ✓ ya está instalado
- @hookform/resolvers ✓ ya está instalado

---

## 📋 Checklist de Implementación

Elige tu ruta:

### Ruta A: Copiar y Pegar (Rápido)
- [ ] Abre `AddUserModalWithValidationReady.jsx`
- [ ] Cópialo a tu proyecto
- [ ] Importa los esquemas
- [ ] Reemplaza en tu componente
- [ ] Prueba

### Ruta B: Integración Gradual (Seguro)
- [ ] Importa los esquemas en tu AddUserModal actual
- [ ] Reemplaza tu `validateStep` con la versión Yup
- [ ] Prueba cada paso
- [ ] Gradualmente añade componentes reutilizables

### Ruta C: Componentes Individuales (Flexible)
- [ ] Identifica qué campos necesitan validación
- [ ] Importa el componente correspondiente
- [ ] Reemplaza el input existente
- [ ] Adapta los estilos si es necesario
- [ ] Prueba

---

## 🎨 Componentes Disponibles Reutilizables

```javascript
// Solo números
<NumericInput label="Documento" maxLength="12" />

// Solo letras
<LettersOnlyInput label="Nombre" />

// Teléfono con código país
<PhoneInput label="Teléfono" countryCode="+57" />

// Alfanumérico (letras + números + # -)
<AlphanumericInput label="Dirección" />

// Fecha con validación de rango
<DateInput label="Fecha Vencimiento" />

// Select validado
<SelectField label="Rol" options={roles} />
```

---

## 🔍 Validadores Personalizados

```javascript
import {
  isNumericOnly,        // Valida solo números
  isLettersOnly,        // Valida solo letras
  isAlphanumeric,       // Valida alfanumérico
  isValidEmail,         // Valida email
  isDateInValidRange    // Valida fecha en rango
} from './usuariosValidationSchemas';

// Uso
if (!isNumericOnly(value)) alert('Solo números');
```

---

## 📞 Hooks Personalizados

```javascript
import {
  useDocumentValidation,    // Para validar documento
  useNameValidation,        // Para validar nombre
  usePhoneValidation,       // Para validar teléfono
  useDateValidation         // Para validar fecha
} from './reusableFormComponents';

// Uso
const { error, validateDocument } = useDocumentValidation();
```

---

## 🆘 Errores Comunes y Soluciones

**Error: "Schema is not defined"**
```javascript
// ✗ Incorrecto
import { Schema } from './schemas';

// ✓ Correcto
import { usuarioStep1Schema } from './usuariosValidationSchemas';
```

**Los números se siguen aceptando en campos de texto**
```javascript
// ✓ Usa NumericInput solo para números o:
<input 
  {...register('nombre')}
  onKeyPress={e => {
    if (!/[a-zA-Z\s]/.test(e.key)) e.preventDefault();
  }}
/>
```

**Validación no se ejecuta**
```javascript
// ✓ Asegúrate de usar el resolver
const { register } = useForm({
  resolver: yupResolver(schema),  // ← Esto es obligatorio
  mode: 'onBlur'
});
```

---

## 📚 Archivos Clave para Referencia

| Archivo | Debes Ver Si... |
|---------|-----------------|
| `usuariosValidationSchemas.js` | Quieres entender las reglas de validación |
| `validationIntegrationGuide.js` | Necesitas opciones de integración |
| `AddUserModalWithValidationReady.jsx` | Quieres un componente listo para copiar |
| `reusableFormComponents.jsx` | Necesitas componentes de inputs especializados |
| `README_VALIDACIONES.md` | Necesitas documentación detallada |

---

## 🎯 Caso de Uso: Formulario Completo

```javascript
// 1. Importa el componente listo
import AddUserModalWithValidation from './AddUserModalWithValidationReady';

// 2. Úsalo en tu componente principal
export function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Añadir Usuario</button>
      
      <AddUserModalWithValidation
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={(user) => console.log('Usuario creado:', user)}
      />
    </>
  );
}
```

---

## 🏆 Características Implementadas

✅ Validación estricta de números (bloquea letras)
✅ Validación estricta de texto (bloquea números)  
✅ Validación de email con @
✅ Validación de rangos de fecha (hoy ± 1 año)
✅ Mensajes de error específicos y en español
✅ Componentes reutilizables
✅ Hooks personalizados
✅ Totalmente compatible con React Hook Form + Yup
✅ Sin dependencias nuevas
✅ Código comentado y documentado

---

## 💡 Tips Pro

1. **Usa `trigger()` para validar antes de avanzar**
   ```javascript
   const isValid = await trigger();
   if (!isValid) return;
   ```

2. **Usa `mode: 'onBlur'` para mejor performance**
   ```javascript
   const { register } = useForm({
     mode: 'onBlur', // Valida al salir del campo
   });
   ```

3. **Personaliza mensajes en los esquemas**
   ```javascript
   numDocumento: Yup.string()
     .required('Tu mensaje aquí')
     .matches(/^\d+$/, 'Tu error aquí')
   ```

---

## 👉 ¿Siguiente Paso?

1. **Lee 5 minutos**: `README_VALIDACIONES.md`
2. **Abre el ejemplo**: `AddUserModalWithValidationReady.jsx`
3. **Copia y adapta** a tu proyecto
4. **Consulta** la guía cuando necesites

¡Listo para usar! 🎉

---

**¿Dudas?** Revisa los archivos con código comentado:
- `validationIntegrationGuide.js` - Explica cada opción
- `reusableFormComponents.jsx` - Ejemplos de uso
- `README_VALIDACIONES.md` - Referencia completa
