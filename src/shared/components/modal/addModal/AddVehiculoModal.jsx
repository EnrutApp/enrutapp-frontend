import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useEffect, useRef, useState } from 'react';
import { catalogService } from '../../../services/catalogService';

const initialForm = {
    idTipoVehiculo: '',
    idMarcaVehiculo: '',
    placa: '',
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

export default function AddVehiculoModal({ isOpen, onClose, onConfirm, onSubmitVehiculo }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [form, setForm] = useState(initialForm);
    const [tipos, setTipos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingCatalogs, setLoadingCatalogs] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        let mounted = true;
        setLoadingCatalogs(true);
        (async () => {
            try {
                const [t, m] = await Promise.all([
                    catalogService.getTiposVehiculo(),
                    catalogService.getMarcasVehiculo(),
                ]);
                if (!mounted) return;
                setTipos(Array.isArray(t?.data) ? t.data : t);
                setMarcas(Array.isArray(m?.data) ? m.data : m);
            } catch (e) {
                console.warn('No se pudieron cargar catálogos', e);
            } finally {
                if (mounted) setLoadingCatalogs(false);
            }
        })();
        return () => { mounted = false; };
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
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectFile = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        fileRef.current?.click();
    };

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (f) {
            setLoadingImage(true);
            setFile(f);
            // Crear URL de previsualización de forma asíncrona
            requestAnimationFrame(() => {
                const url = URL.createObjectURL(f);
                setPreviewUrl(url);
                // Simular un pequeño delay para mostrar el progreso
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
        if (!file) return 'La foto del vehículo es obligatoria';
        return null;
    };

    const validateStep2 = () => {
        if (!form.idTipoVehiculo) return 'Selecciona un tipo de vehículo';
        if (!form.idMarcaVehiculo) return 'Selecciona una marca';
        if (!form.placa) return 'La placa es obligatoria';
        if (!form.linea) return 'La línea es obligatoria';
        if (!form.modelo) return 'El modelo es obligatorio';
        if (!form.color) return 'El color es obligatorio';
        if (!form.capacidadPasajeros) return 'La capacidad de pasajeros es obligatoria';
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
            setCurrentStep(4);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const msg = validate();
        if (msg) { setError(msg); return; }
        try {
            setLoading(true);
            await onSubmitVehiculo?.(form, file);
            setSuccess(true);
            setTimeout(() => {
                onConfirm?.();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Error al crear el vehículo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <main className='p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg'>
                {/* Progress bar en la parte superior */}
                {(loading || loadingCatalogs || loadingImage) && (
                    <div className='absolute top-0 left-0 right-0 z-50'>
                        <md-linear-progress indeterminate></md-linear-progress>
                    </div>
                )}

                <div className='flex items-center gap-1 mb-4'>
                    <button
                        type="button"
                        onClick={onClose}
                        className='text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer'
                    >
                        <md-icon className="text-xl flex items-center justify-center">close</md-icon>
                    </button>
                </div>
                <div className='px-20'>
                    <div className='leading-tight mb-5'>
                        <h2 className='h2 font-medium text-primary'>
                            Añadir vehículo
                        </h2>
                        <p className='h5 text-secondary font-medium'>
                            {currentStep === 1 && 'Sube una foto del vehículo'}
                            {currentStep === 2 && 'Completa la información básica'}
                            {currentStep === 3 && 'Información del vehículo'}
                            {currentStep === 4 && 'Confirmar información'}
                        </p>
                    </div>

                    {/* Indicador de pasos */}
                    <div className='flex items-center justify-center gap-2 mb-6'>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentStep >= 1 ? 'bg-primary text-on-primary shadow-md' : 'bg-fill text-secondary'} font-semibold`}>
                            {currentStep > 1 ? <md-icon className="text-base">check</md-icon> : '1'}
                        </div>
                        <div className={`h-1 w-16 transition-all ${currentStep >= 2 ? 'bg-primary' : 'bg-fill'}`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentStep >= 2 ? 'bg-primary text-on-primary shadow-md' : 'bg-fill text-secondary'} font-semibold`}>
                            {currentStep > 2 ? <md-icon className="text-base">check</md-icon> : '2'}
                        </div>
                        <div className={`h-1 w-16 transition-all ${currentStep >= 3 ? 'bg-primary' : 'bg-fill'}`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentStep >= 3 ? 'bg-primary text-on-primary shadow-md' : 'bg-fill text-secondary'} font-semibold`}>
                            {currentStep > 3 ? <md-icon className="text-base">check</md-icon> : '3'}
                        </div>
                        <div className={`h-1 w-16 transition-all ${currentStep >= 4 ? 'bg-primary' : 'bg-fill'}`}></div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentStep >= 4 ? 'bg-primary text-on-primary shadow-md' : 'bg-fill text-secondary'} font-semibold`}>
                            4
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Paso 1: Foto */}
                        {currentStep === 1 && (
                            <div className='flex flex-col items-center gap-4 mb-4'>
                                {loadingImage && (
                                    <div className='w-full max-w-md'>
                                        <div className='flex flex-col items-center justify-center gap-3 p-6'>
                                            <md-linear-progress indeterminate class="w-full"></md-linear-progress>
                                            <p className='text-secondary text-sm'>Cargando imagen...</p>
                                        </div>
                                    </div>
                                )}
                                {!loadingImage && (
                                    <div className='w-full max-w-md'>
                                        {previewUrl ? (
                                            <div className='relative'>
                                                <img
                                                    src={previewUrl}
                                                    alt="Vista previa"
                                                    className='w-full h-64 object-cover rounded-lg border-2 border-border'
                                                />

                                                <button
                                                    type='button'
                                                    onClick={handleRemoveFile}
                                                    className='absolute top-3 right-2 mr-2 btn-secondary p-1 rounded-full opacity-80 cursor-pointer'
                                                >
                                                    <md-icon className='text-lg text-secondary flex items-center justify-center'>close</md-icon>
                                                </button>
                                                <div className='mt-3 p-3 bg-fill rounded-lg'>
                                                    <div className='flex items-center gap-2 text-sm text-secondary'>
                                                        <md-icon className='text-lg text-primary'>image</md-icon>
                                                        <span className='truncate flex-1'>{file?.name}</span>
                                                        <span className='text-xs'>{(file?.size / 1024).toFixed(2)} KB</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={handleSelectFile}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSelectFile(e)}
                                                className='w-full h-64 border-2 border-dashed border-secondary rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-fill transition-all'
                                            >
                                                <md-icon className='text-6xl text-secondary'>add_photo_alternate</md-icon>
                                                <p className='text-secondary font-medium'>Haz clic para seleccionar una foto</p>
                                                <p className='text-xs text-secondary'>JPG, PNG o WEBP (máx. 5MB)</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileRef}
                                            type='file'
                                            accept='image/jpeg,image/png,image/webp'
                                            onChange={handleFileChange}
                                            className='hidden'
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )}
                                {!previewUrl && !loadingImage && (
                                    <div className='flex flex-col gap-2'>
                                        <button
                                            type='button'
                                            className='btn btn-primary px-8'
                                            onClick={handleSelectFile}
                                        >
                                            <md-icon className='text-sm'>add_photo_alternate</md-icon>
                                            Seleccionar foto
                                        </button>
                                        <p className='text-xs text-secondary text-center'>
                                            La foto se mostrará después de seleccionarla
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paso 2: Información básica */}
                        {currentStep === 2 && (
                            <>
                                {loadingCatalogs && (
                                    <div className='flex flex-col items-center justify-center gap-3 p-6 mb-4'>
                                        <md-linear-progress indeterminate class="w-full"></md-linear-progress>
                                        <p className='text-secondary text-sm'>Cargando catálogos...</p>
                                    </div>
                                )}
                                {!loadingCatalogs && (
                                    <div className='grid grid-cols-2 gap-4 mb-4'>
                                        <div className='flex flex-col gap-1'>
                                            <label className='subtitle1 text-secondary'>Tipo de placa <span className='text-red'>*</span></label>
                                            <div className='select-wrapper w-full'>
                                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                                <select
                                                    name='idTipoVehiculo'
                                                    value={form.idTipoVehiculo}
                                                    onChange={handleChange}
                                                    className='select-filter w-full px-4 input bg-fill border rounded-lg'
                                                >
                                                    <option value=''>Selecciona un tipo</option>
                                                    {tipos?.map(t => (
                                                        <option key={t.idTipoVehiculo} value={t.idTipoVehiculo}>
                                                            {t.nombreTipoVehiculo}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className='flex flex-col gap-1'>
                                            <label className='subtitle1 text-secondary'>Marca <span className='text-red'>*</span></label>
                                            <div className='select-wrapper w-full'>
                                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                                <select
                                                    name='idMarcaVehiculo'
                                                    value={form.idMarcaVehiculo}
                                                    onChange={handleChange}
                                                    className='select-filter w-full px-4 input bg-fill border rounded-lg'
                                                >
                                                    <option value=''>Selecciona una marca</option>
                                                    {marcas?.map(m => (
                                                        <option key={m.idMarcaVehiculo} value={m.idMarcaVehiculo}>
                                                            {m.nombreMarca}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className='flex flex-col gap-1'>
                                            <label className='subtitle1 text-secondary'>Placa <span className='text-red'>*</span></label>
                                            <input
                                                name='placa'
                                                value={form.placa}
                                                onChange={handleChange}
                                                className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                                placeholder='Aqui la placa del vehiculo'
                                                maxLength={10}
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1'>
                                            <label className='subtitle1 text-secondary'>Línea <span className='text-red'>*</span></label>
                                            <input
                                                name='linea'
                                                value={form.linea}
                                                onChange={handleChange}
                                                className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                                placeholder='Linea del vehiculo'
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1'>
                                            <label className='subtitle1 text-secondary'>Modelo <span className='text-red'>*</span></label>
                                            <input
                                                type='number'
                                                name='modelo'
                                                value={form.modelo}
                                                onChange={handleChange}
                                                className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                                placeholder='Aqui el modelo'
                                                min='1900'
                                                max='2100'
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1'>
                                            <label className='subtitle1 text-secondary'>Color <span className='text-red'>*</span></label>
                                            <input
                                                name='color'
                                                value={form.color}
                                                onChange={handleChange}
                                                className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                                placeholder='Aqui el color del vehiculo'
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1'>
                                            <label className='subtitle1 text-secondary'>Capacidad pasajeros <span className='text-red'>*</span></label>
                                            <input
                                                type='number'
                                                name='capacidadPasajeros'
                                                value={form.capacidadPasajeros}
                                                onChange={handleChange}
                                                className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                                placeholder='Aqui la capacidad del vehiculo'
                                                min='1'
                                            />
                                        </div>

                                        <div className='flex flex-col gap-1'>
                                            <label className='subtitle1 text-secondary'>VIN</label>
                                            <input
                                                name='vin'
                                                value={form.vin}
                                                onChange={handleChange}
                                                className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                                placeholder='Aqui el vin del vehiculo'
                                                maxLength={17}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Paso 3: Información adicional */}
                        {currentStep === 3 && (
                            <div className='grid grid-cols-2 gap-4 mb-4'>
                                <div className='col-span-2 mb-2'>
                                    <div className='flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                                        <md-icon className='text-blue-600 dark:text-blue-400'>info</md-icon>
                                        <p className='text-sm text-blue-800 dark:text-blue-300'>
                                            Los siguientes campos son opcionales pero recomendados para un mejor control del vehículo
                                        </p>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <label className='subtitle1 text-secondary'>Capacidad carga (kg)</label>
                                    <input
                                        type='number'
                                        step='0.01'
                                        name='capacidadCarga'
                                        value={form.capacidadCarga}
                                        onChange={handleChange}
                                        className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                        placeholder='Aqui la capacidad de cargar'
                                    />
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <label className='subtitle1 text-secondary'>SOAT vence</label>
                                    <input
                                        type='date'
                                        name='soatVencimiento'
                                        value={form.soatVencimiento}
                                        onChange={handleChange}
                                        className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                    />
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <label className='subtitle1 text-secondary'>Tecnomecánica vence</label>
                                    <input
                                        type='date'
                                        name='tecnomecanicaVencimiento'
                                        value={form.tecnomecanicaVencimiento}
                                        onChange={handleChange}
                                        className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                    />
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <label className='subtitle1 text-secondary'>Seguro vence</label>
                                    <input
                                        type='date'
                                        name='seguroVencimiento'
                                        value={form.seguroVencimiento}
                                        onChange={handleChange}
                                        className='w-full px-4 input bg-fill border rounded-lg text-primary'
                                    />
                                </div>
                            </div>
                        )}

                        {/* Paso 4: Confirmación */}
                        {currentStep === 4 && (
                            <div className='space-y-4 mb-4'>
                                <div className='text-center mb-6'>
                                    <md-icon className='text-6xl text-primary mb-2'>fact_check</md-icon>
                                    <h3 className='h4 font-semibold text-primary mb-1'>Confirma la información</h3>
                                    <p className='text-sm text-secondary'>Revisa que todos los datos sean correctos antes de continuar</p>
                                </div>

                                {/* Previsualización de la foto */}
                                {previewUrl && (
                                    <div className='bg-fill rounded-lg p-4 border border-border'>
                                        <h4 className='subtitle1 font-semibold text-primary mb-3 flex items-center gap-2'>
                                            <md-icon className='text-lg'>image</md-icon>
                                            Foto del vehículo
                                        </h4>
                                        <img
                                            src={previewUrl}
                                            alt="Vista previa del vehículo"
                                            className='w-full h-48 object-cover rounded-lg shadow-sm'
                                        />
                                    </div>
                                )}

                                {/* Información básica */}
                                <div className='bg-fill rounded-lg p-4 border border-border'>
                                    <h4 className='subtitle1 font-semibold text-primary mb-3 flex items-center gap-2'>
                                        <md-icon className='text-lg'>directions_car</md-icon>
                                        Información básica
                                    </h4>
                                    <div className='grid grid-cols-2 gap-3'>
                                        <div className='flex flex-col'>
                                            <span className='text-xs text-secondary uppercase font-medium'>Tipo</span>
                                            <span className='text-sm text-primary font-semibold'>
                                                {tipos.find(t => t.idTipoVehiculo === form.idTipoVehiculo)?.nombreTipoVehiculo || '-'}
                                            </span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-xs text-secondary uppercase font-medium'>Marca</span>
                                            <span className='text-sm text-primary font-semibold'>
                                                {marcas.find(m => m.idMarcaVehiculo === form.idMarcaVehiculo)?.nombreMarca || '-'}
                                            </span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-xs text-secondary uppercase font-medium'>Placa</span>
                                            <span className='text-sm text-primary font-semibold'>{form.placa || '-'}</span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-xs text-secondary uppercase font-medium'>Línea</span>
                                            <span className='text-sm text-primary font-semibold'>{form.linea || '-'}</span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-xs text-secondary uppercase font-medium'>Modelo</span>
                                            <span className='text-sm text-primary font-semibold'>{form.modelo || '-'}</span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-xs text-secondary uppercase font-medium'>Color</span>
                                            <span className='text-sm text-primary font-semibold'>{form.color || '-'}</span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-xs text-secondary uppercase font-medium'>Capacidad</span>
                                            <span className='text-sm text-primary font-semibold'>
                                                {form.capacidadPasajeros || '-'} pasajeros
                                            </span>
                                        </div>
                                        {form.vin && (
                                            <div className='flex flex-col'>
                                                <span className='text-xs text-secondary uppercase font-medium'>VIN</span>
                                                <span className='text-sm text-primary font-semibold'>{form.vin}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Información adicional */}
                                {(form.capacidadCarga || form.soatVencimiento || form.tecnomecanicaVencimiento || form.seguroVencimiento) && (
                                    <div className='bg-fill rounded-lg p-4 border border-border'>
                                        <h4 className='subtitle1 font-semibold text-primary mb-3 flex items-center gap-2'>
                                            <md-icon className='text-lg'>event</md-icon>
                                            Información adicional
                                        </h4>
                                        <div className='grid grid-cols-2 gap-3'>
                                            {form.capacidadCarga && (
                                                <div className='flex flex-col'>
                                                    <span className='text-xs text-secondary uppercase font-medium'>Capacidad carga</span>
                                                    <span className='text-sm text-primary font-semibold'>{form.capacidadCarga} kg</span>
                                                </div>
                                            )}
                                            {form.soatVencimiento && (
                                                <div className='flex flex-col'>
                                                    <span className='text-xs text-secondary uppercase font-medium'>SOAT vence</span>
                                                    <span className='text-sm text-primary font-semibold'>{new Date(form.soatVencimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                            {form.tecnomecanicaVencimiento && (
                                                <div className='flex flex-col'>
                                                    <span className='text-xs text-secondary uppercase font-medium'>Tecnomecánica vence</span>
                                                    <span className='text-sm text-primary font-semibold'>{new Date(form.tecnomecanicaVencimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                            {form.seguroVencimiento && (
                                                <div className='flex flex-col'>
                                                    <span className='text-xs text-secondary uppercase font-medium'>Seguro vence</span>
                                                    <span className='text-sm text-primary font-semibold'>{new Date(form.seguroVencimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <div className='text-red mb-4 text-center'>{error}</div>}

                        {success && (
                            <div className='text-green mb-4 text-center'>
                                <md-icon className='text-2xl'>check_circle</md-icon>
                                <p className='font-semibold'>¡Vehículo agregado correctamente!</p>
                            </div>
                        )}

                        {/* Botones de navegación */}
                        <div className='flex justify-between gap-3 mt-6'>
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        type='button'
                                        className='btn btn-outline px-12 flex items-center gap-2'
                                        onClick={handlePrevStep}
                                        disabled={loading}
                                    >
                                        <md-icon className='text-sm'>arrow_back</md-icon>
                                        Anterior
                                    </button>
                                )}
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    type='button'
                                    className='btn px-6 text-secondary hover:bg-fill transition-colors'
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                {currentStep < 4 ? (
                                    <button
                                        className='btn btn-primary px-12 flex items-center gap-2'
                                        type='button'
                                        onClick={handleNextStep}
                                    >
                                        Siguiente
                                    </button>
                                ) : (
                                    <button
                                        className='btn btn-primary px-12 flex items-center gap-2'
                                        type='submit'
                                        disabled={loading || success}
                                    >
                                        {loading && <md-linear-progress indeterminate class="w-4 h-4"></md-linear-progress>}
                                        {loading ? 'Agregando...' : success ? 'Agregado ✓' : 'Agregar vehículo'}
                                        {!loading && !success && <md-icon className='text-sm'>check</md-icon>}
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
