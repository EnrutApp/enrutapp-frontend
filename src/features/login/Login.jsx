import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../shared/context/AuthContext';
import { loginSchema } from '../../shared/utils/validationSchemas';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onChange'
    });

    const onSubmit = async (data) => {
        try {
            await login(data);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-background'>
            <div className='w-full max-w-md px-6'>
                <div className='mb-3'>
                    <h1 className='h2 font-medium text-primary'>Inicia sesión</h1>
                    <p className='text-secondary subtitle2 mt-1'>Accede a tu cuenta con tus credenciales</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    {error && (
                        <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                            <p className='text-red-600 text-sm'>{error}</p>
                        </div>
                    )}

                    <div className='flex flex-col'>
                        <label htmlFor="email" className='text-secondary subtitle1 mb-1'>
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder='correo@ejemplo.com'
                            autoComplete="email"
                            {...register('email')}
                            className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.email ? 'border-red-500' : 'border-border'
                                }`}
                        />
                        {errors.email && (
                            <span className='text-red-500 text-sm mt-1'>{errors.email.message}</span>
                        )}
                    </div>

                    <div className='flex flex-col'>
                        <label htmlFor="password" className='text-secondary subtitle1 mb-1'>
                            Contraseña
                        </label>
                        <div className='relative'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder='Aquí tu contraseña'
                                autoComplete="current-password"
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

                    <div className='pt-1'>
                        <md-filled-button
                            type="submit"
                            disabled={!isValid || isLoading}
                            className='w-full btn btn-primary py-3 font-medium text-subtitle1'
                        >
                            {isLoading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Inicia sesión'
                            )}
                        </md-filled-button>
                    </div>

                    <div className='text-center'>
                        <NavLink
                            to="/reset-password"
                            className="text-secondary subtitle2 underline hover:text-primary transition-colors"
                        >
                            Olvidé mi contraseña
                        </NavLink>
                    </div>

                    <div className='text-center pt-2'>
                        <span className='text-secondary subtitle2'>¿No tienes cuenta? </span>
                        <NavLink
                            to="/register"
                            className="text-primary subtitle2 underline hover:opacity-80 transition-opacity"
                        >
                            Regístrate aquí
                        </NavLink>
                    </div> 
                </form>
            </div>
        </div>
    );
};

export default Login;