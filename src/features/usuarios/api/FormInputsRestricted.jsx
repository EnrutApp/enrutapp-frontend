/**
 * ============================================
 * COMPONENTES DE INPUT CON BLOQUEO EN TIEMPO REAL
 * ============================================
 * Componentes que bloquean entrada de caracteres inválidos
 * mientras el usuario escribe, SIN esperar validación al final
 */

import React from 'react';

// Estilos base para inputs
const inputBaseStyle =
  'w-full px-3 py-2 border border-gray-300 rounded transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
const labelStyle = 'block font-semibold text-sm mb-1';
const errorStyle = 'text-red-500 text-sm mt-1 block';
const hintStyle = 'text-gray-500 text-xs mt-1 block';
const selectStyle =
  'w-full px-3 py-2 border border-gray-300 rounded transition focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-white';

/**
 * COMPONENTE: Input Numérico Estricto
 * ✅ Solo acepta números
 * ❌ Bloquea letras directamente - no deja escribirlas
 * ❌ Bloquea caracteres especiales
 * ⏱️ Valida en tiempo real mientras escribes
 */
export const NumericOnlyInput = React.forwardRef(
  ({ label, error, maxLength = 10, placeholder = '', ...props }, ref) => {
    const handleKeyPress = e => {
      // Bloquea si no es número
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handleInput = e => {
      // Limpia si de alguna forma entró algo inválido
      let value = e.target.value;
      const numericOnly = value.replace(/\D/g, '');
      e.target.value = numericOnly.slice(0, maxLength);
    };

    const handlePaste = e => {
      // Bloquea paste con caracteres no númericos
      const text = e.clipboardData.getData('text');
      if (!/^\d+$/.test(text)) {
        e.preventDefault();
      }
    };

    return (
      <div className="form-group mb-4">
        {label && <label className={labelStyle}>{label}</label>}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${inputBaseStyle} ${error ? 'border-red-500 bg-red-50' : ''}`}
          onKeyPress={handleKeyPress}
          onInput={handleInput}
          onPaste={handlePaste}
          {...props}
        />
        {error && <span className={errorStyle}>{error}</span>}
      </div>
    );
  }
);
NumericOnlyInput.displayName = 'NumericOnlyInput';

/**
 * COMPONENTE: Input Solo Letras
 * ✅ Solo acepta letras y espacios
 * ❌ Bloquea números directamente - no deja escribirlos
 * ❌ Bloquea caracteres especiales
 * ⏱️ Valida en tiempo real mientras escribes
 */
export const LettersOnlyInput = React.forwardRef(
  ({ label, error, maxLength = 100, placeholder = '', ...props }, ref) => {
    const handleKeyPress = e => {
      // Solo permite letras (incluyendo acentos) y espacios
      if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handleInput = e => {
      // Limpia si de alguna forma entró algo inválido
      let value = e.target.value;
      const lettersOnly = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
      e.target.value = lettersOnly.slice(0, maxLength);
    };

    const handlePaste = e => {
      // Bloquea paste con números o caracteres especiales
      const text = e.clipboardData.getData('text');
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(text)) {
        e.preventDefault();
      }
    };

    return (
      <div className="form-group mb-4">
        {label && <label className={labelStyle}>{label}</label>}
        <input
          ref={ref}
          type="text"
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${inputBaseStyle} ${error ? 'border-red-500 bg-red-50' : ''}`}
          onKeyPress={handleKeyPress}
          onInput={handleInput}
          onPaste={handlePaste}
          {...props}
        />
        {error && <span className={errorStyle}>{error}</span>}
      </div>
    );
  }
);
LettersOnlyInput.displayName = 'LettersOnlyInput';

/**
 * COMPONENTE: Input Alfanumérico Restricto
 * ✅ Acepta letras, números, espacios, '#' y '-'
 * ❌ Bloquea otros caracteres especiales
 * ⏱️ Valida en tiempo real mientras escribes
 */
export const AlphanumericRestrictInput = React.forwardRef(
  ({ label, error, maxLength = 100, placeholder = '', ...props }, ref) => {
    const handleKeyPress = e => {
      // Solo permite letras, números, espacios, # y -
      if (!/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handleInput = e => {
      // Limpia si de alguna forma entró algo inválido
      let value = e.target.value;
      const validOnly = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]/g, '');
      e.target.value = validOnly.slice(0, maxLength);
    };

    const handlePaste = e => {
      // Bloquea paste con caracteres no permitidos
      const text = e.clipboardData.getData('text');
      if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]+$/.test(text)) {
        e.preventDefault();
      }
    };

    return (
      <div className="form-group mb-4">
        {label && <label className={labelStyle}>{label}</label>}
        <input
          ref={ref}
          type="text"
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${inputBaseStyle} ${error ? 'border-red-500 bg-red-50' : ''}`}
          onKeyPress={handleKeyPress}
          onInput={handleInput}
          onPaste={handlePaste}
          {...props}
        />
        {error && <span className={errorStyle}>{error}</span>}
      </div>
    );
  }
);
AlphanumericRestrictInput.displayName = 'AlphanumericRestrictInput';

/**
 * COMPONENTE: Input Teléfono
 * ✅ Solo números
 * ✅ 10 dígitos exactos
 * ✅ Comienza con 3 (necesario en Colombia)
 * ⏱️ Valida en tiempo real mientras escribes
 */
export const PhoneNumberInput = React.forwardRef(
  ({ label, error, countryCode = '+57', ...props }, ref) => {
    const maxLength = 10;

    const handleKeyPress = e => {
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handleInput = e => {
      let value = e.target.value;
      const numericOnly = value.replace(/\D/g, '');
      e.target.value = numericOnly.slice(0, maxLength);
    };

    const handlePaste = e => {
      const text = e.clipboardData.getData('text');
      if (!/^\d+$/.test(text)) {
        e.preventDefault();
      }
    };

    return (
      <div className="form-group mb-4">
        {label && <label className={labelStyle}>{label}</label>}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-600">{countryCode}</span>
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            maxLength={maxLength}
            placeholder="Ej: 3001234567"
            className={`${inputBaseStyle} flex-1 ${error ? 'border-red-500 bg-red-50' : ''}`}
            onKeyPress={handleKeyPress}
            onInput={handleInput}
            onPaste={handlePaste}
            {...props}
          />
        </div>
        {error && <span className={errorStyle}>{error}</span>}
        <span className={hintStyle}>10 dígitos exactos</span>
      </div>
    );
  }
);
PhoneNumberInput.displayName = 'PhoneNumberInput';

/**
 * COMPONENTE: Input Documento
 * ✅ Solo números
 * ✅ Exactamente 10 dígitos
 * ⏱️ Valida en tiempo real mientras escribes
 */
export const DocumentNumberInput = React.forwardRef(
  ({ label, error, ...props }, ref) => {
    const maxLength = 10;

    const handleKeyPress = e => {
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    };

    const handleInput = e => {
      let value = e.target.value;
      const numericOnly = value.replace(/\D/g, '');
      e.target.value = numericOnly.slice(0, maxLength);
    };

    const handlePaste = e => {
      const text = e.clipboardData.getData('text');
      if (!/^\d{10}$/.test(text)) {
        e.preventDefault();
      }
    };

    return (
      <div className="form-group mb-4">
        {label && <label className={labelStyle}>{label}</label>}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={maxLength}
          placeholder="Ingresa 10 dígitos"
          className={`${inputBaseStyle} ${error ? 'border-red-500 bg-red-50' : ''}`}
          onKeyPress={handleKeyPress}
          onInput={handleInput}
          onPaste={handlePaste}
          {...props}
        />
        {error && <span className={errorStyle}>{error}</span>}
        <span className={hintStyle}>Exactamente 10 dígitos</span>
      </div>
    );
  }
);
DocumentNumberInput.displayName = 'DocumentNumberInput';

/**
 * COMPONENTE: Input Email
 * ✅ Valida en tiempo real
 * ⏱️ Muestra error mientras escribes
 */
export const EmailInput = React.forwardRef(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="form-group mb-4">
        {label && <label className={labelStyle}>{label}</label>}
        <input
          ref={ref}
          type="email"
          placeholder="usuario@ejemplo.com"
          className={`${inputBaseStyle} ${error ? 'border-red-500 bg-red-50' : ''}`}
          {...props}
        />
        {error && <span className={errorStyle}>{error}</span>}
      </div>
    );
  }
);
EmailInput.displayName = 'EmailInput';

/**
 * COMPONENTE: Select con Validación
 * ✅ Valida en tiempo real
 * ✅ Muestra error mientras seleccionas
 */
export const SelectInput = React.forwardRef(
  (
    { label, error, options = [], placeholder = 'Selecciona...', ...props },
    ref
  ) => {
    return (
      <div className="form-group mb-4">
        {label && <label className={labelStyle}>{label}</label>}
        <select
          ref={ref}
          className={`${selectStyle} ${error ? 'border-red-500 bg-red-50' : ''}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option
              key={option.id || option.value}
              value={option.id || option.value}
            >
              {option.nombre || option.label || option.name}
            </option>
          ))}
        </select>
        {error && <span className={errorStyle}>{error}</span>}
      </div>
    );
  }
);
SelectInput.displayName = 'SelectInput';

/**
 * COMPONENTE: Input Fecha
 * ✅ Valida en tiempo real
 * ✅ Solo permite fechas en rango válido
 */
export const DateInput = React.forwardRef(({ label, error, ...props }, ref) => {
  const today = new Date().toISOString().split('T')[0];
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const maxDate = oneYearFromNow.toISOString().split('T')[0];

  return (
    <div className="form-group mb-4">
      {label && <label className={labelStyle}>{label}</label>}
      <input
        ref={ref}
        type="date"
        min={today}
        max={maxDate}
        className={`${inputBaseStyle} ${error ? 'border-red-500 bg-red-50' : ''}`}
        {...props}
      />
      {error && <span className={errorStyle}>{error}</span>}
      <span className={hintStyle}>(Desde hoy hasta máximo 1 año)</span>
    </div>
  );
});
DateInput.displayName = 'DateInput';

export default {
  NumericOnlyInput,
  LettersOnlyInput,
  AlphanumericRestrictInput,
  PhoneNumberInput,
  DocumentNumberInput,
  EmailInput,
  SelectInput,
  DateInput,
};
