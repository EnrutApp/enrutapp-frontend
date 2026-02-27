import Modal from '../../../../shared/components/modal/Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useEffect, useRef, useState } from 'react';
import { catalogService } from '../../../../shared/services/catalogService';

import '@material/web/switch/switch.js';

const initialForm = {
  idTipoVehiculo: '',
  idMarcaVehiculo: '',
  idPropietario: '',
  isExternalOwner: false,
  propietarioExternoNombre: '',
  propietarioExternoDocumento: '',
  propietarioExternoTelefono: '',
  placa: '',
  tipoPlaca: 'BLANCA',
  linea: '',
  modelo: '',
  color: '',
  vin: '',
  capacidadPasajeros: '',
  capacidadCarga: '',
  soatVencimiento: '',
  tecnomecanicaVencimiento: '',
  seguroVencimiento: '',
  estado: true,
};

export default function AddVehiculoModal({
  isOpen,
  onClose,
  onConfirm,
  onSubmitVehiculo,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [tipos, setTipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    linea: '',
    modelo: '',
    color: '',
    capacidadCarga: '',
    capacidadPasajeros: '',
    soatVencimiento: '',
    tecnomecanicaVencimiento: '',
    seguroVencimiento: '',
  });
  const fileRef = useRef(null);

  const totalSteps = 5;

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setLoadingCatalogs(true);
    (async () => {
      try {
        const [t, m, c] = await Promise.all([
          catalogService.getTiposVehiculo(),
          catalogService.getMarcasVehiculo(),
          catalogService.getConductores(),
        ]);
        if (!mounted) return;
        setTipos(Array.isArray(t?.data) ? t.data : t);
        setMarcas(Array.isArray(m?.data) ? m.data : m);
        setConductores(Array.isArray(c?.data) ? c.data : c);
      } catch (e) {
      } finally {
        if (mounted) setLoadingCatalogs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setForm(initialForm);
      setFile(null);
      setPreviewUrl(null);
      setError(null);
      setLoading(false);
      setLoadingCatalogs(false);
      setLoadingImage(false);
      setSuccess(false);
      setShowConfirmation(false);
      setFieldErrors({
        linea: '',
        modelo: '',
        color: '',
        capacidadCarga: '',
        capacidadPasajeros: '',
        soatVencimiento: '',
        tecnomecanicaVencimiento: '',
        seguroVencimiento: '',
      });
    }
  }, [isOpen]);

  const validateField = (name, value, currentForm = form) => {
    let error = null;
    switch (name) {
      case 'file':
        if (!value) error = 'La foto del vehículo es obligatoria';
        else if (value.size > 5 * 1024 * 1024)
          error = 'El archivo no debe superar 5MB';
        else if (
          !['image/jpeg', 'image/png', 'image/webp'].includes(value.type)
        )
          error = 'Formato no válido (JPG, PNG, WEBP)';
        break;
      case 'idTipoVehiculo':
        if (!value) error = 'Selecciona un tipo de vehículo';
        break;
      case 'idMarcaVehiculo':
        if (!value) error = 'Selecciona una marca';
        break;
      case 'placa':
        if (!value?.trim()) error = 'La placa es obligatoria';
        else if (value.trim().length < 5) error = 'Mínimo 5 caracteres';
        break;
      case 'tipoPlaca':
        if (!value) error = 'Selecciona el tipo de placa';
        break;
      case 'vin':
        if (value && value.trim().length < 17)
          error = 'El VIN debe tener 17 caracteres';
        break;
      case 'propietarioExternoNombre':
        if (currentForm.isExternalOwner && !value?.trim())
          error = 'El nombre es obligatorio';
        else if (currentForm.isExternalOwner && value.trim().length < 2)
          error = 'Mínimo 2 caracteres';
        break;
      case 'propietarioExternoDocumento':
        if (currentForm.isExternalOwner && !value?.trim())
          error = 'El documento es obligatorio';
        else if (currentForm.isExternalOwner && value.trim().length < 5)
          error = 'Mínimo 5 dígitos';
        break;
      case 'propietarioExternoTelefono':
        if (currentForm.isExternalOwner && !value?.trim())
          error = 'El teléfono es obligatorio';
        else if (currentForm.isExternalOwner && value.trim().length < 10)
          error = 'Mínimo 10 dígitos';
        break;
      case 'idPropietario':
        if (!currentForm.isExternalOwner && !value)
          error = 'Selecciona un conductor';
        break;
      case 'linea':
        if (!value?.trim()) error = 'La línea es obligatoria';
        else if (value.trim().length < 2) error = 'Mínimo 2 caracteres';
        break;
      case 'modelo':
        if (!value?.toString().trim()) error = 'El modelo es obligatorio';
        else {
          const year = parseInt(value, 10);
          if (year < 1900 || year > 2100) error = 'Rango válido: 1900-2100';
          else if (value.toString().length < 4) error = 'Debe tener 4 dígitos';
        }
        break;
      case 'color':
        if (!value?.trim()) error = 'El color es obligatorio';
        else if (value.trim().length < 3) error = 'Mínimo 3 caracteres';
        break;
      case 'capacidadPasajeros':
        if (!value?.toString().trim()) error = 'Obligatorio';
        else {
          const num = parseInt(value, 10);
          if (num < 1 || num > 100) error = 'Máx 100 pasajeros';
        }
        break;
      case 'capacidadCarga':
        if (value?.toString().trim()) {
          const num = parseInt(value, 10);
          if (num < 1 || num > 50000) error = 'Máx 50000 kg';
        }
        break;
      case 'soatVencimiento':
      case 'tecnomecanicaVencimiento':
      case 'seguroVencimiento':
        if (value) {
          const selectedDate = new Date(value);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          const nextYear = new Date(tomorrow);
          nextYear.setFullYear(nextYear.getFullYear() + 1);

          if (selectedDate < tomorrow)
            error = 'Debe ser una fecha futura (desde mañana en adelante)';
          else if (selectedDate > nextYear)
            error = 'La fecha no puede superar un año desde hoy';
        }
        break;
    }
    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'placa' || name === 'vin') {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (
      name === 'linea' ||
      name === 'propietarioExternoNombre' ||
      name === 'color'
    ) {
      newValue = value.replace(/[0-9]/g, '');
    } else if (
      name === 'modelo' ||
      name === 'capacidadPasajeros' ||
      name === 'capacidadCarga' ||
      name === 'propietarioExternoDocumento' ||
      name === 'propietarioExternoTelefono'
    ) {
      newValue = value.replace(/\D/g, '');
    }

    if (name === 'propietarioExternoTelefono' && newValue.length > 10) return;
    if (name === 'propietarioExternoDocumento' && newValue.length > 15) return;
    if (name === 'modelo' && newValue.length > 4) return;
    if (name === 'capacidadPasajeros' && newValue.length > 3) return;
    if (name === 'capacidadCarga' && newValue.length > 5) return;
    if (name === 'placa' && newValue.length > 6) return;
    if (name === 'vin' && newValue.length > 17) return;

    setForm(prev => ({ ...prev, [name]: newValue }));

    const fieldError = validateField(name, newValue, form);
    if (fieldError !== null || fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value, form);
    if (fieldError) {
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleSwitchChange = e => {
    const isExternal = e.target.selected;
    setForm(prev => ({
      ...prev,
      isExternalOwner: isExternal,
      idPropietario: isExternal ? '' : prev.idPropietario,
      propietarioExternoNombre: !isExternal
        ? ''
        : prev.propietarioExternoNombre,
      propietarioExternoDocumento: !isExternal
        ? ''
        : prev.propietarioExternoDocumento,
      propietarioExternoTelefono: !isExternal
        ? ''
        : prev.propietarioExternoTelefono,
    }));
  };

  const handleSelectFile = e => {
    e?.preventDefault();
    e?.stopPropagation();
    fileRef.current?.click();
  };

  const handleFileChange = e => {
    const f = e.target.files?.[0];
    if (f) {
      const fileError = validateField('file', f, form);
      if (fileError) {
        setError(fileError);
        if (fileRef.current) fileRef.current.value = '';
        return;
      }

      setError(null);
      setLoadingImage(true);
      setFile(f);

      requestAnimationFrame(() => {
        const url = URL.createObjectURL(f);
        setPreviewUrl(url);

        setTimeout(() => setLoadingImage(false), 300);
      });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const validateStep1 = () => validateField('file', file, form);

  const validateStep2 = () => {
    const fields = [
      'idTipoVehiculo',
      'idMarcaVehiculo',
      'placa',
      'tipoPlaca',
      'vin',
      ...(form.isExternalOwner
        ? [
            'propietarioExternoNombre',
            'propietarioExternoDocumento',
            'propietarioExternoTelefono',
          ]
        : ['idPropietario']),
    ];

    for (let f of fields) {
      const err = validateField(f, form[f], form);
      if (err) return err;
    }
    return null;
  };

  const validateStep3 = () => {
    const fields = [
      'linea',
      'modelo',
      'color',
      'capacidadPasajeros',
      'capacidadCarga',
    ];
    for (let f of fields) {
      const err = validateField(f, form[f], form);
      if (err) return err;
    }
    return null;
  };

  const validateStep4 = () => {
    const fields = [
      'soatVencimiento',
      'tecnomecanicaVencimiento',
      'seguroVencimiento',
    ];
    for (let f of fields) {
      const err = validateField(f, form[f], form);
      if (err) return err;
    }
    return null;
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1) {
      const msg = validateStep1();
      if (msg) {
        setError(msg);
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const msg = validateStep2();
      if (msg) {
        setError(msg);
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const msg = validateStep3();
      if (msg) {
        setError(msg);
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      const msg = validateStep4();
      if (msg) {
        setError(msg);
        return;
      }
      setShowConfirmation(true);
      setCurrentStep(5);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validate = () => {
    const msg1 = validateStep1();
    if (msg1) return msg1;
    const msg2 = validateStep2();
    if (msg2) return msg2;
    const msg3 = validateStep3();
    if (msg3) return msg3;
    const msg4 = validateStep4();
    if (msg4) return msg4;
    return null;
  };

  const handleConfirmAndCreate = async () => {
    setError(null);
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    try {
      setLoading(true);
      await onSubmitVehiculo?.(form, file);
      setSuccess(true);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Error al crear el vehículo';
      setError(errorMessage);
      setShowConfirmation(false);

      if (
        errorMessage.toLowerCase().includes('placa') ||
        errorMessage.toLowerCase().includes('vin')
      ) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
        {(loading || loadingCatalogs || loadingImage) && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="flex items-center gap-1 mb-4">
          {!success && (
            <button
              type="button"
              onClick={onClose}
              className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
              disabled={loading}
            >
              <md-icon className="text-xl flex items-center justify-center">
                close
              </md-icon>
            </button>
          )}
        </div>

        <div className="px-8 md:px-20">
          <div className="leading-tight mb-5">
            <h2 className="h2 font-medium text-primary">Añadir vehículo</h2>
            <p className="h5 text-secondary font-medium">
              {currentStep === 1 && 'Sube una foto del vehículo'}
              {currentStep === 2 && 'Identificación y categoría'}
              {currentStep === 3 && 'Características del vehículo'}
              {currentStep === 4 && 'Documentación y vencimientos'}
              {currentStep === 5 && 'Confirma la información'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 transform
                                    ${
                                      currentStep >= step
                                        ? 'bg-primary text-on-primary shadow-md scale-110 ring-4 ring-primary/20'
                                        : 'bg-fill text-secondary scale-100'
                                    }
                                    ${currentStep === step ? 'animate-pulse' : ''}
                                    font-semibold
                                `}
                >
                  {currentStep > step ? (
                    <md-icon className="text-base">check</md-icon>
                  ) : (
                    step
                  )}
                </div>
                {step < 5 && (
                  <div
                    className={`h-1 w-12 transition-all duration-300 ${currentStep > step ? 'bg-primary' : 'bg-fill'}`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div onSubmit={handleSubmit}>
            {success ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
                <div className="relative mb-8">
                  <div className="flex items-center justify-center mb-4 mt-3 animate-scale-in">
                    <md-icon className="text-green text-3xl">
                      directions_car
                    </md-icon>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="h4 font-medium text-primary animate-slide-up">
                    ¡Vehículo creado exitosamente!
                  </h2>
                </div>

                <div className="bg-fill rounded-xl p-6 max-w-md w-full mb-8 flex items-start gap-4">
                  <md-icon className="text-blue text-2xl mt-1">
                    directions_car
                  </md-icon>
                  <div className="flex-1">
                    <p className="text-primary font-semibold mb-1">
                      {form.placa}
                    </p>
                    <p className="text-secondary text-sm">
                      El vehículo ya está disponible en el sistema
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className="btn btn-primary px-10 py-3 animate-slide-up"
                  style={{ animationDelay: '0.3s' }}
                >
                  Finalizar
                </button>

                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                @keyframes scale-in {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes slide-up {
                    0% {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes fade-in {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                .animate-scale-in {
                    animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                    opacity: 0;
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `,
                  }}
                />
              </div>
            ) : showConfirmation ? (
              <div className="flex flex-col gap-6 mb-4">
                <div className="rounded-xl content-box-outline-4-small p-6 space-y-4">
                  {previewUrl && (
                    <div className="flex items-start gap-3 pb-2">
                      <md-icon className="text-primary mt-1">
                        photo_camera
                      </md-icon>
                      <div className="flex-1">
                        <p className="text-xs text-secondary font-medium mb-2">
                          Foto del vehículo
                        </p>
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="w-full h-40 object-cover rounded-lg shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <md-icon className="text-primary mt-1">category</md-icon>
                    <div className="flex-1">
                      <p className="text-xs text-secondary font-medium mb-1">
                        Tipo de vehículo
                      </p>
                      <p className="text-primary font-medium">
                        {tipos.find(
                          t => t.idTipoVehiculo === form.idTipoVehiculo
                        )?.nombreTipoVehiculo || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <md-icon className="text-primary mt-1">garage</md-icon>
                    <div className="flex-1">
                      <p className="text-xs text-secondary font-medium mb-1">
                        Marca
                      </p>
                      <p className="text-primary font-medium">
                        {marcas.find(
                          m => m.idMarcaVehiculo === form.idMarcaVehiculo
                        )?.nombreMarca || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <md-icon className="text-primary mt-1">pin</md-icon>
                    <div className="flex-1">
                      <p className="text-xs text-secondary font-medium mb-1">
                        Placa
                      </p>
                      <p className="text-primary font-medium uppercase">
                        {form.placa}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <md-icon className="text-primary mt-1">badge</md-icon>
                    <div className="flex-1">
                      <p className="text-xs text-secondary font-medium mb-1">
                        Tipo de placa
                      </p>
                      <p className="text-primary font-medium">
                        {form.tipoPlaca === 'AMARILLA'
                          ? 'Placa amarilla'
                          : 'Placa blanca'}
                      </p>
                    </div>
                  </div>

                  {form.vin && (
                    <div className="flex items-start gap-3">
                      <md-icon className="text-primary mt-1">numbers</md-icon>
                      <div className="flex-1">
                        <p className="text-xs text-secondary font-medium mb-1">
                          VIN
                        </p>
                        <p className="text-primary font-medium text-sm break-all">
                          {form.vin}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <md-icon className="text-primary mt-1">palette</md-icon>
                    <div className="flex-1">
                      <p className="text-xs text-secondary font-medium mb-1">
                        Línea / Modelo / Color
                      </p>
                      <p className="text-primary font-medium">
                        {form.linea} {form.modelo} - {form.color}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <md-icon className="text-primary mt-1">group</md-icon>
                    <div className="flex-1">
                      <p className="text-xs text-secondary font-medium mb-1">
                        Capacidad de pasajeros
                      </p>
                      <p className="text-primary font-medium">
                        {form.capacidadPasajeros} personas
                      </p>
                    </div>
                  </div>

                  {form.capacidadCarga && (
                    <div className="flex items-start gap-3">
                      <md-icon className="text-primary mt-1">scale</md-icon>
                      <div className="flex-1">
                        <p className="text-xs text-secondary font-medium mb-1">
                          Capacidad de carga
                        </p>
                        <p className="text-primary font-medium">
                          {form.capacidadCarga} kg
                        </p>
                      </div>
                    </div>
                  )}

                  {(form.soatVencimiento ||
                    form.tecnomecanicaVencimiento ||
                    form.seguroVencimiento) && (
                    <div className="flex items-start gap-3 pt-4 border-t border-border">
                      <md-icon className="text-primary mt-1">
                        event_note
                      </md-icon>
                      <div className="flex-1">
                        <p className="text-xs text-secondary font-medium mb-2">
                          Fechas de vencimiento
                        </p>
                        <div className="space-y-1">
                          {form.soatVencimiento && (
                            <p className="text-primary text-sm">
                              <span className="text-secondary">SOAT:</span>{' '}
                              {new Date(
                                form.soatVencimiento
                              ).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                          {form.tecnomecanicaVencimiento && (
                            <p className="text-primary text-sm">
                              <span className="text-secondary">
                                Tecnomecánica:
                              </span>{' '}
                              {new Date(
                                form.tecnomecanicaVencimiento
                              ).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                          {form.seguroVencimiento && (
                            <p className="text-primary text-sm">
                              <span className="text-secondary">Seguro:</span>{' '}
                              {new Date(
                                form.seguroVencimiento
                              ).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg content-box-outline-4-small p-4 flex items-start gap-3">
                  <md-icon className="text-yellow-2 text-xl mt-0.5">
                    info
                  </md-icon>
                  <p className="text-secondary text-sm flex-1">
                    Por favor, verifica que toda la información sea correcta
                    antes de crear el vehículo.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <div
                    className="flex flex-col items-center gap-4 mb-4"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && file) {
                        e.preventDefault();
                        handleNextStep();
                      }
                    }}
                  >
                    {loadingImage && (
                      <div className="w-full">
                        <div className="flex flex-col items-center justify-center gap-4 content-box-outline-2-small">
                          <md-icon className="text-3xl text-primary animate-pulse">
                            cloud_upload
                          </md-icon>
                          <md-linear-progress
                            indeterminate
                            class="w-full"
                          ></md-linear-progress>
                          <p className="text-secondary font-medium">
                            Cargando imagen...
                          </p>
                        </div>
                      </div>
                    )}
                    {!loadingImage && (
                      <div className="w-full">
                        {previewUrl ? (
                          <div className="relative group">
                            <div className="relative overflow-hidden rounded-2xl border-2 border-border shadow-lg">
                              <img
                                src={previewUrl}
                                alt="Vista previa"
                                className="w-full h-80 object-cover transition-transform duration-300 "
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              className="absolute top-4 right-4 btn btn-search-minimal cursor-pointer"
                            >
                              <md-icon className="text-lg flex items-center justify-center">
                                delete
                              </md-icon>
                              Eliminar
                            </button>

                            <div className="mt-4 p-4 content-box-outline-7-small bg-fill">
                              <div className="flex items-center gap-3">
                                <div>
                                  <md-icon className="text-yellow-2 text-xl">
                                    burst_mode
                                  </md-icon>
                                </div>
                                <div className="flex-1">
                                  <p className="font-normal text-primary truncate">
                                    {file?.name}
                                  </p>
                                  <p className="text-xs text-secondary">
                                    {(file?.size / 1024).toFixed(2)} KB
                                  </p>
                                </div>
                                <md-icon className="text-secondary text-lg">
                                  check_circle
                                </md-icon>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div
                              onClick={handleSelectFile}
                              role="button"
                              tabIndex={0}
                              onKeyDown={e =>
                                e.key === 'Enter' && handleSelectFile(e)
                              }
                              className="w-full h-80 border-3 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300 group"
                            >
                              <div className="p-6 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-all duration-300">
                                <md-icon className="text-3xl text-primary group-hover:scale-110 transition-transform duration-300">
                                  image_arrow_up
                                </md-icon>
                              </div>
                              <div className="text-center px-6">
                                <p className="text-lg text-primary font-bold mb-1">
                                  Arrastra tu imagen aquí
                                </p>
                                <p className="text-secondary font-medium mb-2">
                                  o haz clic para seleccionar
                                </p>
                                <div className="flex items-center justify-center gap-2 text-xs text-secondary bg-fill px-4 py-2 rounded-full border border-border">
                                  <md-icon className="text-sm">info</md-icon>
                                  JPG, PNG o WEBP (máx. 5MB)
                                </div>
                              </div>
                            </div>
                            <input
                              ref={fileRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleFileChange}
                              className="hidden"
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div
                    className="flex flex-col gap-4 mb-4"
                    onKeyDown={e => {
                      if (
                        e.key === 'Enter' &&
                        form.idTipoVehiculo &&
                        form.idMarcaVehiculo &&
                        form.placa &&
                        form.tipoPlaca
                      ) {
                        e.preventDefault();
                        handleNextStep();
                      }
                    }}
                  >
                    {loadingCatalogs && (
                      <div className="flex flex-col items-center justify-center gap-3 p-6">
                        <md-linear-progress
                          indeterminate
                          class="w-full"
                        ></md-linear-progress>
                        <p className="text-secondary text-sm">
                          Cargando catálogos...
                        </p>
                      </div>
                    )}
                    {!loadingCatalogs && (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Tipo de vehículo <span className="text-red">*</span>
                          </label>
                          <div className="select-wrapper w-full">
                            <md-icon className="text-sm">
                              arrow_drop_down
                            </md-icon>
                            <select
                              name="idTipoVehiculo"
                              value={form.idTipoVehiculo}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`select-filter w-full px-4 input bg-surface border rounded-lg ${fieldErrors.idTipoVehiculo ? 'border-red-500' : 'border-border'}`}
                            >
                              <option value="">Selecciona un tipo</option>
                              {tipos?.map(t => (
                                <option
                                  key={t.idTipoVehiculo}
                                  value={t.idTipoVehiculo}
                                >
                                  {t.nombreTipoVehiculo}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Marca <span className="text-red">*</span>
                          </label>
                          <div className="select-wrapper w-full">
                            <md-icon className="text-sm">
                              arrow_drop_down
                            </md-icon>
                            <select
                              name="idMarcaVehiculo"
                              value={form.idMarcaVehiculo}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`select-filter w-full px-4 input bg-surface border rounded-lg ${fieldErrors.idMarcaVehiculo ? 'border-red-500' : 'border-border'}`}
                            >
                              <option value="">Selecciona una marca</option>
                              {marcas?.map(m => (
                                <option
                                  key={m.idMarcaVehiculo}
                                  value={m.idMarcaVehiculo}
                                >
                                  {m.nombreMarca}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Placa <span className="text-red">*</span>
                          </label>
                          <input
                            name="placa"
                            value={form.placa}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 input bg-surface border rounded-lg text-primary uppercase ${fieldErrors.placa ? 'border-red-500' : 'border-border'}`}
                            placeholder="ABC123"
                            maxLength={6}
                          />
                          {fieldErrors.placa && (
                            <span className="text-xs text-red-500">
                              {fieldErrors.placa}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            Tipo de placa <span className="text-red">*</span>
                          </label>
                          <div className="select-wrapper w-full">
                            <md-icon className="text-sm">
                              arrow_drop_down
                            </md-icon>
                            <select
                              name="tipoPlaca"
                              value={form.tipoPlaca}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`select-filter w-full px-4 input bg-surface border rounded-lg ${fieldErrors.tipoPlaca ? 'border-red-500' : 'border-border'}`}
                            >
                              <option value="BLANCA">Placa blanca</option>
                              <option value="AMARILLA">Placa amarilla</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="subtitle1 text-primary font-medium">
                            VIN
                          </label>
                          <input
                            name="vin"
                            value={form.vin}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 input bg-surface border rounded-lg text-primary uppercase ${fieldErrors.vin ? 'border-red-500' : 'border-border'}`}
                            placeholder="Número de identificación vehicular"
                            maxLength={17}
                          />
                          {fieldErrors.vin && (
                            <span className="text-xs text-red-500">
                              {fieldErrors.vin}
                            </span>
                          )}
                        </div>

                        <div className="pt-4 border-t border-border mt-2">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="subtitle1 text-primary font-medium">
                                Propietario
                              </p>
                              <p className="text-xs text-secondary">
                                ¿El propietario es un conductor registrado?
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm ${form.isExternalOwner ? 'text-primary font-medium' : 'text-secondary'}`}
                              >
                                No
                              </span>
                              <md-switch
                                selected={!form.isExternalOwner}
                                onClick={e => {
                                  const isInternal = !e.target.selected;

                                  handleSwitchChange({
                                    target: { selected: !form.isExternalOwner },
                                  });
                                }}
                                touch-target="wrapper"
                              ></md-switch>
                              <span
                                className={`text-sm ${!form.isExternalOwner ? 'text-primary font-medium' : 'text-secondary'}`}
                              >
                                Sí
                              </span>
                            </div>
                          </div>

                          {!form.isExternalOwner ? (
                            <div className="flex flex-col gap-1 fade-in">
                              <label className="subtitle1 text-primary font-medium">
                                Conductor Propietario{' '}
                                <span className="text-red">*</span>
                              </label>
                              <div className="select-wrapper w-full">
                                <md-icon className="text-sm">
                                  arrow_drop_down
                                </md-icon>
                                <select
                                  name="idPropietario"
                                  value={form.idPropietario}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className={`select-filter w-full px-4 input bg-surface border rounded-lg ${fieldErrors.idPropietario ? 'border-red-500' : 'border-border'}`}
                                >
                                  <option value="">
                                    Selecciona un conductor
                                  </option>
                                  {conductores?.map(c => (
                                    <option
                                      key={c.idUsuario}
                                      value={c.idUsuario}
                                    >
                                      {c.usuario?.nombre ||
                                        c.nombre ||
                                        'Conductor'}{' '}
                                      - {c.numeroLicencia}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 fade-in">
                              <div className="flex flex-col gap-1">
                                <label className="subtitle1 text-primary font-medium">
                                  Nombre Propietario{' '}
                                  <span className="text-red">*</span>
                                </label>
                                <input
                                  name="propietarioExternoNombre"
                                  value={form.propietarioExternoNombre}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className={`w-full px-4 input bg-surface border rounded-lg text-primary ${fieldErrors.propietarioExternoNombre ? 'border-red-500' : 'border-border'}`}
                                  placeholder="Nombre completo"
                                />
                                {fieldErrors.propietarioExternoNombre && (
                                  <span className="text-xs text-red-500">
                                    {fieldErrors.propietarioExternoNombre}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                  <label className="subtitle1 text-primary font-medium">
                                    Documento{' '}
                                    <span className="text-red">*</span>
                                  </label>
                                  <input
                                    name="propietarioExternoDocumento"
                                    value={form.propietarioExternoDocumento}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 input bg-surface border rounded-lg text-primary ${fieldErrors.propietarioExternoDocumento ? 'border-red-500' : 'border-border'}`}
                                    placeholder="CC / NIT"
                                  />
                                  {fieldErrors.propietarioExternoDocumento && (
                                    <span className="text-xs text-red-500">
                                      {fieldErrors.propietarioExternoDocumento}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="subtitle1 text-primary font-medium">
                                    Teléfono <span className="text-red">*</span>
                                  </label>
                                  <input
                                    name="propietarioExternoTelefono"
                                    value={form.propietarioExternoTelefono}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`w-full px-4 input bg-surface border rounded-lg text-primary ${fieldErrors.propietarioExternoTelefono ? 'border-red-500' : 'border-border'}`}
                                    placeholder="Número de contacto"
                                  />
                                  {fieldErrors.propietarioExternoTelefono && (
                                    <span className="text-xs text-red-500">
                                      {fieldErrors.propietarioExternoTelefono}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {currentStep === 3 && (
                  <div
                    className="flex flex-col gap-4 mb-4"
                    onKeyDown={e => {
                      if (
                        e.key === 'Enter' &&
                        form.linea &&
                        form.modelo &&
                        form.color &&
                        form.capacidadPasajeros
                      ) {
                        e.preventDefault();
                        handleNextStep();
                      }
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <label className="subtitle1 text-primary font-medium">
                        Línea <span className="text-red">*</span>
                      </label>
                      <input
                        name="linea"
                        value={form.linea}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 input bg-surface border rounded-lg text-primary transition-colors ${
                          fieldErrors.linea
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-border focus:border-primary'
                        }`}
                        placeholder="Aqui la linea del vehiculo"
                      />
                      {fieldErrors.linea && (
                        <span className="text-xs text-red-500">
                          {fieldErrors.linea}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="subtitle1 text-primary font-medium">
                        Modelo <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="modelo"
                        value={form.modelo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 input bg-surface border rounded-lg text-primary transition-colors ${
                          fieldErrors.modelo
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-border focus:border-primary'
                        }`}
                        placeholder="2024"
                        maxLength="4"
                      />
                      {fieldErrors.modelo && (
                        <span className="text-xs text-red-500">
                          {fieldErrors.modelo}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="subtitle1 text-primary font-medium">
                        Color <span className="text-red">*</span>
                      </label>
                      <input
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 input bg-surface border rounded-lg text-primary transition-colors ${
                          fieldErrors.color
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-border focus:border-primary'
                        }`}
                        placeholder="Aqui el color del vehiculo"
                      />
                      {fieldErrors.color && (
                        <span className="text-xs text-red-500">
                          {fieldErrors.color}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="subtitle1 text-primary font-medium">
                        Capacidad de pasajeros{' '}
                        <span className="text-red">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleChange({
                              target: {
                                name: 'capacidadPasajeros',
                                value: '4',
                              },
                            })
                          }
                          className={`px-4 py-3 rounded-lg font-medium transition-all ${
                            form.capacidadPasajeros === '4' ||
                            form.capacidadPasajeros === 4
                              ? 'bg-primary text-on-primary'
                              : 'bg-fill border border-border text-secondary hover:bg-border'
                          }`}
                        >
                          4
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleChange({
                              target: {
                                name: 'capacidadPasajeros',
                                value: '5',
                              },
                            })
                          }
                          className={`px-4 py-3 rounded-lg font-medium transition-all ${
                            form.capacidadPasajeros === '5' ||
                            form.capacidadPasajeros === 5
                              ? 'bg-primary text-on-primary'
                              : 'bg-fill border border-border text-secondary hover:bg-border'
                          }`}
                        >
                          5
                        </button>
                        <input
                          type="text"
                          name="capacidadPasajeros"
                          value={
                            form.capacidadPasajeros
                              ? `${form.capacidadPasajeros} pasajeros`
                              : ''
                          }
                          onChange={e => {
                            const val = e.target.value.replace(/[^\d]/g, '');
                            handleChange({
                              target: {
                                name: 'capacidadPasajeros',
                                value: val,
                              },
                            });
                          }}
                          onBlur={handleBlur}
                          className={`flex-1 px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-colors ${
                            fieldErrors.capacidadPasajeros
                              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                              : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'
                          }`}
                          placeholder="Otra cantidad"
                        />
                      </div>
                      {fieldErrors.capacidadPasajeros && (
                        <span className="text-xs text-red-500">
                          {fieldErrors.capacidadPasajeros}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="subtitle1 text-primary font-medium">
                        Capacidad de carga
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="capacidadCarga"
                          value={
                            form.capacidadCarga
                              ? `${form.capacidadCarga} kg`
                              : ''
                          }
                          onChange={e => {
                            const val = e.target.value.replace(/[^\d]/g, '');
                            handleChange({
                              target: { name: 'capacidadCarga', value: val },
                            });
                          }}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 pr-12 input bg-fill border rounded-lg text-primary placeholder-text-secondary transition-colors ${
                            fieldErrors.capacidadCarga
                              ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                              : 'border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                          }`}
                          placeholder="Aquí la capacidad de carga del vehículo"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary subtitle2">
                          kg
                        </span>
                      </div>
                      {fieldErrors.capacidadCarga && (
                        <span className="text-xs text-red-500">
                          {fieldErrors.capacidadCarga}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div
                    className="flex flex-col gap-4 mb-4"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleNextStep();
                      }
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <label className="subtitle1 text-primary font-medium">
                        SOAT vence
                      </label>
                      <input
                        type="date"
                        name="soatVencimiento"
                        value={form.soatVencimiento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 input bg-fill border rounded-lg text-secondary focus:outline-none transition-colors ${
                          fieldErrors.soatVencimiento
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        } date-secondary`}
                      />
                      {fieldErrors.soatVencimiento && (
                        <span className="text-xs text-red-500">
                          {fieldErrors.soatVencimiento}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="subtitle1 text-primary font-medium">
                        Tecnomecánica vence
                      </label>
                      <input
                        type="date"
                        name="tecnomecanicaVencimiento"
                        value={form.tecnomecanicaVencimiento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 input bg-fill border rounded-lg text-secondary focus:outline-none transition-colors ${
                          fieldErrors.tecnomecanicaVencimiento
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        } date-secondary`}
                      />
                      {fieldErrors.tecnomecanicaVencimiento && (
                        <span className="text-xs text-red-500">
                          {fieldErrors.tecnomecanicaVencimiento}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="subtitle1 text-primary font-medium">
                        Seguro vence
                      </label>
                      <input
                        type="date"
                        name="seguroVencimiento"
                        value={form.seguroVencimiento}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 input bg-fill border rounded-lg text-secondary focus:outline-none transition-colors ${
                          fieldErrors.seguroVencimiento
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'
                        } date-secondary`}
                      />
                      {fieldErrors.seguroVencimiento && (
                        <span className="text-xs text-red-500">
                          {fieldErrors.seguroVencimiento}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="text-red mb-4 text-center font-medium">
                {error}
              </div>
            )}

            {!success && (
              <div className="flex gap-3 mt-6">
                {currentStep > 1 && !showConfirmation && (
                  <button
                    type="button"
                    className="btn btn-outline flex-1 flex items-center justify-center gap-2"
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    <md-icon className="text-sm">arrow_back</md-icon>
                    Anterior
                  </button>
                )}

                {showConfirmation ? (
                  <button
                    type="button"
                    onClick={handleConfirmAndCreate}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {loading ? 'Creando vehículo...' : 'Confirmar y crear'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    Siguiente
                    <md-icon className="text-sm">arrow_forward</md-icon>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </Modal>
  );
}
