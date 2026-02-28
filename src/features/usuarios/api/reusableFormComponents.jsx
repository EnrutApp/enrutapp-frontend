/**
 * ============================================
 * SNIPPETS COPY-PASTE LISTOS PARA USAR
 * ============================================
 * Componentes y código reutilizable para implementar
 * las validaciones en tus formularios
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

/**
 * COMPONENTE 1: Input Numérico Estricto
 * Solo permite números, bloquea letras en tiempo real
 */
export const NumericInput = React.forwardRef(
  ({ label, error, maxLength = 12, ...props }, ref) => {
    const handleInput = e => {
      // En tiempo real, solo permite números
      let value = e.target.value;
      const numericOnly = value.replace(/\D/g, '');

      // Limita a maxLength
      if (numericOnly.length > maxLength) {
        e.target.value = numericOnly.slice(0, maxLength);
      } else {
        e.target.value = numericOnly;
      }
    };

    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={maxLength}
          onInput={handleInput}
          onKeyPress={e => {
            if (!/\d/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onPaste={e => {
            const text = e.clipboardData.getData('text');
            if (!/^\d+$/.test(text)) {
              e.preventDefault();
            }
          }}
          {...props}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

NumericInput.displayName = 'NumericInput';

/**
 * COMPONENTE 2: Input Solo Letras
 * Solo permite letras y espacios, bloquea números
 */
export const LettersOnlyInput = React.forwardRef(
  ({ label, error, ...props }, ref) => {
    const handleInput = e => {
      const value = e.target.value;
      // Reemplaza números con vacío
      const sanitized = value.replace(/\d/g, '');
      e.target.value = sanitized;
    };

    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <input
          ref={ref}
          type="text"
          onInput={handleInput}
          onKeyPress={e => {
            if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onPaste={e => {
            const text = e.clipboardData.getData('text');
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(text)) {
              e.preventDefault();
            }
          }}
          {...props}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

LettersOnlyInput.displayName = 'LettersOnlyInput';

/**
 * COMPONENTE 3: Input Alfanumérico
 * Permite letras, números, espacios, '#' y '-'
 */
export const AlphanumericInput = React.forwardRef(
  ({ label, error, ...props }, ref) => {
    const handleInput = e => {
      const value = e.target.value;
      // Solo permite caracteres válidos
      const sanitized = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]/g, '');
      e.target.value = sanitized;
    };

    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <input
          ref={ref}
          type="text"
          onInput={handleInput}
          onPaste={e => {
            const text = e.clipboardData.getData('text');
            if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-#]+$/.test(text)) {
              e.preventDefault();
            }
          }}
          {...props}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

AlphanumericInput.displayName = 'AlphanumericInput';

/**
 * COMPONENTE 4: Select con Validación
 */
export const SelectField = React.forwardRef(
  ({ label, error, options, ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <select ref={ref} {...props}>
          <option value="">Selecciona una opción...</option>
          {options?.map(option => (
            <option key={option.id} value={option.id}>
              {option.nombre || option.name || option.label}
            </option>
          ))}
        </select>
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

/**
 * COMPONENTE 5: Input de Fecha con Validación
 */
export const DateInput = React.forwardRef(
  ({ label, error, min, max, ...props }, ref) => {
    const today = new Date().toISOString().split('T')[0];
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    const maxDate = oneYearFromNow.toISOString().split('T')[0];

    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <input
          ref={ref}
          type="date"
          min={min || today}
          max={max || maxDate}
          {...props}
        />
        {error && <span className="error-message">{error}</span>}
        <small className="hint-text">(Hoy a máximo 1 año desde hoy)</small>
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

/**
 * COMPONENTE 6: Mensaje de Error Reutilizable
 */
// eslint-disable-next-line unused-imports/no-unused-vars
export const ErrorMessage = ({ message, fieldName }) => {
  return (
    <div className="error-container" role="alert">
      <span className="error-icon">⚠</span>
      <p className="error-text">{message}</p>
    </div>
  );
};

/**
 * COMPONENTE 7: Campo de Teléfono con Formato
 */
export const PhoneInput = React.forwardRef(
  ({ label, error, countryCode = '+57', ...props }, ref) => {
    const handleInput = e => {
      let value = e.target.value;
      // Solo números
      value = value.replace(/\D/g, '');
      // Limita a 10 dígitos
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
      e.target.value = value;
    };

    return (
      <div className="form-group phone-input-group">
        {label && <label>{label}</label>}
        <div className="phone-input-wrapper">
          <span className="country-code">{countryCode}</span>
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            placeholder="Ej: 3001234567"
            maxLength="10"
            onInput={handleInput}
            {...props}
          />
        </div>
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

/**
 * COMPONENTE 8: Campo de Documento
 */
export const DocumentNumberInput = React.forwardRef(
  ({ label, error, maxLength = 10, minLength = 10, ...props }, ref) => {
    const handleInput = e => {
      let value = e.target.value;
      // Solo números
      value = value.replace(/\D/g, '');
      // Limita a máximo
      if (value.length > maxLength) {
        value = value.slice(0, maxLength);
      }
      e.target.value = value;
    };

    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          placeholder={`Ingresa ${minLength}-${maxLength} dígitos`}
          maxLength={maxLength}
          onInput={handleInput}
          {...props}
        />
        {error && <span className="error-message">{error}</span>}
        <small className="hint-text">
          Solo números. Mínimo {minLength} caracteres
        </small>
      </div>
    );
  }
);

DocumentNumberInput.displayName = 'DocumentNumberInput';

/**
 * ============================================
 * SNIPPETS PARA CASOS ESPECÍFICOS
 * ============================================
 */

/**
 * SNIPPET 1: Validación en Tiempo Real - Documento
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useDocumentValidation = () => {
  const [error, setError] = React.useState(null);

  const validateDocument = value => {
    if (!value) {
      setError(null);
      return;
    }

    if (!/^\d+$/.test(value)) {
      setError('Solo se permiten números');
      return;
    }

    if (value.length !== 10) {
      setError('El documento debe tener exactamente 10 dígitos');
      return;
    }

    setError(null);
  };

  return { error, validateDocument };
};

/**
 * SNIPPET 2: Validación en Tiempo Real - Nombre
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useNameValidation = () => {
  const [error, setError] = React.useState(null);

  const validateName = value => {
    if (!value) {
      setError(null);
      return;
    }

    if (value.length < 2) {
      setError('Mínimo 2 caracteres');
      return;
    }

    if (/\d/.test(value)) {
      setError('El nombre no debe contener números');
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      setError('Solo letras y espacios permitidos');
      return;
    }

    setError(null);
  };

  return { error, validateName };
};

/**
 * SNIPPET 3: Validación en Tiempo Real - Teléfono
 */
// eslint-disable-next-line react-refresh/only-export-components
export const usePhoneValidation = () => {
  const [error, setError] = React.useState(null);

  const validatePhone = value => {
    if (!value) {
      setError(null);
      return;
    }

    if (!/^\d+$/.test(value)) {
      setError('Solo números permitidos');
      return;
    }

    if (value.length < 7 || value.length > 10) {
      setError('Debe tener entre 7 y 10 dígitos');
      return;
    }

    setError(null);
  };

  return { error, validatePhone };
};

/**
 * SNIPPET 4: Validación en Tiempo Real - Fecha
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useDateValidation = () => {
  const [error, setError] = React.useState(null);

  const validateDate = value => {
    if (!value) {
      setError(null);
      return;
    }

    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (date < today) {
      setError('No puede ser una fecha pasada');
      return;
    }

    if (date > oneYearFromNow) {
      setError('No puede ser mayor a 1 año desde hoy');
      return;
    }

    setError(null);
  };

  return { error, validateDate };
};

/**
 * ============================================
 * EJEMPLOS DE USO EN COMPONENTES
 * ============================================
 */

/**
 * EJEMPLO 1: Form Usuario Simple
 */
export const SimpleUserForm = ({ onSubmit }) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    // eslint-disable-next-line no-undef
    resolver: yupResolver(usuarioStep1Schema),
    mode: 'onBlur',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <NumericInput
        {...register('numDocumento')}
        label="Número de Documento"
        error={errors.numDocumento?.message}
        placeholder="Ej: 123456789"
        maxLength="12"
      />

      <LettersOnlyInput
        {...register('nombre')}
        label="Nombre Completo"
        error={errors.nombre?.message}
        placeholder="Ej: Juan Pérez"
      />

      <PhoneInput
        {...register('telefono')}
        label="Teléfono de Contacto"
        error={errors.telefono?.message}
        countryCode="+57"
      />

      <button type="submit">Guardar</button>
    </form>
  );
};

/**
 * EJEMPLO 2: Validación en Tiempo Real
 */
export const FormWithRealTimeValidation = () => {
  const { error: docError, validateDocument } = useDocumentValidation();
  const { error: nameError, validateName } = useNameValidation();
  const { error: phoneError, validatePhone } = usePhoneValidation();

  const handleDocChange = e => {
    validateDocument(e.target.value);
  };

  const handleNameChange = e => {
    validateName(e.target.value);
  };

  const handlePhoneChange = e => {
    validatePhone(e.target.value);
  };

  return (
    <div>
      <DocumentNumberInput
        onChange={handleDocChange}
        error={docError}
        label="Número de Documento"
      />

      <LettersOnlyInput
        onChange={handleNameChange}
        error={nameError}
        label="Nombre Completo"
      />

      <PhoneInput
        onChange={handlePhoneChange}
        error={phoneError}
        label="Teléfono"
      />
    </div>
  );
};

/**
 * EJEMPLO 3: Select Dinámico
 */
export const SelectExample = ({ options, label, error, ...props }) => {
  return (
    <SelectField options={options} label={label} error={error} {...props} />
  );
};

/**
 * ESTILOS RECOMENDADOS (CSS/Tailwind)
 */
export const stylesExample = `
/* Contenedores de formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 600;
  font-size: 0.875rem;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Errores */
.error-message {
  font-size: 0.875rem;
  color: #ef4444;
  font-weight: 500;
}

.error-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  color: #991b1b;
}

.error-icon {
  font-size: 1.25rem;
}

/* Hints */
.hint-text {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Phone input especial */
.phone-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.country-code {
  font-weight: 600;
  color: #666;
}

.phone-input-wrapper input {
  flex: 1;
}

/* Input invalido */
.form-group input:invalid,
.form-group.error input {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-group input:valid {
  border-color: #10b981;
}
`;

export default {
  NumericInput,
  LettersOnlyInput,
  AlphanumericInput,
  SelectField,
  DateInput,
  ErrorMessage,
  PhoneInput,
  DocumentNumberInput,
};
