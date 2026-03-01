# 📋 Formularios de Contratos y Vehículos

## Descripción General

Se han creado formularios con validaciones en tiempo real para los módulos de **Contratos** y **Vehículos**, siguiendo el mismo patrón del formulario de Usuarios. Estos formularios utilizan:

- ✅ **React Hook Form** para gestión del formulario
- ✅ **Yup** para validaciones declarativas
- ✅ **Componentes de entrada restringida** que bloquean caracteres inválidos en tiempo real
- ✅ **Validación en modo `onChange`** (mientras el usuario escribe)

---

## 1. Modal de Contratos

### Ubicación
```
src/features/contratos/api/AddContratoModalWithValidation.jsx
```

### Campos
| Campo | Tipo | Validación |
|-------|------|-----------|
| `linea` | Texto | Solo letras, min 2 caracteres |
| `fechaOrigen` | Fecha | Hoy hasta +1 año |
| `descripcion` | Alfanumérico | Min 5 caracteres, permite # y - |

### Componentes Usados
- `LettersOnlyInput` - Para línea (solo letras)
- `DateInput` - Para fecha de origen
- `AlphanumericRestrictInput` - Para descripción

### Importación
```jsx
import AddContratoModalWithValidation from '../../contratos/api/AddContratoModalWithValidation';
```

### Uso en Componente
```jsx
const [isContratoModalOpen, setIsContratoModalOpen] = useState(false);

const handleAddContrato = (newContrato) => {
  console.log('Contrato creado:', newContrato);
  // Actualizar lista de contratos
  setContratos([...contratos, newContrato]);
};

return (
  <>
    <button 
      onClick={() => setIsContratoModalOpen(true)}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      + Crear Contrato
    </button>

    <AddContratoModalWithValidation
      isOpen={isContratoModalOpen}
      onClose={() => setIsContratoModalOpen(false)}
      onConfirm={handleAddContrato}
    />
  </>
);
```

---

## 2. Modal de Vehículos

### Ubicación
```
src/features/vehiculos/api/AddVehiculoModalWithValidation.jsx
```

### Campos
| Campo | Tipo | Validación |
|-------|------|-----------|
| `nombreVehiculo` | Texto | Solo letras, min 2 caracteres |
| `placa` | Alfanumérico | 3 letras + 3 números (ABC123) |
| `marcaVehiculo` | Texto | Solo letras |
| `anioFabricacion` | Número | 4 dígitos |
| `capacidadPasajeros` | Número | 1-100 pasajeros |

### Componentes Usados
- `LettersOnlyInput` - Para nombre y marca (solo letras)
- `NumericOnlyInput` - Para año y capacidad
- `AlphanumericRestrictInput` - Para placa

### Importación
```jsx
import AddVehiculoModalWithValidation from '../../vehiculos/api/AddVehiculoModalWithValidation';
```

### Uso en Componente
```jsx
const [isVehiculoModalOpen, setIsVehiculoModalOpen] = useState(false);

const handleAddVehiculo = (newVehiculo) => {
  console.log('Vehículo creado:', newVehiculo);
  // Actualizar lista de vehículos
  setVehiculos([...vehiculos, newVehiculo]);
};

return (
  <>
    <button 
      onClick={() => setIsVehiculoModalOpen(true)}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      + Crear Vehículo
    </button>

    <AddVehiculoModalWithValidation
      isOpen={isVehiculoModalOpen}
      onClose={() => setIsVehiculoModalOpen(false)}
      onConfirm={handleAddVehiculo}
    />
  </>
);
```

---

## 3. Esquemas de Validación

Los esquemas Yup se encuentran en:
```
src/features/usuarios/api/usuariosValidationSchemas.js
```

### Esquema de Contrato
```javascript
export const contratoSchema = Yup.object({
  linea: Yup.string()
    .required('La línea es obligatoria')
    .min(2, 'Mínimo 2 caracteres'),

  fechaOrigen: futureOrPresentDateSchema, // Hoy a +1 año

  descripcion: Yup.string()
    .required('La descripción es obligatoria')
    .min(5, 'Mínimo 5 caracteres'),
});
```

### Esquema de Vehículo
```javascript
export const vehiculoSchema = Yup.object({
  nombreVehiculo: Yup.string()
    .required('El nombre del vehículo es obligatorio')
    .min(2, 'Mínimo 2 caracteres'),

  placa: placaVehicularSchema, // ABC123 (3 letras + 3 números)

  marcaVehiculo: Yup.string()
    .required('La marca es obligatoria')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras permitidas'),

  anioFabricacion: yearFieldSchema, // 4 dígitos

  capacidadPasajeros: Yup.string()
    .required('Capacidad es obligatoria')
    .matches(/^\d+$/, 'Solo números permitidos')
    .test('valid-number', 'Capacidad debe ser entre 1 y 100', value => {
      if (!value) return false;
      const num = parseInt(value);
      return num >= 1 && num <= 100;
    }),
});
```

---

## 4. Componentes de Entrada Restringida

Ubicación: `src/features/usuarios/api/FormInputsRestricted.jsx`

### Componentes Disponibles
- **DocumentNumberInput** - Exactamente 10 dígitos
- **LettersOnlyInput** - Solo letras (con acentos)
- **PhoneNumberInput** - 10 dígitos
- **AlphanumericRestrictInput** - Letras, números, espacios, #, -
- **NumericOnlyInput** - Solo números
- **EmailInput** - Formato de email
- **SelectInput** - Selecciones de opciones
- **DateInput** - Rango de fechas (min=hoy, max=+1 año)

### Características
✅ Bloquean caracteres inválidos **al escribir** (onKeyPress)  
✅ Limpian automáticamente caracteres que se cuelen (onInput)  
✅ Validan pega/paste (onPaste)  
✅ Mostrador de error en tiempo real  
✅ Compatibles con react-hook-form register()  

---

## 5. Integración Paso a Paso

### Paso 1: Importar el Modal
```jsx
import AddContratoModalWithValidation from '../../contratos/api/AddContratoModalWithValidation';
```

### Paso 2: Estado del Modal
```jsx
const [isOpen, setIsOpen] = useState(false);
```

### Paso 3: Botón para Abrir
```jsx
<button onClick={() => setIsOpen(true)}>+ Crear</button>
```

### Paso 4: Modal Controlado
```jsx
<AddContratoModalWithValidation
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={(data) => {
    // Handle success
    console.log('Datos creados:', data);
  }}
/>
```

---

## 6. Flujo de Validación

```
1. Usuario escribe en campo
   ↓
2. onKeyPress: Bloquea caracteres inválidos
   ↓
3. onInput: Limpia caracteres que se colaron
   ↓
4. React Hook Form onChange: Ejecuta Yup schema
   ↓
5. Muestra error en tiempo real (si aplica)
   ↓
6. Usuario completa validaciones ✓
   ↓
7. Botón "Crear" habilitado
   ↓
8. Al hacer click: POST a API
```

---

## 7. Personalización

### Cambiar Validación de Placa
Si necesitas otro formato para placa (ej: ABC-123 con guión):

**En `usuariosValidationSchemas.js`:**
```javascript
export const placaVehicularSchema = Yup.string()
  .required('La placa es obligatoria')
  .matches(
    /^[A-Z]{3}-\d{3}$/,  // Con guión
    'Formato inválido - debe ser ABC-123'
  );
```

### Cambiar Rango de Fechas
Si contratos pueden ser por más de 1 año:

**En `AddContratoModalWithValidation.jsx`:**
```jsx
// Cambiar fechaOrigen a un schema personalizado
const customDateSchema = Yup.date()
  .required('La fecha es obligatoria')
  .min(new Date(), 'No puede ser pasada')
  .max(new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 'Máximo 2 años');
```

---

## 8. Errores Comunes

### Error: "Cannot find module"
✅ **Solución:** Verificar rutas de importación (usar paths relativos correctos)

### Error: "ValidationError: placa must be a string"
✅ **Solución:** Asegurar que el input tiene `{...register('placa')}` correctamente

### El input no bloquea caracteres
✅ **Solución:** Verificar que está usando componente de FormInputsRestricted, no `<input>` nativo

---

## 9. API Endpoints Esperados

### Contratos
```javascript
POST /contratos
Body: {
  linea: string,
  fechaOrigen: date,
  descripcion: string
}
```

### Vehículos
```javascript
POST /vehiculos
Body: {
  nombreVehiculo: string,
  placa: string,
  marcaVehiculo: string,
  anioFabricacion: string (4 dígitos),
  capacidadPasajeros: number
}
```

---

## 10. Próximos Pasos

- [ ] Crear modales de edición (UpdateContratoModal, UpdateVehiculoModal)
- [ ] Agregar confirmación de eliminación
- [ ] Integrar con listados (ContratoPageList, VehiculoPageList)
- [ ] Agregar validaciones de duplicados en servidor
- [ ] Implementar búsqueda y filtros
- [ ] Agregar paginación si es necesario
