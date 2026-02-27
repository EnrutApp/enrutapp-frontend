# 📦 Adaptación de Validaciones: Usuarios → Contratos & Vehículos

## ✅ Trabajo Completado

Se han adaptado exitosamente los formularios de validación en tiempo real del módulo **Usuarios** a los módulos de **Contratos** y **Vehículos**, manteniendo la misma estructura, componentes reutilizables y patrón de validación.

---

## 📂 Archivos Creados

### 1. **Modal de Contratos**
**Ubicación:** `src/features/contratos/api/AddContratoModalWithValidation.jsx`

**Características:**
- ✅ Validación en tiempo real (onChange)
- ✅ Componentes de entrada restringida
- ✅ Campos: Línea, Fecha de Origen, Descripción
- ✅ Bloqueo de caracteres inválidos
- ✅ Integración con React Hook Form + Yup
- ✅ Modal reutilizable con props (isOpen, onClose, onConfirm)

**Campos:**
| Campo | Componente | Validación |
|-------|-----------|-----------|
| linea | LettersOnlyInput | Solo letras, min 2 caracteres |
| fechaOrigen | DateInput | Hoy hasta +1 año |
| descripcion | AlphanumericRestrictInput | Min 5 caracteres |

---

### 2. **Modal de Vehículos**
**Ubicación:** `src/features/vehiculos/api/AddVehiculoModalWithValidation.jsx`

**Características:**
- ✅ Validación en tiempo real (onChange)
- ✅ Componentes de entrada restringida
- ✅ Campos: Nombre, Placa, Marca, Año, Capacidad
- ✅ Bloqueo de caracteres inválidos
- ✅ Integración con React Hook Form + Yup
- ✅ Modal reutilizable con props

**Campos:**
| Campo | Componente | Validación |
|-------|-----------|-----------|
| nombreVehiculo | LettersOnlyInput | Solo letras |
| placa | AlphanumericRestrictInput | 3 letras + 3 números |
| marcaVehiculo | LettersOnlyInput | Solo letras |
| anioFabricacion | NumericOnlyInput | 4 dígitos |
| capacidadPasajeros | NumericOnlyInput | 1-100 pasajeros |

---

### 3. **Documentación**
**Ubicación:** `src/features/FORMULARIOS_CONTRATOS_VEHICULOS.md`

**Contenido:**
- 📋 Descripción general de ambos formularios
- 📌 Campos y validaciones de cada modal
- 🔌 Componentes usados
- 💻 Ejemplos de importación y uso
- 🔗 Integración paso a paso
- 🔄 Flujo de validación
- ⚙️ Personalización
- ⚠️ Errores comunes y soluciones
- 🔌 Endpoints de API esperados
- 📝 Próximos pasos

---

### 4. **Ejemplo de Integración**
**Ubicación:** `src/features/EJEMPLO_INTEGRACION_MODALES.jsx`

**Contenido:**
- 📌 Componente ejemplo con los 3 modales
- ✅ Estados y manejadores de eventos
- 📊 Listados de datos creados
- 💡 Instrucciones de adaptación
- 🎯 Código listo para copiar y pegar

---

## 🎯 Componentes Reutilizables Utilizados

### FormInputsRestricted.jsx
**Ubicación:** `src/features/usuarios/api/FormInputsRestricted.jsx`

Componentes disponibles para todos los módulos:
- ✅ `DocumentNumberInput` - 10 dígitos exactos
- ✅ `LettersOnlyInput` - Solo letras (con acentos)
- ✅ `PhoneNumberInput` - 10 dígitos con código país
- ✅ `AlphanumericRestrictInput` - Letras, números, #, -
- ✅ `NumericOnlyInput` - Solo números
- ✅ `EmailInput` - Formato email válido
- ✅ `SelectInput` - Selecciones de opciones
- ✅ `DateInput` - Rango de fechas (min=hoy, max=+1 año)

**Características Comunes:**
- 🚫 Bloquean caracteres inválidos en **onKeyPress**
- 🧹 Limpian caracteres que se cuelen en **onInput**
- ✔️ Validan paste/pegado en **onPaste**
- ⏱️ Mostrador de errores en tiempo real
- 🔗 Compatibles con react-hook-form `register()`

---

## 🎨 Conceptos Implementados

### 1. **Validación en Tiempo Real**
```javascript
// Todos los formularios usan:
mode: 'onChange'  // Valida mientras el usuario escribe
reValidateMode: 'onChange'
```

### 2. **Entrada Restringida a Nivel de Componente**
```javascript
// onKeyPress previene entrada
<input 
  onKeyPress={e => !/\d/.test(e.key) && e.preventDefault()}
/>
```

### 3. **Esquemas Reutilizables**
```javascript
// En usuariosValidationSchemas.js
export const contratoSchema = Yup.object({...})
export const vehiculoSchema = Yup.object({...})
```

### 4. **Modales Controlados**
```javascript
// Prop-based control
<AddContratoModalWithValidation
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={(data) => handleSuccess(data)}
/>
```

---

## 🚀 Cómo Usar

### Opción 1: En tu página actual (UsuariosPage, ContratosPage, etc.)

```jsx
import AddContratoModalWithValidation from '../../contratos/api/AddContratoModalWithValidation';
import { useState } from 'react';

function ContratosPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        + Crear Contrato
      </button>

      <AddContratoModalWithValidation
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={(data) => {
          console.log('Contrato creado:', data);
          // Refrescar lista, mostrar notificación, etc.
        }}
      />
    </>
  );
}
```

### Opción 2: Usar el ejemplo de integración

Copy-paste del archivo `EJEMPLO_INTEGRACION_MODALES.jsx` y personalizarlo.

---

## 📊 Comparativa: Antes vs Después

### ANTES (Sin entrada restringida)
```jsx
<input 
  type="text" 
  placeholder="Línea de transporte"
  // ❌ Usuario puede escribir números
  // ❌ Campo se ensucia en tiempo real
  // ❌ Validación solo al enviar o blur
/>
```

### DESPUÉS (Con entrada restringida)
```jsx
<LettersOnlyInput
  {...register('linea')}
  label="Línea de Transporte *"
  placeholder="Ej: La Tribu Transportes"
  error={errors.linea?.message}
  // ✅ Bloquea números al escribir
  // ✅ Campo limpio desde el inicio
  // ✅ Validación en tiempo real
/>
```

---

## 🔍 Flujo de Validación Detallado

```
1. Usuario escribe: "La123Tribu"
   ↓
2. onKeyPress: ¿"1"es letra? NO → preventDefault()
   ↓
3. Usuario ve: "LaTribu" (números bloqueados)
   ↓
4. onInput: Limpia caracteres que pasaron
   ↓
5. React Hook Form onChange: Ejecuta Yup schema
   ↓
6. Validaciones Yup:
   - .required() ✓
   - .min(2) ✓
   - .matches(/^[a-zA-Z...]/) ✓
   ↓
7. Error o éxito mostrado en tiempo real
   ↓
8. Button "Crear" se habilita cuando todo es válido
```

---

## 🛠️ Personalización

### Cambiar el formato de Placa
**Archivo:** `src/features/usuarios/api/usuariosValidationSchemas.js`

```javascript
// Cambiar de ABC123 a ABC-123
export const placaVehicularSchema = Yup.string()
  .required('La placa es obligatoria')
  .matches(
    /^[A-Z]{3}-\d{3}$/,  // Con guión
    'Formato: ABC-123'
  );
```

### Agregar más campos
**Archivo:** `src/features/contratos/api/AddContratoModalWithValidation.jsx`

```jsx
// 1. Agregar al schema Yup
export const contratoSchema = Yup.object({
  // ... campos existentes
  presupuesto: Yup.number().required().min(0),
});

// 2. Agregar input en renderización
<NumericOnlyInput
  {...register('presupuesto')}
  label="Presupuesto *"
  error={errors.presupuesto?.message}
/>

// 3. Incluir en POST
const contratoData = {
  linea: formData.linea,
  fechaOrigen: formData.fechaOrigen,
  descripcion: formData.descripcion,
  presupuesto: formData.presupuesto  // ← NUEVO
};
```

---

## ✨ Características Destacadas

✅ **Sin Dependencias Nuevas** - Usa solo React, React Hook Form, Yup (ya instalados)

✅ **Reutilizable** - Mismo código base para Usuarios, Contratos, Vehículos

✅ **Validación Multinivel:**
1. Entrada restringida (onKeyPress)
2. Limpieza automática (onInput)
3. Validación Yup (onChange)
4. Validación en servidor (POST)

✅ **UX Mejorada:**
- Errores en tiempo real
- Caracteres bloqueados automáticamente
- Retroalimentación visual inmediata
- Sin "sorpresas" al enviar

✅ **Fácil Integración:**
- Copy-paste de componentes
- Props simples y claras
- Callbacks para manejo de eventos

✅ **Mantenible:**
- Esquemas centralizados
- Componentes reutilizables
- Código bien documentado
- Ejemplos listos para usar

---

## 📋 Checklist de Integración

- [ ] Copiar `AddContratoModalWithValidation.jsx` a tu proyecto
- [ ] Copiar `AddVehiculoModalWithValidation.jsx` a tu proyecto
- [ ] Importar modals en páginas principales
- [ ] Agregar estado `useState` para abrir/cerrar
- [ ] Agregar botón "Crear" que abra el modal
- [ ] Implementar handler `onConfirm`
- [ ] Probar validaciones (escribir caracteres inválidos)
- [ ] Probar envío de datos (click en "Crear")
- [ ] Verificar que los datos llegan al servidor

---

## 🎓 Ejemplos de Uso

### Ejemplo 1: Modal de Contratos Mínimo
```jsx
const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>Nuevo Contrato</button>

<AddContratoModalWithValidation
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={(data) => console.log('Success:', data)}
/>
```

### Ejemplo 2: Modal de Vehículos con Refresh
```jsx
const [isOpen, setIsOpen] = useState(false);
const [vehiculos, setVehiculos] = useState([]);

const handleAddVehiculo = async (newVehiculo) => {
  setVehiculos([...vehiculos, newVehiculo]);
  setIsOpen(false);
  showNotification('Vehículo creado');
};

<AddVehiculoModalWithValidation
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleAddVehiculo}
/>
```

---

## 🆘 Soporte

**¿Problemas?**

1. **Importación falla:** Verifica rutas relativas
2. **Validación no funciona:** Asegúrate de usar componentes de FormInputsRestricted
3. **POST error:** Verifica endpoint y estructura de datos
4. **Componente no se abre:** Verifica prop `isOpen` y `onClose`

**Consulta archivos:**
- 📖 `FORMULARIOS_CONTRATOS_VEHICULOS.md`
- 💻 `EJEMPLO_INTEGRACION_MODALES.jsx`
- 🔧 `usuariosValidationSchemas.js`

---

## 📝 Arquivos Relacionados

```
src/features/
├── usuarios/
│   └── api/
│       ├── AddUserModalWithValidationReady.jsx
│       ├── FormInputsRestricted.jsx
│       └── usuariosValidationSchemas.js
├── contratos/
│   └── api/
│       └── AddContratoModalWithValidation.jsx  ← NUEVO
└── vehiculos/
    └── api/
        └── AddVehiculoModalWithValidation.jsx  ← NUEVO
```

---

**¡Listo para usar! 🚀**
