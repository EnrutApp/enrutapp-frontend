import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/checkbox/checkbox.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../shared/context/AuthContext';
import { loginSchema } from '../../shared/utils/validationSchemas';
import ModalRegister from '../../shared/components/modal/registerModal/RegisterModal';
import ResetPasswordModal from '../../shared/components/modal/resetPasswordModal/ResetPasswordModal';

const Login = () => {
    // Forzar submit con Enter en cualquier input
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(onSubmit)();
        }
    };
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuth();
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleRegisterClick = () => {
        setIsRegisterModalOpen(true)
    }

    const handleRegisterExit = () => {
        setIsRegisterModalOpen(false);
        reset();
    }

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        watch,
        setValue
    } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onBlur'
    });

    const onSubmit = async (data) => {
        try {
            await login({ ...data, remember: data.remember || false });
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-background list-enter'>
            <div className='w-full max-w-md px-6'>
                <div className='mb-3'>
                    <h1 className='h2 font-medium text-primary'>Inicia sesión</h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' onKeyDown={handleKeyDown}>
                    {error && (
                        <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                            <p className='text-red-600 text-sm'>{error}</p>
                        </div>
                    )}

                    <div className='flex flex-col'>
                        <label htmlFor="email" className='text-secondary subtitle1 mb-1'>
                            Correo electrónico
                        </label>
                        <input type="email" id="email" placeholder='Aqui tu correo' autoComplete="email" {...register('email')} className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.email ? 'border-red-500' : 'border-border'}`} />
                        {errors.email && (
                            <span className='text-red-500 text-sm mt-1'>{errors.email.message}</span>
                        )}
                    </div>

                    <div className='flex flex-col'>
                        <label htmlFor="password" className='text-secondary subtitle1 mb-1'>
                            Contraseña
                        </label>
                        <div className='relative'>
                            <input type={showPassword ? 'text' : 'password'} id="password" placeholder='Aquí tu contraseña' autoComplete="current-password" {...register('password')} className={`w-full input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.password ? 'border-red-500' : 'border-border'}`} />
                            <button type="button" onClick={togglePasswordVisibility} className='absolute right-3 top-6 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors'>
                                <md-icon className='text-base'>
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </md-icon>
                            </button>
                        </div>
                        {errors.password && (
                            <span className='text-red-500 text-sm mt-1'>{errors.password.message}</span>
                        )}

                        <div className='mt-4 flex items-center justify-between'>
                            <label className="flex items-center gap-2 select-none">
                                <md-checkbox
                                    id="remember"
                                    name="remember"
                                    checked={!!watch('remember')}
                                    onInput={e => setValue('remember', e.target.checked)}
                                    label="Recuérdame"
                                    class="accent-primary"
                                ></md-checkbox>
                                <span className="text-secondary text-sm">Recuérdame</span>
                            </label>

                            <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-secondary subtitle2 underline hover:text-primary transition-colors bg-transparent border-none p-0 m-0 cursor-pointer">
                                Olvidé mi contraseña
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <button type="submit" disabled={!isValid || isLoading} className='w-full btn btn-primary font-medium text-subtitle1'>
                            {isLoading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-border mr-2"></div>
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Inicia sesión'
                            )}
                        </button>
                    </div>

                    <div className='pt-1'>
                        <span className='text-secondary subtitle2'>¿No tienes cuenta? </span>
                        <button onClick={handleRegisterClick} className="text-primary subtitle2 underline hover:opacity-80 transition-opacity">
                            Regístrate aquí
                        </button>
                    </div>
                </form>
            </div>
            <ModalRegister
                isOpen={isRegisterModalOpen}
                onClose={handleRegisterExit}
            />
            <ResetPasswordModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
            />
        </div>
    );
};

export default Login;