# 🗂️ Comparativa de Modales: Usuarios → Contratos → Vehículos

## 📊 Tabla Comparativa Rápida

| Aspecto | Usuarios | Contratos | Vehículos |
|---------|----------|-----------|-----------|
| **Pasos** | 4 (multi-paso) | 1 (simple) | 1 (simple) |
| **Campos** | 11 | 3 | 5 |
| **Archivo** | AddUserModalWithValidationReady.jsx | AddContratoModalWithValidation.jsx | AddVehiculoModalWithValidation.jsx |
| **Schema** | usuarioStep1/2/3 + licenseSchema | contratoSchema | vehiculoSchema |
| **API POST** | /usuarios | /contratos | /vehiculos |
| **Complejidad** | ⭐⭐⭐⭐ Alta | ⭐⭐ Baja | ⭐⭐ Baja |

---

## 🔄 Estructura Compartida

Todos los modales siguen el mismo patrón:

```jsx
const AddXxxModalWithValidation = ({
  isOpen,          // boolean - controla apertura
  onClose,         // function - cierra modal
  onConfirm        // function - callback con datos
}) => {
  // 1. Estado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // 2. React Hook Form + Yup
  const { register, formState: { errors }, ... } = useForm({
    resolver: yupResolver(xxxSchema),
    mode: 'onChange'  // ← CLAVE: Validación en tiempo real
  });

  // 3. Manejadores
  const handleSubmit = async () => { /* POST a API */ };

  // 4. Renderización
  return <Modal>{ /* Inputs con error */ }</Modal>;
};
```

---

## 📋 Campos por Modal

### 1️⃣ USUARIOS (4 Pasos)
```
PASO 1: Identificación
├── tipoDoc (SelectInput)
├── numDocumento (DocumentNumberInput) → 10 dígitos
└── correo (EmailInput)

PASO 2: Datos Personales
├── nombre (LettersOnlyInput) → Solo letras
├── telefono (PhoneNumberInput) → 10 dígitos
├── direccion (AlphanumericRestrictInput) → Letras, números, #, -
└── idCiudad (SelectInput)

PASO 3: Rol
└── idRol (SelectInput)

PASO 4: Licencia (si conductor)
├── idCategoriaLicencia (SelectInput)
└── fechaVencimientoLicencia (DateInput) → Hoy a +1 año
```

### 2️⃣ CONTRATOS (1 Paso)
```
├── linea (LettersOnlyInput) → Solo letras, min 2
├── fechaOrigen (DateInput) → Hoy a +1 año
└── descripcion (AlphanumericRestrictInput) → Min 5 caracteres
```

### 3️⃣ VEHÍCULOS (1 Paso)
```
├── nombreVehiculo (LettersOnlyInput) → Solo letras
├── placa (AlphanumericRestrictInput) → ABC123 (3L + 3N)
├── marcaVehiculo (LettersOnlyInput) → Solo letras
├── anioFabricacion (NumericOnlyInput) → 4 dígitos
└── capacidadPasajeros (NumericOnlyInput) → 1-100
```

---

## 🎯 Componentes de Entrada por Modal

### Usuarios
```javascript
import {
  DocumentNumberInput,   // Para numDocumento
  LettersOnlyInput,      // Para nombre
  PhoneNumberInput,      // Para telefono
  AlphanumericRestrictInput, // Para direccion
  SelectInput,           // Para tipoDoc, idCiudad, idRol, etc.
  DateInput             // Para fechaVencimientoLicencia
} from './FormInputsRestricted';
```

### Contratos
```javascript
import {
  LettersOnlyInput,      // Para linea
  DateInput,             // Para fechaOrigen
  AlphanumericRestrictInput // Para descripcion
} from '../../usuarios/api/FormInputsRestricted';
```

### Vehículos
```javascript
import {
  LettersOnlyInput,      // Para nombreVehiculo, marcaVehiculo
  AlphanumericRestrictInput, // Para placa
  NumericOnlyInput       // Para anioFabricacion, capacidadPasajeros
} from '../../usuarios/api/FormInputsRestricted';
```

---

## 🔐 Validaciones Yup por Tipo

### Strings Solo Letras
```javascript
Yup.string()
  .required('Campo obligatorio')
  .min(2, 'Mínimo 2 caracteres')
  .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras')
```
**Usado en:** nombre, linea, marcaVehiculo

### Strings Alfanuméricos (especiales)
```javascript
Yup.string()
  .required('Campo obligatorio')
  .min(5, 'Mínimo caracteres')
  .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]+$/, 'Formato inválido')
```
**Usado en:** direccion, placa, descripcion

### Strings Solo Números
```javascript
Yup.string()
  .required('Campo obligatorio')
  .matches(/^\d{4}$/, 'Debe ser 4 dígitos')
```
**Usado en:** anioFabricacion, numDocumento, telefono, capacidadPasajeros

### Fechas
```javascript
Yup.date()
  .required('Campo obligatorio')
  .test('valid-date', 'Hoy a +1 año', function(value) {
    // Validar rango...
  })
```
**Usado en:** fechaOrigen, fechaVencimientoLicencia

---

## 🚀 Importación Según Módulo

### En Usuarios
```jsx
import AddUserModalWithValidation 
  from './AddUserModalWithValidationReady';
```

### En Contratos
```jsx
import AddContratoModalWithValidation 
  from './api/AddContratoModalWithValidation';
// o desde usuarios:
import AddContratoModalWithValidation 
  from '../../contratos/api/AddContratoModalWithValidation';
```

### En Vehículos
```jsx
import AddVehiculoModalWithValidation 
  from './api/AddVehiculoModalWithValidation';
// o desde usuarios:
import AddVehiculoModalWithValidation 
  from '../../vehiculos/api/AddVehiculoModalWithValidation';
```

---

## 🎪 Uso Simultáneo en una Página

```jsx
import AddUserModalWithValidation from '../../usuarios/api/AddUserModalWithValidationReady';
import AddContratoModalWithValidation from '../../contratos/api/AddContratoModalWithValidation';
import AddVehiculoModalWithValidation from '../../vehiculos/api/AddVehiculoModalWithValidation';

function AdminPage() {
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isContratoOpen, setIsContratoOpen] = useState(false);
  const [isVehiculoOpen, setIsVehiculoOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsUserOpen(true)}>+ Usuario</button>
      <button onClick={() => setIsContratoOpen(true)}>+ Contrato</button>
      <button onClick={() => setIsVehiculoOpen(true)}>+ Vehículo</button>

      <AddUserModalWithValidation
        isOpen={isUserOpen}
        onClose={() => setIsUserOpen(false)}
        onConfirm={(data) => handleUserCreated(data)}
      />

      <AddContratoModalWithValidation
        isOpen={isContratoOpen}
        onClose={() => setIsContratoOpen(false)}
        onConfirm={(data) => handleContratoCreated(data)}
      />

      <AddVehiculoModalWithValidation
        isOpen={isVehiculoOpen}
        onClose={() => setIsVehiculoOpen(false)}
        onConfirm={(data) => handleVehiculoCreated(data)}
      />
    </>
  );
}
```

---

## 🎨 Diferencias Clave

### Complejidad
```
Usuarios: ⭐⭐⭐⭐ (4 pasos, lógica conductor)
Contratos: ⭐⭐ (1 paso, campos simples)
Vehículos: ⭐⭐ (1 paso, validaciones numéricas)
```

### Cantidad de Campos
```
Usuarios: 11 campos distribuidos en 4 pasos
Contratos: 3 campos en 1 paso (simple)
Vehículos: 5 campos en 1 paso (simple)
```

### Lógica Condicional
```
Usuarios: ✓ Detecta "conductor" para mostrar paso 4
Contratos: ✗ Sin lógica condicional
Vehículos: ✗ Sin lógica condicional
```

### Endpoints API
```
Usuarios: POST /usuarios (+ check-document, check-email)
Contratos: POST /contratos
Vehículos: POST /vehiculos
```

---

## 📦 Archivo Schema Compartido

### Ubicación
```
src/features/usuarios/api/usuariosValidationSchemas.js
```

### Schemas Disponibles
```javascript
// Usuarios
export const usuarioStep1Schema
export const usuarioStep2Schema
export const usuarioStep3Schema
export const licenseSchema

// Contratos
export const contratoSchema

// Vehículos
export const vehiculoSchema

// Helpers reutilizables
export const alphanumericFieldSchema
export const futureOrPresentDateSchema
export const yearFieldSchema
export const placaVehicularSchema
export const phoneFieldSchema
export const numericOnlyFieldSchema
export const lettersOnlyFieldSchema
```

---

## ✅ Checklist: Lo que Necesitas Recordar

- [ ] Ruta de FormInputsRestricted: `src/features/usuarios/api/FormInputsRestricted.jsx`
- [ ] Ruta de Schemas: `src/features/usuarios/api/usuariosValidationSchemas.js`
- [ ] Todos usan: `mode: 'onChange'` (validación en tiempo real)
- [ ] Todos importan de `react-hook-form` y `yup`
- [ ] Los componentes de entrada bloquean caracteres inválidos
- [ ] Los modales aceptan props: isOpen, onClose, onConfirm
- [ ] Los callbacks en onConfirm reciben los datos creados

---

## 🔧 Extensión: Agregar Nuevo Modal

Si necesitas crear un modal para otro módulo (ej: Rutas, Turnos):

1. **Copia estructura** de `AddContratoModalWithValidation.jsx`
2. **Define schema** en `usuariosValidationSchemas.js`
3. **Selecciona componentes** de `FormInputsRestricted.jsx`
4. **Implementa handleSubmit** con tu endpoint
5. **Importa y usa** en tu página

```jsx
// 1. Crear schema
export const rutaSchema = Yup.object({
  nombreRuta: lettersOnlyFieldSchema,
  numeroRuta: numericOnlyFieldSchema,
  descripcion: alphanumericFieldSchema
});

// 2. Crear modal
const AddRutaModalWithValidation = ({ isOpen, onClose, onConfirm }) => {
  const { register, formState: { errors } } = useForm({
    resolver: yupResolver(rutaSchema),
    mode: 'onChange'
  });
  // ... resto del código

// 3. Usar en página
<AddRutaModalWithValidation
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={onConfirm}
/>
```

---

## 🎓 Conclusión

Todos los modales (Usuarios, Contratos, Vehículos) comparten:
- ✅ Mismo patrón de validación
- ✅ Mismos componentes de entrada restringida
- ✅ Misma estructura de formulario
- ✅ Validación en tiempo real (onChange)
- ✅ Bloqueo de caracteres inválidos

**Personalizaciones:**
- 📝 Diferentes esquemas Yup
- 🔄 Diferentes endpoints API
- 📊 Diferentes campos
- ⚙️ Lógica condicional adicional (ej: usuario conductor)

**Resultado:** Sistema consistente, mantenible y fácil de extender 🚀
