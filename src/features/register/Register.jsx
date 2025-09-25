import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../shared/context/AuthContext';
import { registerSchema } from '../../shared/utils/validationSchemas';
import catalogService from '../../shared/services/catalogService';
import useApi from '../../shared/hooks/useApi';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        watch
    } = useForm({
        resolver: yupResolver(registerSchema),
        mode: 'onChange'
    });

    // Cargar roles y tipos de documento
    const {
        data: roles,
        isLoading: rolesLoading
    } = useApi(catalogService.getRoles, []);

    const {
        data: documentTypes,
        isLoading: docTypesLoading
    } = useApi(catalogService.getDocumentTypes, []);

    const onSubmit = async (data) => {
        try {
            const response = await registerUser(data);
            if (response.success) {
                alert('Registro exitoso. Ya puedes iniciar sesión.');
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-background py-8'>
            <div className='w-full max-w-2xl px-6'>
                <div className='mb-6'>
                    <h1 className='h2 font-medium text-primary'>Crear cuenta</h1>
                    <p className='text-secondary subtitle2 mt-1'>Completa todos los campos para registrarte</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    {error && (
                        <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                            <p className='text-red-600 text-sm'>{error}</p>
                        </div>
                    )}

                    {/* Información Personal */}
                    <div className='content-box-outline-3'>
                        <h3 className='h4 mb-4 text-primary'>Información Personal</h3>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <label htmlFor="name" className='text-secondary subtitle1 mb-1'>
                                    Nombre completo *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder='Juan Pérez'
                                    {...register('name')}
                                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.name ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                {errors.name && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.name.message}</span>
                                )}
                            </div>

                            <div className='flex flex-col'>
                                <label htmlFor="email" className='text-secondary subtitle1 mb-1'>
                                    Correo electrónico *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder='correo@ejemplo.com'
                                    {...register('email')}
                                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.email ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                {errors.email && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.email.message}</span>
                                )}
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                            <div className='flex flex-col'>
                                <label htmlFor="documentType" className='text-secondary subtitle1 mb-1'>
                                    Tipo de documento *
                                </label>
                                <select
                                    id="documentType"
                                    {...register('documentType')}
                                    className={`w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${errors.documentType ? 'border-red-500' : 'border-border'
                                        }`}
                                    disabled={docTypesLoading}
                                >
                                    <option value="">Seleccionar tipo</option>
                                    {documentTypes?.map((docType) => (
                                        <option key={docType.idTipoDoc} value={docType.idTipoDoc}>
                                            {docType.nombreTipoDoc}
                                        </option>
                                    ))}
                                </select>
                                {errors.documentType && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.documentType.message}</span>
                                )}
                            </div>

                            <div className='flex flex-col'>
                                <label htmlFor="documentNumber" className='text-secondary subtitle1 mb-1'>
                                    Número de documento *
                                </label>
                                <input
                                    type="text"
                                    id="documentNumber"
                                    placeholder='12345678'
                                    {...register('documentNumber')}
                                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.documentNumber ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                {errors.documentNumber && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.documentNumber.message}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className='content-box-outline-3'>
                        <h3 className='h4 mb-4 text-primary'>Información de Contacto</h3>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <label htmlFor="phone" className='text-secondary subtitle1 mb-1'>
                                    Teléfono *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder='555-1234'
                                    {...register('phone')}
                                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.phone ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                {errors.phone && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.phone.message}</span>
                                )}
                            </div>

                            <div className='flex flex-col'>
                                <label htmlFor="city" className='text-secondary subtitle1 mb-1'>
                                    Ciudad *
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    placeholder='Bogotá'
                                    {...register('city')}
                                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.city ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                {errors.city && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.city.message}</span>
                                )}
                            </div>
                        </div>

                        <div className='mt-4'>
                            <div className='flex flex-col'>
                                <label htmlFor="address" className='text-secondary subtitle1 mb-1'>
                                    Dirección *
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    placeholder='Calle 123 #45-67'
                                    {...register('address')}
                                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.address ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                {errors.address && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.address.message}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Rol y Contraseña */}
                    <div className='content-box-outline-3'>
                        <h3 className='h4 mb-4 text-primary'>Cuenta y Seguridad</h3>

                        <div className='mb-4'>
                            <div className='flex flex-col'>
                                <label htmlFor="roleId" className='text-secondary subtitle1 mb-1'>
                                    Rol *
                                </label>
                                <select
                                    id="roleId"
                                    {...register('roleId')}
                                    className={`w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${errors.roleId ? 'border-red-500' : 'border-border'
                                        }`}
                                    disabled={rolesLoading}
                                >
                                    <option value="">Seleccionar rol</option>
                                    {roles?.map((role) => (
                                        <option key={role.idRol} value={role.idRol}>
                                            {role.nombreRol}
                                        </option>
                                    ))}
                                </select>
                                {errors.roleId && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.roleId.message}</span>
                                )}
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col'>
                                <label htmlFor="password" className='text-secondary subtitle1 mb-1'>
                                    Contraseña *
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder='Tu contraseña segura'
                                        autoComplete="new-password"
                                        {...register('password')}
                                        className={`w-full input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.password ? 'border-red-500' : 'border-border'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors'
                                    >
                                        <md-icon>
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </md-icon>
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.password.message}</span>
                                )}
                            </div>

                            <div className='flex flex-col'>
                                <label htmlFor="confirmPassword" className='text-secondary subtitle1 mb-1'>
                                    Confirmar contraseña *
                                </label>
                                <div className='relative'>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        placeholder='Repite tu contraseña'
                                        autoComplete="new-password"
                                        {...register('confirmPassword')}
                                        className={`w-full input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-border'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfirmPasswordVisibility}
                                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors'
                                    >
                                        <md-icon>
                                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                        </md-icon>
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <span className='text-red-500 text-sm mt-1'>{errors.confirmPassword.message}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className='pt-4'>
                        <md-filled-button
                            type="submit"
                            disabled={!isValid || isLoading || rolesLoading || docTypesLoading}
                            className='w-full btn btn-primary py-3 font-medium text-subtitle1'
                        >
                            {isLoading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creando cuenta...
                                </>
                            ) : (
                                'Crear cuenta'
                            )}
                        </md-filled-button>
                    </div>

                    <div className='text-center pt-2'>
                        <span className='text-secondary subtitle2'>¿Ya tienes cuenta? </span>
                        <NavLink
                            to="/login"
                            className="text-primary subtitle2 underline hover:opacity-80 transition-opacity"
                        >
                            Inicia sesión aquí
                        </NavLink>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
