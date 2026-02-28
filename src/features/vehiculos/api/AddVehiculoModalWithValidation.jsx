/**
 * ============================================
 * MODAL DE CREAR VEHÍCULO
 * ============================================
 * Modal con validaciones en tiempo real usando Yup
 * y componentes de entrada restringida
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import apiClient from '../../../shared/services/apiService';


import { vehiculoSchema } from '../../usuarios/api/usuariosValidationSchemas';

/**
 * COMPONENTE PRINCIPAL - AddVehiculoModal con validaciones Yup
 */
const AddVehiculoModalWithValidation = ({ isOpen, onClose, onConfirm }) => {
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
    resolver: yupResolver(vehiculoSchema),
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
  const handleSubmitVehiculo = async () => {
    try {
      setLoading(true);
      const formData = getValues();

      const vehiculoData = {
        nombreVehiculo: formData.nombreVehiculo,
        vin: formData.vin,
        placa: formData.placa,
        marcaVehiculo: formData.marcaVehiculo,
        anioFabricacion: formData.anioFabricacion,
        capacidadPasajeros: parseInt(formData.capacidadPasajeros),
      };

      const response = await apiClient.post('/vehiculos', vehiculoData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onConfirm(response.data);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Error al crear el vehículo');
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
      title="Crear Nuevo Vehículo"
      size="md"
    >
      <div className="p-6">
        {/* Contenido del formulario */}
        <div className="space-y-4 mb-6">
          {/* Nombre del Vehículo */}
          <LettersOnlyInput
            {...register('nombreVehiculo')}
            label="Nombre del Vehículo *"
            placeholder="Ej: Bus Destino Ruta 5"
            error={errors.nombreVehiculo?.message}
          />

          {/* VIN (Vehicle Identification Number) */}
          <AlphanumericRestrictInput
            {...register('vin')}
            label="VIN (Número de Identificación) *"
            placeholder="Ej: 1HGCM82633A123456 (17 caracteres)"
            error={errors.vin?.message}
          />

          {/* Placa */}
          <AlphanumericRestrictInput
            {...register('placa')}
            label="Placa *"
            placeholder="Ej: ABC123 (3 letras mayúsculas + 3 números, mínimo 2 dígitos)"
            error={errors.placa?.message}
          />

          {/* Marca */}
          <LettersOnlyInput
            {...register('marcaVehiculo')}
            label="Marca del Vehículo *"
            placeholder="Ej: Hino, Scania, Volvo"
            error={errors.marcaVehiculo?.message}
          />

          {/* Año de Fabricación */}
          <NumericOnlyInput
            {...register('anioFabricacion')}
            label="Año de Fabricación *"
            placeholder="2020"
            maxLength="4"
            error={errors.anioFabricacion?.message}
          />

          {/* Capacidad de Pasajeros */}
          <NumericOnlyInput
            {...register('capacidadPasajeros')}
            label="Capacidad de Pasajeros *"
            placeholder="45"
            error={errors.capacidadPasajeros?.message}
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
            ✓ ¡Vehículo creado exitosamente!
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
            onClick={handleSubmitVehiculo}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Guardando...' : 'Crear Vehículo'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddVehiculoModalWithValidation;
