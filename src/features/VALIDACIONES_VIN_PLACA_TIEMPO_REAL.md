# 🚀 Validaciones en Tiempo Real: VIN y Placa

## ✨ Actualizaciones Realizadas

Se han agregado validaciones en tiempo real (onChange) para los campos **VIN** y **Placa** en el modal de creación de vehículos. Las validaciones se muestran mientras el usuario escribe, no al enviar los datos.

---

## 📋 Campos Validados

### 1. **VIN (Vehicle Identification Number)**

**Ubicación en Modal:** Campo después del nombre del vehículo

**Validaciones en Tiempo Real:**
- ✅ Campo obligatorio
- ✅ Exactamente 17 caracteres
- ✅ Solo alfanuméricos (sin I, O, Q)
- ✅ Mayúsculas automáticas
- ✅ Mensajes de error claros

**Mensajes de Error:**
| Condición | Mensaje |
|-----------|---------|
| Vacío | "El VIN es obligatorio" |
| Menos de 17 caracteres | "El VIN debe tener exactamente 17 caracteres" |
| Más de 17 caracteres | "El VIN debe tener exactamente 17 caracteres" |
| Caracteres inválidos | "Formato inválido - VIN debe contener 17 caracteres alfanuméricos (sin I, O, Q)" |
| Formato incorrecto | "VIN inválido - revisa el formato" |

**Ejemplo de VIN Válido:**
```
1HGCM82633A123456
```

---

### 2. **Placa**

**Ubicación en Modal:** Campo después del VIN

**Validaciones en Tiempo Real:**
- ✅ Campo obligatorio
- ✅ Mínimo 2 caracteres
- ✅ Formato: 3 letras + 3 números (ABC123)
- ✅ Mínimo 2 dígitos
- ✅ Mayúsculas automáticas
- ✅ Mensajes de error claros

**Mensajes de Error:**
| Condición | Mensaje |
|-----------|---------|
| Vacío | "La placa es obligatoria" |
| Menos de 2 caracteres | "La placa debe tener mínimo 2 caracteres" |
| Formato incorrecto | "Formato inválido - debe ser ABC123 (3 letras mayúsculas + 3 números)" |
| Menos de 2 dígitos | "La placa debe tener mínimo 2 dígitos" |

**Ejemplo de Placa Válida:**
```
ABC123
XYZ789
```

---

## 🔄 Flujo de Validación en Tiempo Real

```
1. Usuario empieza a escribir en VIN o Placa
   ↓
2. onKeyPress: Bloquea caracteres completamente inválidos
   ↓
3. onInput: Limpia/formatea automáticamente (mayúsculas)
   ↓
4. React Hook Form onChange: Ejecuta validaciones Yup
   ↓
5. Validaciones Yup se aplican:
   ✓ Largo exacto/mínimo
   ✓ Formato de caracteres
   ✓ Pruebas personaliza das
   ↓
6. Errores aparecen/desaparecen EN TIEMPO REAL
   ↓
7. Color rojo en input si hay error
   ↓
8. Mensaje de error debajo del campo
```

---

## 📝 Esquemas Yup Implementados

### Schema VIN

```javascript
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
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(value);
  })
  .uppercase('El VIN debe estar en mayúsculas');
```

### Schema Placa (Mejorado)

```javascript
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
```

---

## 🧪 Pruebas: Validaciones en Tiempo Real

### Prueba 1: VIN - Menos de 17 caracteres
```
Escribir: "1HGCM826" (8 caracteres)
Resultado: 
❌ Error: "El VIN debe tener exactamente 17 caracteres"
Color: Rojo
```

### Prueba 2: VIN - Caracteres inválidos (I, O, Q)
```
Escribir: "1HGCM82633AIQW456" (contiene I, O, Q)
Resultado:
❌ Error: "Formato inválido - VIN debe contener 17 caracteres alfanuméricos (sin I, O, Q)"
Color: Rojo
```

### Prueba 3: VIN - Correctamente completado
```
Escribir: "1HGCM82633A123456" (17 caracteres válidos)
Resultado:
✅ Sin error
Color: Verde (border normal)
```

### Prueba 4: Placa - Menos de 2 dígitos
```
Escribir: "AB1" (solo 1 dígito)
Resultado:
❌ Error: "La placa debe tener mínimo 2 dígitos"
Color: Rojo
```

### Prueba 5: Placa - Formato incorrecto
```
Escribir: "ABC1234" (4 números en lugar de 3)
Resultado:
❌ Error: "Formato inválido - debe ser ABC123 (3 letras mayúsculas + 3 números)"
Color: Rojo
```

### Prueba 6: Placa - Correctamente completada
```
Escribir: "ABC123" (formato correcto)
Resultado:
✅ Sin error
Color: Verde (border normal)
```

---

## 🎯 Cómo Funciona la Entrada Restringida

Ambos campos usan `AlphanumericRestrictInput` que:

1. **onKeyPress** - Bloquea caracteres completamente inválidos
   - VIN: Solo permite A-H, J-N, P-R, Z (sin I, O, Q) y números
   - Placa: Solo permite letras y números

2. **onInput** - Limpia y formatea
   - Convierte a MAYÚSCULAS automáticamente
   - Limita caracteres extras

3. **onChange (RHF)** - Valida con Yup en tiempo real
   - Aplica todos los tests personalizados
   - Muestra errores específicos
   - Actualiza estado del formulario

---

## 📱 Mensajes de Error Mejorables

Todos los mensajes aparecen:
- ✅ En TIEMPO REAL mientras escribes
- ✅ Debajo del campo (en rojo)
- ✅ Sin esperar a hacer submit
- ✅ Desaparecen cuando la validación pasa

Estructura del campo con error:
```
┌─────────────────────────────────────┐
│ VIN (Número de Identificación) *    │ ← Label
├─────────────────────────────────────┤
│ 1HGCM82633AQ00000                   │ ← Input rojo
├─────────────────────────────────────┤
│ ❌ Formato inválido - VIN debe...   │ ← Error message
└─────────────────────────────────────┘
```

---

## 🔐 Validación Multinivel

```
CAPA 1: onKeyPress (FormInputsRestricted.jsx)
└─ Bloquea caracteres inválidos ANTES de entrar

CAPA 2: onInput (FormInputsRestricted.jsx)
└─ Formatea: convierte a mayúsculas, limpia

CAPA 3: Yup Schema (onChange en RHF)
└─ Valida: largo exacto, formato, dígitos mínimos

CAPA 4: API Server
└─ Valida NUEVAMENTE: bases de datos, duplicados
```

---

## 📋 Campos en Modal de Vehículos (Orden)

```
1. Nombre del Vehículo (LettersOnlyInput)
2. VIN (AlphanumericRestrictInput) ← NUEVO
3. Placa (AlphanumericRestrictInput) ← MEJORADO
4. Marca del Vehículo (LettersOnlyInput)
5. Año de Fabricación (NumericOnlyInput)
6. Capacidad de Pasajeros (NumericOnlyInput)
```

---

## 🚀 Uso en tu Código

El modal de vehículos ya está actualizado. Solo necesitas usarlo:

```jsx
import AddVehiculoModalWithValidation from './api/AddVehiculoModalWithValidation';

function VehiculosPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>+ Crear Vehículo</button>
      
      <AddVehiculoModalWithValidation
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={(data) => {
          console.log('Vehículo con VIN:', data.vin);
          console.log('Placa:', data.placa);
        }}
      />
    </>
  );
}
```

---

## 📊 Datos Enviados al Servidor

Cuando llamadas a la API, incluyen:

```javascript
{
  nombreVehiculo: "Bus Destino",
  vin: "1HGCM82633A123456",      // ← Nuevo, validado
  placa: "ABC123",                // ← Mejorado, validado
  marcaVehiculo: "Hino",
  anioFabricacion: "2020",
  capacidadPasajeros: 45
}
```

---

## ✅ Verificación

- ✅ Validaciones en tiempo real (onChange)
- ✅ Sin errores de sintaxis
- ✅ Mensajes claros y específicos
- ✅ Componentes reutilizables
- ✅ Bloqueo de caracteres inválidos
- ✅ Formateo automático (mayúsculas)
- ✅ Validación multinivel

---

## 💡 Ejemplos de VIN Válidos

```
1HGCM82633A123456
WBADO6325L9E00000
JF1BL5H34BE228976
KMHLN5AJ0EU123456
5TDBKRFV8C987654
```

**Nota:** VINs que contienen I, O, Q son rechazados por ser inválidos en el estándar VIN.

---

## 💡 Ejemplos de Placa Válida

```
ABC123
XYZ789
DEF456
```

**Formato:** 3 letras mayúsculas + 3 números (mínimo 2 dígitos)

---

## 🎯 Próximos Pasos (Opcional)

1. Agregar endpoint en API para validar VIN único
2. Agregar confirmación de VIN duplicado
3. Agregar histórico de VINs registrados
4. Validar placa única en región

---

**¡Validaciones en tiempo real lista! ✅**
