/**
 * ============================================
 * EJEMPLO LISTO PARA COPIAR Y PEGAR
 * ============================================
 * Copia este archivo directamente o adaptalo a tu AddUserModal
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Modal from '../../../../shared/components/modal/Modal';
import apiClient from '../../../../shared/services/apiService';
import catalogService from '../../../../shared/services/catalogService';

// Importa los componentes con entrada restringida
import {
  DocumentNumberInput,
  LettersOnlyInput,
  PhoneNumberInput,
  AlphanumericRestrictInput,
  SelectInput,
  DateInput,
  EmailInput,
} from './FormInputsRestricted';

// Importa los esquemas
import {
  usuarioStep1Schema,
  usuarioStep2Schema,
  usuarioStep3Schema,
  licenseSchema,
} from './usuariosValidationSchemas';

/**
 * COMPONENTE PRINCIPAL - AddUserModal con validaciones Yup
 */
const AddUserModalWithValidation = ({
  isOpen,
  onClose,
  onConfirm,
  isClientMode = false,
}) => {
  // ==========================================
  // ESTADO
  // ==========================================
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isConductor, setIsConductor] = useState(false);

  // Catálogos
  const [tiposDoc, setTiposDoc] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [roles, setRoles] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const totalSteps = isClientMode ? 3 : 4;

  // ==========================================
  // SCHEMA DINÁMICO POR PASO
  // ==========================================
  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1:
        return usuarioStep1Schema;
      case 2:
        return usuarioStep2Schema;
      case 3:
        return usuarioStep3Schema;
      case 4:
        return licenseSchema;
      default:
        return Yup.object({});
    }
  };

  // ==========================================
  // REACT HOOK FORM
  // ==========================================
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    trigger,
    reset,
    getValues,
    clearErrors,
    setError: setFormError,
  } = useForm({
    resolver: yupResolver(getCurrentSchema()),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  // Observa cambios en el rol para detectar conductores
  const selectedRole = watch('idRol');

  useEffect(() => {
    if (selectedRole && roles.length > 0) {
      const role = roles.find(r => r.idRol === selectedRole);
      const esConductor = role?.nombreRol?.toLowerCase() === 'conductor';
      setIsConductor(esConductor);
    }
  }, [selectedRole, roles]);

  // ==========================================
  // EFECTOS - Carga inicial y limpieza
  // ==========================================
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCurrentStep(1);
      setError(null);
      setSuccess(false);
      setIsConductor(false);
      return;
    }

    loadCatalogs();
  }, [isOpen, reset]);

  // ==========================================
  // FUNCIONES DE CARGA
  // ==========================================
  const loadCatalogs = async () => {
    try {
      const [citiesRes, rolesRes, docsRes, categoriasRes] = await Promise.all([
        catalogService.getCities(),
        catalogService.getRoles(),
        catalogService.getDocumentTypes(),
        apiClient.get('/categorias-licencia'),
      ]);

      if (citiesRes.success && Array.isArray(citiesRes.data)) {
        setCiudades(citiesRes.data);
      }

      if (rolesRes.success && Array.isArray(rolesRes.data)) {
        setRoles(rolesRes.data.filter(r => r.estado));
      }

      if (docsRes.success && Array.isArray(docsRes.data)) {
        setTiposDoc(docsRes.data);
      }

      if (categoriasRes.success && Array.isArray(categoriasRes.data)) {
        setCategorias(categoriasRes.data);
      }
    } catch (err) {
      console.error('Error loading catalogs:', err);
    }
  };

  // ==========================================
  // FUNCIONES DE NAVEGACIÓN
  // ==========================================
  const handleNextStep = async () => {
    // Valida el paso actual
    const isStepValid = await trigger();

    if (!isStepValid) {
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    // Validaciones adicionales paso 1
    if (currentStep === 1) {
      try {
        setLoading(true);
        const { numDocumento, tipoDoc, correo } = getValues();

        // Verifica si el documento ya existe
        const docRes = await apiClient.get(
          `/usuarios/check-document/${tipoDoc}/${numDocumento}`
        );
        if (docRes.exists) {
          setError('El documento ya está registrado');
          setFormError('numDocumento', {
            type: 'manual',
            message: 'El documento ya está registrado',
          });
          setLoading(false);
          return;
        }

        // Verifica si el email ya existe
        const emailRes = await apiClient.get(`/usuarios/check-email/${correo}`);
        if (emailRes.exists) {
          setError('El correo electrónico ya está registrado');
          setFormError('correo', {
            type: 'manual',
            message: 'El correo electrónico ya está registrado',
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        setError('Error al validar los datos');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    // Limpia errores y avanza
    setError(null);
    clearErrors();

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Último paso - envío
      handleSubmitUser();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
      clearErrors();
    }
  };

  // ==========================================
  // ENVÍO DEL FORMULARIO
  // ==========================================
  const handleSubmitUser = async () => {
    try {
      setLoading(true);
      const formData = getValues();

      // Mapea los datos según tu API
      const userData = {
        tipoDoc: formData.tipoDoc,
        numDocumento: formData.numDocumento,
        correo: formData.correo,
        nombre: formData.nombre,
        telefono: formData.telefono,
        direccion: formData.direccion,
        idCiudad: formData.idCiudad,
        idRol: formData.idRol,
        ...(isConductor && {
          idCategoriaLicencia: formData.idCategoriaLicencia,
          fechaVencimientoLicencia: formData.fechaVencimientoLicencia,
        }),
      };

      const response = await apiClient.post('/usuarios', userData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onConfirm(response.data);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDERIZACIÓN POR PASO
  // ==========================================
  const renderStep = () => {
    const fieldErrorClass = 'border-red-500 bg-red-50';

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Paso 1: Identificación y Acceso
            </h3>

            {/* Tipo de Documento */}
            <div className="form-group">
              <label className="block font-semibold text-sm mb-1">
                Tipo de Documento *
              </label>
              <select
                {...register('tipoDoc')}
                className={`w-full px-3 py-2 border rounded transition ${
                  errors.tipoDoc ? fieldErrorClass : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona un tipo...</option>
                {tiposDoc.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {errors.tipoDoc && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.tipoDoc.message}
                </span>
              )}
            </div>

            {/* Número de Documento */}
            <DocumentNumberInput
              {...register('numDocumento')}
              label="Número de Documento *"
              error={errors.numDocumento?.message}
            />

            {/* Correo Electrónico */}
            <EmailInput
              {...register('correo')}
              label="Correo Electrónico *"
              error={errors.correo?.message}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 2: Datos Personales</h3>

            {/* Nombre Completo */}
            <LettersOnlyInput
              {...register('nombre')}
              label="Nombre Completo *"
              placeholder="Juan Pérez García"
              error={errors.nombre?.message}
            />

            {/* Teléfono */}
            <PhoneNumberInput
              {...register('telefono')}
              label="Teléfono *"
              error={errors.telefono?.message}
            />

            {/* Dirección */}
            <AlphanumericRestrictInput
              {...register('direccion')}
              label="Dirección *"
              placeholder="Calle 123 #45 - 6"
              error={errors.direccion?.message}
            />

            {/* Ciudad */}
            <SelectInput
              {...register('idCiudad')}
              label="Ciudad *"
              options={ciudades}
              placeholder="Selecciona una ciudad..."
              error={errors.idCiudad?.message}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Paso 3: Asignación de Rol</h3>

            {/* Rol */}
            <SelectInput
              {...register('idRol')}
              label="Rol del Usuario *"
              options={roles.map(rol => ({
                id: rol.idRol,
                nombre: rol.nombreRol,
              }))}
              placeholder="Selecciona un rol..."
              error={errors.idRol?.message}
            />

            {isConductor && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-700">
                  ℹ️ En el siguiente paso completarás la información de la
                  licencia de conducir.
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Paso 4: Información de Licencia
            </h3>

            {/* Categoría Licencia */}
            <SelectInput
              {...register('idCategoriaLicencia')}
              label="Categoría de Licencia *"
              options={categorias}
              placeholder="Selecciona una categoría..."
              error={errors.idCategoriaLicencia?.message}
            />

            {/* Fecha Vencimiento */}
            <DateInput
              {...register('fechaVencimientoLicencia')}
              label="Fecha de Vencimiento *"
              error={errors.fechaVencimientoLicencia?.message}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // ==========================================
  // RENDERIZACIÓN PRINCIPAL
  // ==========================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Añadir Nuevo Usuario"
      size="lg"
    >
      <div className="p-6">
        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">
              Paso {currentStep} de {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="mb-6">{renderStep()}</div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Mensaje de éxito */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded text-green-700">
            ✓ ¡Usuario creado exitosamente!
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            ← Anterior
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading
              ? 'Cargando...'
              : currentStep === totalSteps
                ? 'Crear Usuario'
                : 'Siguiente →'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddUserModalWithValidation;
