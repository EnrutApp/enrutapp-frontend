import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import { changePasswordSchema } from '../../utils/validationSchemas';

const ChangePassword = ({ isOpen, onClose }) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { changePassword, error, clearError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        reset
    } = useForm({
        resolver: yupResolver(changePasswordSchema),
        mode: 'onChange'
    });

    const onSubmit = async (data) => {
        setSuccessMessage('');
        clearError();

        try {
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            setSuccessMessage('Contraseña cambiada exitosamente');
            reset();

            setTimeout(() => {
                setSuccessMessage('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Password change failed:', error);
        }
    };

    const handleClose = () => {
        reset();
        setSuccessMessage('');
        clearError();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="h3 font-medium text-primary">Cambiar Contraseña</h2>
                        <button
                            onClick={handleClose}
                            className="text-secondary hover:text-primary transition-colors"
                        >
                            <md-icon>close</md-icon>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                                <p className='text-red-600 text-sm'>{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                                <p className='text-green-600 text-sm'>{successMessage}</p>
                            </div>
                        )}

                        <div className='flex flex-col'>
                            <label htmlFor="currentPassword" className='text-secondary subtitle1 mb-1'>
                                Contraseña actual *
                            </label>
                            <div className='relative'>
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    id="currentPassword"
                                    placeholder='Tu contraseña actual'
                                    autoComplete="current-password"
                                    {...register('currentPassword')}
                                    className={`w-full input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.currentPassword ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors'
                                >
                                    <md-icon>
                                        {showCurrentPassword ? 'visibility_off' : 'visibility'}
                                    </md-icon>
                                </button>
                            </div>
                            {errors.currentPassword && (
                                <span className='text-red-500 text-sm mt-1'>{errors.currentPassword.message}</span>
                            )}
                        </div>

                        <div className='flex flex-col'>
                            <label htmlFor="newPassword" className='text-secondary subtitle1 mb-1'>
                                Nueva contraseña *
                            </label>
                            <div className='relative'>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    placeholder='Tu nueva contraseña'
                                    autoComplete="new-password"
                                    {...register('newPassword')}
                                    className={`w-full input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.newPassword ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors'
                                >
                                    <md-icon>
                                        {showNewPassword ? 'visibility_off' : 'visibility'}
                                    </md-icon>
                                </button>
                            </div>
                            {errors.newPassword && (
                                <span className='text-red-500 text-sm mt-1'>{errors.newPassword.message}</span>
                            )}
                        </div>

                        <div className='flex flex-col'>
                            <label htmlFor="confirmNewPassword" className='text-secondary subtitle1 mb-1'>
                                Confirmar nueva contraseña *
                            </label>
                            <div className='relative'>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmNewPassword"
                                    placeholder='Repite tu nueva contraseña'
                                    autoComplete="new-password"
                                    {...register('confirmNewPassword')}
                                    className={`w-full input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.confirmNewPassword ? 'border-red-500' : 'border-border'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors'
                                >
                                    <md-icon>
                                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                    </md-icon>
                                </button>
                            </div>
                            {errors.confirmNewPassword && (
                                <span className='text-red-500 text-sm mt-1'>{errors.confirmNewPassword.message}</span>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 btn btn-secondary py-2 font-medium text-subtitle2"
                            >
                                Cancelar
                            </button>
                            <md-filled-button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="flex-1 btn btn-primary py-2 font-medium text-subtitle2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                        Cambiando...
                                    </>
                                ) : (
                                    'Cambiar contraseña'
                                )}
                            </md-filled-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
