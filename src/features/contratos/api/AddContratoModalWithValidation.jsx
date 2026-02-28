/**
 * ============================================
 * MODAL DE CREAR CONTRATO
 * ============================================
 * Modal con validaciones en tiempo real usando Yup
 * y componentes de entrada restringida
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import apiClient from '../../../shared/services/apiService';


import { contratoSchema } from '../../usuarios/api/usuariosValidationSchemas';

/**
 * COMPONENTE PRINCIPAL - AddContratoModal con validaciones Yup
 */
const AddContratoModalWithValidation = ({ isOpen, onClose, onConfirm }) => {
  // ==========================================
  // ESTADO
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ==========================================
  // REACT HOOK FORM
  // ==========================================
  const {
    register,
    // eslint-disable-next-line unused-imports/no-unused-vars
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    // eslint-disable-next-line unused-imports/no-unused-vars
    clearErrors,
  } = useForm({
    resolver: yupResolver(contratoSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  // ==========================================
  // EFECTOS - Carga inicial y limpieza
  // ==========================================
  useEffect(() => {
    if (!isOpen) {
      reset();
      setError(null);
      setSuccess(false);
      return;
    }
  }, [isOpen, reset]);

  // ==========================================
  // ENVÍO DEL FORMULARIO
  // ==========================================
  const handleSubmitContrato = async () => {
    try {
      setLoading(true);
      const formData = getValues();

      const contratoData = {
        linea: formData.linea,
        fechaOrigen: formData.fechaOrigen,
        descripcion: formData.descripcion,
      };

      const response = await apiClient.post('/contratos', contratoData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onConfirm(response.data);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Error al crear el contrato');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDERIZACIÓN PRINCIPAL
  // ==========================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Contrato"
      size="md"
    >
      <div className="p-6">
        {/* Contenido del formulario */}
        <div className="space-y-4 mb-6">
          {/* Línea */}
          <LettersOnlyInput
            {...register('linea')}
            label="Línea de Transporte *"
            placeholder="Ej: La Tribu Transportes"
            error={errors.linea?.message}
          />

          {/* Fecha de Origen */}
          <DateInput
            {...register('fechaOrigen')}
            label="Fecha de Origen *"
            error={errors.fechaOrigen?.message}
          />

          {/* Descripción */}
          <AlphanumericRestrictInput
            {...register('descripcion')}
            label="Descripción *"
            placeholder="Detalles del contrato"
            error={errors.descripcion?.message}
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded text-green-700">
            ✓ ¡Contrato creado exitosamente!
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmitContrato}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Guardando...' : 'Crear Contrato'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddContratoModalWithValidation;
