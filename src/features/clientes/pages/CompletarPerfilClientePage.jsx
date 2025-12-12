import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import '@material/web/icon/icon.js';
import '@material/web/progress/linear-progress.js';

import { useAuth } from '../../../shared/context/AuthContext';
import useApi from '../../../shared/hooks/useApi';
import catalogService from '../../../shared/services/catalogService';
import apiClient from '../../../shared/services/apiService';
import userService from '../../usuarios/api/userService';
import AddressAutocomplete from '../../../shared/components/addressAutocomplete/AddressAutocomplete';

const schema = yup.object().shape({
    tipoDoc: yup.string().required('El tipo de documento es obligatorio'),
    numDocumento: yup
        .string()
        .required('El número de documento es obligatorio')
        .max(20, 'Máximo 20 caracteres'),
    telefono: yup
        .string()
        .transform(value => (value ? String(value).replace(/\D/g, '') : value))
        .required('El teléfono es obligatorio')
        .matches(
            /^3\d{9}$/,
            'El teléfono debe tener 10 dígitos y empezar por 3'
        ),
    direccion: yup
        .string()
        .required('La dirección es obligatoria')
        .max(255, 'Máximo 255 caracteres'),
    idCiudad: yup
        .number()
        .typeError('La ciudad es obligatoria')
        .required('La ciudad es obligatoria'),
});

function CompletarPerfilClientePage() {
    const { user, updateProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingDocument, setCheckingDocument] = useState(false);
    const [error, setError] = useState('');

    const { data: documentTypes, isLoading: docTypesLoading } = useApi(
        catalogService.getDocumentTypes,
        []
    );

    const { data: cities, isLoading: citiesLoading } = useApi(
        catalogService.getCities,
        []
    );

    const defaultCityId = useMemo(() => {
        if (!cities || !Array.isArray(cities) || cities.length === 0) return '';
        return cities[0]?.idCiudad ?? '';
    }, [cities]);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        trigger,
        setValue,
        setError: setFieldError,
        clearErrors,
        getValues,
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            tipoDoc: user?.tipoDoc || user?.tipoDocumento?.idTipoDoc || '',
            numDocumento: user?.numDocumento || '',
            telefono: user?.telefono || '',
            direccion: user?.direccion || '',
            idCiudad: user?.idCiudad || user?.ciudad?.idCiudad || '',
        },
    });

    const watchAllFields = watch();

    useEffect(() => {
        if (!watchAllFields.idCiudad && defaultCityId) {
            setValue('idCiudad', defaultCityId);
        }
    }, [defaultCityId, setValue, watchAllFields.idCiudad]);

    useEffect(() => {
        if (step !== 2) return;
        clearErrors('numDocumento');
    }, [clearErrors, step, watchAllFields.numDocumento, watchAllFields.tipoDoc]);

    const onSubmit = async data => {
        setLoading(true);
        setError('');

        try {
            const response = await userService.completarPerfilCliente({
                tipoDoc: data.tipoDoc,
                numDocumento: String(data.numDocumento).trim(),
                telefono: String(data.telefono).trim(),
                direccion: String(data.direccion).trim(),
                idCiudad: Number(data.idCiudad),
            });

            if (response.success) {
                try {
                    await updateProfile();
                } catch { }
                window.location.href = '/dashboard';
            } else {
                setError(response.error || response.message || 'Error al completar perfil');
            }
        } catch (err) {
            setError(
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                err?.message ||
                'Error al completar el perfil. Inténtalo de nuevo.'
            );
        } finally {
            setLoading(false);
        }
    };

    const tipoDocumentoSeleccionado =
        documentTypes?.find(t => t.idTipoDoc === watchAllFields.tipoDoc) || null;

    const ciudadSeleccionada =
        cities?.find(c => c.idCiudad === Number(watchAllFields.idCiudad)) || null;

    return (
        <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center list-enter">
            {step < 3 && (
                <div className="absolute top-20 left-0 right-0 p-4 z-30">
                    <div className="flex items-center gap-2 justify-center max-w-md mx-auto">
                        <md-linear-progress
                            indeterminate={false}
                            value={step === 1 ? 0.5 : 1}
                            style={{
                                flex: 1,
                                borderRadius: 10,
                                '--md-sys-color-primary': 'var(--primary)',
                            }}
                        ></md-linear-progress>
                    </div>
                </div>
            )}

            <div className="relative z-20 w-full max-w-md mx-auto">
                <div>
                    {error && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs mb-3 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {step === 1 && (
                            <div className="flex flex-col gap-8 list-enter min-h-[300px] justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-fill rounded-full flex items-center justify-center mx-auto">
                                        <md-icon className="text-3xl text-blue">person</md-icon>
                                    </div>
                                    <h2 className="h3 font-semibold text-primary">
                                        ¡Bienvenido, {user?.nombre}!
                                    </h2>
                                    <p className="text-secondary text-sm">
                                        Para continuar como cliente, necesitamos que completes tu información básica.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary w-full"
                                    onClick={() => setStep(2)}
                                >
                                    Comenzar
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex flex-col gap-3 list-enter">
                                <div className="flex flex-col">
                                    <label className="subtitle1 text-primary font-medium mb-1">
                                        Tipo de documento <span className="text-red">*</span>
                                    </label>
                                    <div className="select-wrapper w-full">
                                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                                        <Controller
                                            name="tipoDoc"
                                            control={control}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${errors.tipoDoc ? 'border-red-500' : 'border-border'
                                                        }`}
                                                    disabled={docTypesLoading}
                                                >
                                                    <option value="">Selecciona el tipo</option>
                                                    {(documentTypes || []).map(t => (
                                                        <option key={t.idTipoDoc} value={t.idTipoDoc}>
                                                            {t.nombreTipoDoc}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />
                                    </div>
                                    {errors.tipoDoc && (
                                        <span className="text-red-500 text-xs mt-1">
                                            {errors.tipoDoc.message}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="subtitle1 text-primary font-medium mb-1">
                                        Número de documento <span className="text-red">*</span>
                                    </label>
                                    <Controller
                                        name="numDocumento"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                {...field}
                                                className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.numDocumento ? 'border-red-500' : 'border-border'
                                                    }`}
                                                placeholder="Aqui el numero"
                                            />
                                        )}
                                    />
                                    {errors.numDocumento && (
                                        <span className="text-red-500 text-xs mt-1">
                                            {errors.numDocumento.message}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="subtitle1 text-primary font-medium mb-1">
                                        Teléfono <span className="text-red">*</span>
                                    </label>
                                    <Controller
                                        name="telefono"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                value={field.value ?? ''}
                                                onChange={e => {
                                                    const numericValue = String(e.target.value).replace(/\D/g, '');
                                                    if (numericValue.length > 10) return;
                                                    field.onChange(numericValue);
                                                }}
                                                onBlur={field.onBlur}
                                                className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.telefono ? 'border-red-500' : 'border-border'
                                                    }`}
                                                placeholder="Aqui tu teléfono"
                                            />
                                        )}
                                    />
                                    {errors.telefono && (
                                        <span className="text-red-500 text-xs mt-1">
                                            {errors.telefono.message}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="subtitle1 text-primary font-medium mb-1">
                                        Dirección <span className="text-red">*</span>
                                    </label>
                                    <Controller
                                        name="direccion"
                                        control={control}
                                        render={({ field }) => (
                                            <AddressAutocomplete
                                                value={field.value ?? ''}
                                                onChange={value => field.onChange(value)}
                                                onSelect={addressData => {
                                                    if (addressData?.address) {
                                                        field.onChange(addressData.address);
                                                    }
                                                }}
                                                placeholder="Escribe tu dirección"
                                                required
                                            />
                                        )}
                                    />
                                    {errors.direccion && (
                                        <span className="text-red-500 text-xs mt-1">
                                            {errors.direccion.message}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="subtitle1 text-primary font-medium mb-1">
                                        Ciudad <span className="text-red">*</span>
                                    </label>
                                    <div className="select-wrapper w-full">
                                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                                        <Controller
                                            name="idCiudad"
                                            control={control}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${errors.idCiudad ? 'border-red-500' : 'border-border'
                                                        }`}
                                                    disabled={citiesLoading}
                                                >
                                                    <option value="">Selecciona la ciudad</option>
                                                    {(cities || []).map(c => (
                                                        <option key={c.idCiudad} value={c.idCiudad}>
                                                            {c.nombreCiudad}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />
                                    </div>
                                    {errors.idCiudad && (
                                        <span className="text-red-500 text-xs mt-1">
                                            {errors.idCiudad.message}
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-1/2"
                                        onClick={() => setStep(1)}
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary w-1/2"
                                        disabled={checkingDocument}
                                        onClick={async () => {
                                            setError('');
                                            const valid = await trigger([
                                                'tipoDoc',
                                                'numDocumento',
                                                'telefono',
                                                'direccion',
                                                'idCiudad',
                                            ]);

                                            if (!valid) return;

                                            const tipoDoc = getValues('tipoDoc');
                                            const numDocumento = String(getValues('numDocumento') ?? '').trim();

                                            const currentNumDocumento = String(user?.numDocumento ?? '').trim();
                                            if (currentNumDocumento && currentNumDocumento === numDocumento) {
                                                setStep(3);
                                                return;
                                            }

                                            setCheckingDocument(true);
                                            try {
                                                const docRes = await apiClient.get(
                                                    `/usuarios/check-document/${tipoDoc}/${encodeURIComponent(numDocumento)}`
                                                );

                                                if (docRes?.exists) {
                                                    setFieldError('numDocumento', {
                                                        type: 'manual',
                                                        message: 'El documento ya está registrado.',
                                                    });
                                                    return;
                                                }

                                                setStep(3);
                                            } catch {
                                                setError('Error validando el documento. Inténtalo de nuevo.');
                                            } finally {
                                                setCheckingDocument(false);
                                            }
                                        }}
                                    >
                                        {checkingDocument ? 'Validando...' : 'Siguiente'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col gap-4 list-enter content-box-outline-7-small">
                                <div className="text-center">
                                    <div className="w-20 h-20 flex items-center justify-center mx-auto">
                                        <md-icon className="text-3xl text-yellow-2">document_search</md-icon>
                                    </div>
                                    <h2 className="h3 font-semibold text-primary mb-2">
                                        Confirma tu Información
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="content-box-outline-2-small">
                                        <p className="text-secondary text-xs font-semibold mb-1">Tipo de documento</p>
                                        <p className="text-primary font-medium">
                                            {tipoDocumentoSeleccionado?.nombreTipoDoc || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="content-box-outline-2-small">
                                        <p className="text-secondary text-xs font-semibold mb-1">Número de documento</p>
                                        <p className="text-primary font-medium">
                                            {watchAllFields.numDocumento || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="content-box-outline-2-small">
                                        <p className="text-secondary text-xs font-semibold mb-1">Teléfono</p>
                                        <p className="text-primary font-medium">
                                            {watchAllFields.telefono || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="content-box-outline-2-small">
                                        <p className="text-secondary text-xs font-semibold mb-1">Dirección</p>
                                        <p className="text-primary font-medium">
                                            {watchAllFields.direccion || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="content-box-outline-2-small">
                                        <p className="text-secondary text-xs font-semibold mb-1">Ciudad</p>
                                        <p className="text-primary font-medium">
                                            {ciudadSeleccionada?.nombreCiudad || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary w-1/2"
                                        onClick={() => setStep(2)}
                                        disabled={loading}
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-1/2 flex items-center justify-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading && (
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        )}
                                        {loading ? 'Completando...' : 'Completar Perfil'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CompletarPerfilClientePage;
