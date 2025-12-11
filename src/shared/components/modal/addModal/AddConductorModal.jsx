import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useRef, useState, useEffect } from 'react';

const initialForm = {
  nombre: '',
  apellido: '',
  cedula: '',
  telefono: '',
  correo: '',
  licencia: '',
  estado: true,
};

export default function AddConductorModal({
  isOpen,
  onClose,
  onConfirm,
  onSubmitConductor,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setForm(initialForm);
      setFile(null);
      setError(null);
      setSuccess(false);
      setLoading(false);
      setLoadingImage(false);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectFile = e => {
    e?.preventDefault();
    e?.stopPropagation();
    fileRef.current?.click();
  };

  const handleFileChange = e => {
    const f = e.target.files?.[0];
    if (f) {
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

  const validateStep1 = () => {
    if (!file) return 'La foto del conductor es obligatoria';
    return null;
  };

  const validateStep2 = () => {
    if (!form.nombre) return 'El nombre es obligatorio';
    if (!form.apellido) return 'El apellido es obligatorio';
    if (!form.cedula) return 'La cédula es obligatoria';
    if (!form.telefono) return 'El teléfono es obligatorio';
    if (!form.licencia) return 'La licencia es obligatoria';
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
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    try {
      setLoading(true);
      await onSubmitConductor?.(form, file);
      setSuccess(true);
      setTimeout(() => {
        onConfirm?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al crear el conductor');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
        {(loading || loadingImage) && (
          <div className="absolute top-0 left-0 right-0 z-50">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="flex items-center gap-1 mb-4">
          <button
            type="button"
            onClick={onClose}
            className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
          >
            <md-icon className="text-xl flex items-center justify-center">
              close
            </md-icon>
          </button>
        </div>

        <div className="px-20">
          <div className="leading-tight mb-5">
            <h2 className="h2 font-medium text-primary">Agregar conductor</h2>
            <p className="h5 text-secondary font-medium">
              {currentStep === 1 && 'Sube una foto del conductor'}
              {currentStep === 2 && 'Completa la información básica'}
              {currentStep === 3 && 'Confirmar información'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentStep >= 1 ? 'bg-primary text-on-primary shadow-md' : 'bg-fill text-secondary'} font-semibold`}
            >
              {currentStep > 1 ? (
                <md-icon className="text-base">check</md-icon>
              ) : (
                '1'
              )}
            </div>
            <div
              className={`h-1 w-16 transition-all ${currentStep >= 2 ? 'bg-primary' : 'bg-fill'}`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentStep >= 2 ? 'bg-primary text-on-primary shadow-md' : 'bg-fill text-secondary'} font-semibold`}
            >
              {currentStep > 2 ? (
                <md-icon className="text-base">check</md-icon>
              ) : (
                '2'
              )}
            </div>
            <div
              className={`h-1 w-16 transition-all ${currentStep >= 3 ? 'bg-primary' : 'bg-fill'}`}
            ></div>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentStep >= 3 ? 'bg-primary text-on-primary shadow-md' : 'bg-fill text-secondary'} font-semibold`}
            >
              3
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="flex flex-col items-center gap-4 mb-4">
                {loadingImage && (
                  <div className="w-full max-w-md">
                    <div className="flex flex-col items-center justify-center gap-3 p-6">
                      <md-linear-progress
                        indeterminate
                        class="w-full"
                      ></md-linear-progress>
                      <p className="text-secondary text-sm">
                        Cargando imagen...
                      </p>
                    </div>
                  </div>
                )}
                {!loadingImage && (
                  <div className="w-full max-w-md">
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Vista previa"
                          className="w-full h-64 object-cover rounded-lg border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute top-3 right-2 mr-2 btn-secondary p-1 rounded-full opacity-80 cursor-pointer"
                        >
                          <md-icon className="text-lg text-secondary flex items-center justify-center">
                            close
                          </md-icon>
                        </button>
                        <div className="mt-3 p-3 bg-fill rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-secondary">
                            <md-icon className="text-lg text-primary">
                              image
                            </md-icon>
                            <span className="truncate flex-1">
                              {file?.name}
                            </span>
                            <span className="text-xs">
                              {(file?.size / 1024).toFixed(2)} KB
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={handleSelectFile}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e =>
                          e.key === 'Enter' && handleSelectFile(e)
                        }
                        className="w-full h-64 border-2 border-dashed border-secondary rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-fill transition-all"
                      >
                        <md-icon className="text-6xl text-secondary">
                          add_photo_alternate
                        </md-icon>
                        <p className="text-secondary font-medium">
                          Haz clic para seleccionar una foto
                        </p>
                        <p className="text-xs text-secondary">
                          JPG, PNG o WEBP (máx. 5MB)
                        </p>
                      </div>
                    )}
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
                {!previewUrl && !loadingImage && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className="btn btn-primary px-8"
                      onClick={handleSelectFile}
                    >
                      <md-icon className="text-sm">add_photo_alternate</md-icon>
                      Seleccionar foto
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="subtitle1 text-secondary">
                    Nombre <span className="text-red">*</span>
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full px-4 input bg-fill border rounded-lg text-primary"
                    placeholder="Nombre del conductor"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="subtitle1 text-secondary">
                    Apellido <span className="text-red">*</span>
                  </label>
                  <input
                    name="apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    className="w-full px-4 input bg-fill border rounded-lg text-primary"
                    placeholder="Apellido del conductor"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="subtitle1 text-secondary">
                    Cédula <span className="text-red">*</span>
                  </label>
                  <input
                    name="cedula"
                    value={form.cedula}
                    onChange={handleChange}
                    className="w-full px-4 input bg-fill border rounded-lg text-primary"
                    placeholder="Cédula del conductor"
                    maxLength={20}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="subtitle1 text-secondary">
                    Teléfono <span className="text-red">*</span>
                  </label>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    className="w-full px-4 input bg-fill border rounded-lg text-primary"
                    placeholder="Teléfono del conductor"
                    maxLength={20}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="subtitle1 text-secondary">
                    Licencia <span className="text-red">*</span>
                  </label>
                  <input
                    name="licencia"
                    value={form.licencia}
                    onChange={handleChange}
                    className="w-full px-4 input bg-fill border rounded-lg text-primary"
                    placeholder="Licencia de conducción"
                    maxLength={50}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="subtitle1 text-secondary">Correo</label>
                  <input
                    name="correo"
                    type="email"
                    value={form.correo}
                    onChange={handleChange}
                    className="w-full px-4 input bg-fill border rounded-lg text-primary"
                    placeholder="Correo del conductor"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 mb-4">
                <div className="text-center mb-6">
                  <md-icon className="text-6xl text-primary mb-2">
                    fact_check
                  </md-icon>
                  <h3 className="h4 font-semibold text-primary mb-1">
                    Confirma la información
                  </h3>
                  <p className="text-sm text-secondary">
                    Revisa que todos los datos sean correctos antes de continuar
                  </p>
                </div>

                {previewUrl && (
                  <div className="bg-fill rounded-lg p-4 border border-border">
                    <h4 className="subtitle1 font-semibold text-primary mb-3 flex items-center gap-2">
                      <md-icon className="text-lg">image</md-icon>
                      Foto del conductor
                    </h4>
                    <img
                      src={previewUrl}
                      alt="Vista previa del conductor"
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}

                <div className="bg-fill rounded-lg p-4 border border-border">
                  <h4 className="subtitle1 font-semibold text-primary mb-3 flex items-center gap-2">
                    <md-icon className="text-lg">person</md-icon>
                    Información personal
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-secondary uppercase font-medium">
                        Nombre
                      </span>
                      <span className="text-sm text-primary font-semibold">
                        {form.nombre || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-secondary uppercase font-medium">
                        Apellido
                      </span>
                      <span className="text-sm text-primary font-semibold">
                        {form.apellido || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-secondary uppercase font-medium">
                        Cédula
                      </span>
                      <span className="text-sm text-primary font-semibold">
                        {form.cedula || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-secondary uppercase font-medium">
                        Teléfono
                      </span>
                      <span className="text-sm text-primary font-semibold">
                        {form.telefono || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-secondary uppercase font-medium">
                        Licencia
                      </span>
                      <span className="text-sm text-primary font-semibold">
                        {form.licencia || '-'}
                      </span>
                    </div>
                    {form.correo && (
                      <div className="flex flex-col">
                        <span className="text-xs text-secondary uppercase font-medium">
                          Correo
                        </span>
                        <span className="text-sm text-primary font-semibold">
                          {form.correo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && <div className="text-red mb-4 text-center">{error}</div>}

            {success && (
              <div className="text-green mb-4 text-center">
                <md-icon className="text-2xl">check_circle</md-icon>
                <p className="font-semibold">
                  ¡Conductor agregado correctamente!
                </p>
              </div>
            )}

            <div className="flex justify-between gap-3 mt-6">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline px-12 flex items-center gap-2"
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    <md-icon className="text-sm">arrow_back</md-icon>
                    Anterior
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn px-6 text-secondary hover:bg-fill transition-colors"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                {currentStep < 3 ? (
                  <button
                    className="btn btn-primary px-12 flex items-center gap-2"
                    type="button"
                    onClick={handleNextStep}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    className="btn btn-primary px-12 flex items-center gap-2"
                    type="submit"
                    disabled={loading || success}
                  >
                    {loading
                      ? 'Agregando...'
                      : success
                        ? 'Agregado ✓'
                        : 'Agregar conductor'}
                    {!loading && !success && (
                      <md-icon className="text-sm">check</md-icon>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
    </Modal>
  );
}
