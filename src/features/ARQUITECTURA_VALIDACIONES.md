# 🏗️ Arquitectura de Validaciones - Diagrama

## 📐 Estructura General

```
src/features/
│
├── usuarios/
│   └── api/
│       ├── ✨ Componentes Base (Reutilibles)
│       ├── FormInputsRestricted.jsx ⭐ (8 componentes)
│       ├── usuariosValidationSchemas.js ⭐ (Schemas)
│       │
│       ├── 👥 Modal de Usuarios
│       └── AddUserModalWithValidationReady.jsx
│
├── contratos/
│   └── api/
│       └── 📄 Modal de Contratos (NUEVO)
│           └── AddContratoModalWithValidation.jsx
│               ├── Importa: FormInputsRestricted
│               └── Importa: contratoSchema
│
└── vehiculos/
    └── api/
        └── 🚌 Modal de Vehículos (NUEVO)
            └── AddVehiculoModalWithValidation.jsx
                ├── Importa: FormInputsRestricted
                └── Importa: vehiculoSchema
```

---

## 🔌 Dependencias y Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    BIBLIOTECAS EXTERNAS                     │
├─────────────────────────────────────────────────────────────┤
│ • React 19.2.0                                              │
│ • React Hook Form 7.66.0 (mode: 'onChange')                │
│ • Yup 1.7.1 (validaciones)                                 │
│ • @hookform/resolvers 5.2.2                                │
│ • Tailwind CSS 4.1.17 (estilos)                            │
└─────────────────────────────────────────────────────────────┘
                              △
                              │
                              │ usa
                              │
┌─────────────────────────────────────────────────────────────┐
│        CAPA BASE: Componentes Reutilizables                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FormInputsRestricted.jsx (8 componentes)                  │
│  ├── DocumentNumberInput ——→ 10 dígitos exactos            │
│  ├── LettersOnlyInput ——————→ Solo letras                  │
│  ├── NumericOnlyInput ——————→ Solo números                 │
│  ├── PhoneNumberInput ———→ 10 dígitos + código país       │
│  ├── AlphanumericRestrictInput → Letras, números, #, -    │
│  ├── EmailInput ——————————→ Formato email                 │
│  ├── SelectInput —————————→ Opciones (id, nombre)         │
│  └── DateInput ————————————→ Rango hoy a +1 año          │
│                                                             │
│  usuariosValidationSchemas.js (Schemas Yup)               │
│  ├── usuarioStep1/2/3Schema                               │
│  ├── licenseSchema                                         │
│  ├── contratoSchema                                        │
│  ├── vehiculoSchema                                        │
│  └── Helpers: alphanumeric, future/present date, etc.     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              △
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 │ usa        │ usa        │ usa
                 │            │            │
    ┌────────────▼──┐ ┌──────▼────────┐ ┌─▼──────────────┐
    │   USUARIOS    │ │  CONTRATOS   │ │  VEHÍCULOS    │
    ├───────────────┤ ├──────────────┤ ├───────────────┤
    │ AddUserModal  │ │ AddContrato   │ │ AddVehiculo   │
    │ WithValidation│ │ ModalWith     │ │ ModalWith     │
    │               │ │ Validation    │ │ Validation    │
    ├───────────────┤ ├──────────────┤ ├───────────────┤
    │ Componentes:  │ │ Componentes: │ │ Componentes: │
    │ • Document    │ │ • Letters    │ │ • Letters    │
    │ • Letters     │ │ • Alphanumeric│ │ • Alphanumeric
    │ • Phone       │ │ • Date       │ │ • NumericOnly│
    │ • Alphanum.   │ │              │ │              │
    │ • Select      │ │ Validaciones:│ │ Validaciones:│
    │ • Date        │ │ • contratoSch│ │ • vehiculoSch│
    │ • Email       │ │              │ │              │
    │               │ │ Endpoint:    │ │ Endpoint:    │
    │ Endpoint:     │ │ POST /cont.. │ │ POST /vehic. │
    │ POST /usuarios│ │              │ │              │
    └───────────────┘ └──────────────┘ └───────────────┘
```

---

## 🔄 Flujo de Validación Detallado

### 1. Usuario Escribe Carácter

```
Usuario: "abc123" en campo "nombreVehiculo"
         └─ LettersOnlyInput
            ├─ onKeyPress: ¿Es letra? "a" = SÍ ✓
            │            ¿Es letra? "1" = NO ✗ preventDefault()
            │
            ├─ onInput: Limpia /^\D/ → "abc"
            │
            └─ onChange (React Hook Form): Ejecuta Yup
               │
               └─ .matches(/^[a-zA-Z...]+$/, message)
                  │
                  ├─ VÁLIDO ✓ → Sin error
                  └─ INVÁLIDO ✗ → Muestra error
```

### 2. React Hook Form Workflow

```
Input onChange (componentDidChange)
        │
        ↓
React Hook Form onChange Handler
        │
        ├─→ register().onChange(event)
        │
        ├─→ setValue('fieldName', value)
        │
        └─→ Ejecuta Yup Schema si mode='onChange'
           │
           ├─→ ValidationSchemafunction(value)
           │
           ├─→ Comienza validación
           │   ├─ .required() → message?
           │   ├─ .min(n) → message?
           │   ├─ .matches() → message?
           │   └─ .test() → message?
           │
           └─→ setFormState({ errors })
              │
              └─→ Re-render con errors
                 │
                 └─→ Muestra <span>{errors.field?.message}</span>
```

---

## 🎯 Propiedades de Componentes

### Componentes de Entrada (FormInputsRestricted)

```typescript
interface InputComponentProps {
  // De react-hook-form
  ...register('fieldName'),
  
  // Props del componente
  label?: string,           // Etiqueta del campo
  placeholder?: string,     // Placeholder de help
  error?: string,          // Mensaje de error (desde Yup)
  className?: string,      // CSS personalizado (opcional)
  value?: string,          // Valor inicial (opcional)
  onChange?: Function,     // Handler adicional (opcional)
  
  // Específicos de algunos
  maxLength?: number,      // Para NumericOnlyInput
  options?: Array,         // Para SelectInput
  min?: date,              // Para DateInput
  max?: date               // Para DateInput
}
```

### Modales

```typescript
interface ModalProps {
  isOpen: boolean,         // Controla apertura/cierre
  onClose: () => void,     // Callback para cerrar
  onConfirm: (data) => void, // Callback con datos creados
  
  // Opcional
  isClientMode?: boolean,  // Para AddUserModal (3 vs 4 pasos)
}
```

---

## 📊 Matriz de Componentes por Modal

```
┌──────────────┬──────────────┬──────────────────┬──────────────┐
│  Componente  │  Usuarios    │  Contratos       │  Vehículos   │
├──────────────┼──────────────┼──────────────────┼──────────────┤
│ LettersOnly  │ ✓ nombre     │ ✓ linea          │ ✓ nombre     │
│              │              │                  │ ✓ marca      │
├──────────────┼──────────────┼──────────────────┼──────────────┤
│ NumericOnly  │              │                  │ ✓ año        │
│              │              │                  │ ✓ capacidad  │
├──────────────┼──────────────┼──────────────────┼──────────────┤
│ Phone        │ ✓ telefono   │                  │              │
├──────────────┼──────────────┼──────────────────┼──────────────┤
│ Document     │ ✓ documento  │                  │              │
├──────────────┼──────────────┼──────────────────┼──────────────┤
│ Email        │ ✓ correo     │                  │              │
├──────────────┼──────────────┼──────────────────┼──────────────┤
│Alphanumeric  │ ✓ dirección  │ ✓ descripción    │ ✓ placa      │
├──────────────┼──────────────┼──────────────────┼──────────────┤
│ Select       │ ✓ tipo, rol, │                  │              │
│              │   ciudad, cat │                  │              │
├──────────────┼──────────────┼──────────────────┼──────────────┤
│ Date         │ ✓ vencimient │ ✓ fechaOrigen    │              │
│              │   o          │                  │              │
└──────────────┴──────────────┴──────────────────┴──────────────┘
```

---

## 🔗 Flujo de Datos: Creación de Contrato

```
1. Usuario abre modal
   ↓
2. AddContratoModalWithValidation monta
   ├─ useForm() inicializa
   │  └─ resolver: yupResolver(contratoSchema)
   │
   ├─ useEffect(() => reset(), [isOpen])
   └─ Estado inicial: loading=false, error=null, success=false
   
3. Usuario ve 3 campos:
   ├─ LettersOnlyInput (linea)
   ├─ DateInput (fechaOrigen)
   └─ AlphanumericRestrictInput (descripcion)

4. Usuario escribe: "La Tribu" en linea
   ├─ onKeyPress: Bloquea caracteres no-letra
   ├─ onInput: Limpia errores previos
   └─ onChange (RHF): Ejecuta Yup
      └─ validación: min(2) ✓, matches(letter) ✓

5. Usuario selecciona fecha y descripción

6. Usuario clickea "Crear Contrato"
   ├─ handleSubmitContrato()
   ├─ setLoading(true)
   ├─ formData = getValues()
   │  └─ { linea: "...", fechaOrigen: "...", descripcion: "..." }
   │
   ├─ POST /contratos
   │  └─ Respuesta: { success: true, data: { ... } }
   │
   ├─ setSuccess(true)
   ├─ setTimeout(() => {
   │    onConfirm(response.data)
   │    onClose()
   ├─ Modal se cierra
   └─ PageComponent recibe datos vía onConfirm callback
```

---

## 📈 Escalabilidad

### Agregar Nuevo Modal (Ej: Rutas)

```
1. Crear schema en usuariosValidationSchemas.js
   
   export const rutaSchema = Yup.object({
     nombreRuta: Yup.string().required().min(2)...
     numeroRuta: Yup.string().required().matches(/^\d+$/)...
     descripcion: Yup.string().required()...
   })

2. Crear AddRutaModalWithValidation.jsx
   (Copiar estructura de AddContratoModal)

3. Usar en página
   
   <AddRutaModalWithValidation
     isOpen={isOpen}
     onClose={onClose}
     onConfirm={onConfirm}
   />
```

---

## 🎨 Personalización: Cambiar Componentes

### Cambiar de LettersOnlyInput a NumericOnlyInput

```javascript
// ANTES
<LettersOnlyInput
  {...register('nombreVehiculo')}
  label="Nombre del Vehículo *"
/>

// DESPUÉS
<NumericOnlyInput
  {...register('numeroVehiculo')}
  label="Número del Vehículo *"
/>
```

Automáticamente:
- ✅ Bloqueará letras
- ✅ Permitirá solo números
- ✅ Validará según schema

---

## 🔐 Capas de Seguridad

```
CAPA 1: onKeyPress
└─ Bloquea caracteres inválidos ANTES de entrar

CAPA 2: onInput  
└─ Limpia caracteres que se colaron

CAPA 3: Yup Schema (Frontend)
└─ Valida formato, longitud, patrón

CAPA 4: API Server
└─ Valida datos NUEVAMENTE + checks BD
```

---

## 📱 Responsividad

Todos los componentes usan Tailwind:
- `w-full` → 100% de ancho (responsive)
- `px-3 py-2` → Padding consistente
- `rounded` → Bordes redondeados
- `border` → Bordes visibles
- Soporte para mobile/tablet/desktop automático

---

## 🎓 Resumen de Arquitectura

```
BASE (Reutilizable)
├─ FormInputsRestricted.jsx (8 componentes)
├─ usuariosValidationSchemas.js (Schemas)
└─ Modal común (Modal.jsx del proyecto)

CAPA MEDIA (Módulo-específica)
├─ AddUserModalWithValidationReady.jsx
├─ AddContratoModalWithValidation.jsx
└─ AddVehiculoModalWithValidation.jsx

CAPA SUPERIOR (Integración)
├─ UsuariosPage.jsx
├─ ContratosPage.jsx
└─ VehiculosPage.jsx
```

---

## ✨ Características Emergentes

Al usar esta arquitectura obtienes automáticamente:

✅ **Validación Consistente** - Mismo nivel en todos los módulos  
✅ **UX Mejorada** - Bloqueo de caracteres inválidos  
✅ **Mantenibilidad** - Cambios en un lugar = cambios globales  
✅ **Escalabilidad** - Agregar nuevos módulos es trivial  
✅ **Testing** - Componentes testeables independientemente  
✅ **Accesibilidad** - Labels, errors, hints claros  
✅ **Performance** - onChange vs onBlur más eficiente  

---

**¡Arquitectura lista para producción! 🚀**
