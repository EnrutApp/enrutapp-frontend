import '@material/web/icon/icon.js';
import '@material/web/progress/linear-progress.js';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../../../shared/context/AuthContext';
import { changePasswordSchema } from '../../../../shared/utils/validationSchemas';
import Modal from '../../../../shared/components/modal/Modal';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { changePassword, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async data => {
    setSuccessMessage('');
    clearError();

    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      setSuccessMessage('Contraseña cambiada exitosamente');
      reset();

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch {}
  };

  const handleClose = () => {
    reset();
    setSuccessMessage('');
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <main className="relative">
        {isSubmitting && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-1 mb-4">
            <button
              type="button"
              onClick={handleClose}
              className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              <md-icon className="text-xl flex items-center justify-center">
                close
              </md-icon>
            </button>
          </div>

          <div className="px-4">
            <div className="leading-tight mb-6">
              <h2 className="h2 font-medium text-primary">
                Cambiar contraseña
              </h2>
              <p className="h5 text-secondary font-medium">
                Actualiza tu contraseña de acceso
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red/10 border border-red/30 rounded-lg p-3">
                  <p className="text-red text-sm">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="bg-green/10 border border-green/30 rounded-lg p-3">
                  <p className="text-green text-sm">{successMessage}</p>
                </div>
              )}

              {successMessage && (
                <div className="bg-green/10 border border-green/30 rounded-lg p-3">
                  <p className="text-green text-sm">{successMessage}</p>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="currentPassword"
                  className="subtitle1 text-primary font-medium"
                >
                  Contraseña actual <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    placeholder="Tu contraseña actual"
                    autoComplete="current-password"
                    {...register('currentPassword')}
                    className={`w-full px-4 py-3 input bg-fill pr-12 border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${
                      errors.currentPassword
                        ? 'border-red focus:ring-red/20 focus:border-red'
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                    disabled={isSubmitting}
                  >
                    <md-icon className="text-lg">
                      {showCurrentPassword ? 'visibility_off' : 'visibility'}
                    </md-icon>
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="text-red text-sm mt-1">
                    {errors.currentPassword.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="newPassword"
                  className="subtitle1 text-primary font-medium"
                >
                  Nueva contraseña <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder="Tu nueva contraseña"
                    autoComplete="new-password"
                    {...register('newPassword')}
                    className={`w-full px-4 py-3 input bg-fill pr-12 border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${
                      errors.newPassword
                        ? 'border-red focus:ring-red/20 focus:border-red'
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                    disabled={isSubmitting}
                  >
                    <md-icon className="text-lg">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </md-icon>
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="text-red text-sm mt-1">
                    {errors.newPassword.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="confirmNewPassword"
                  className="subtitle1 text-primary font-medium"
                >
                  Confirmar contraseña <span className="text-red">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmNewPassword"
                    placeholder="Repite tu nueva contraseña"
                    autoComplete="new-password"
                    {...register('confirmNewPassword')}
                    className={`w-full px-4 py-3 input bg-fill pr-12 border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmNewPassword
                        ? 'border-red focus:ring-red/20 focus:border-red'
                        : 'border-border focus:ring-primary/20 focus:border-primary'
                    }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                    disabled={isSubmitting}
                  >
                    <md-icon className="text-lg">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </md-icon>
                  </button>
                </div>
                {errors.confirmNewPassword && (
                  <span className="text-red text-sm mt-1">
                    {errors.confirmNewPassword.message}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-secondary w-1/2"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isSubmitting ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </Modal>
  );
};

export default ChangePasswordModal;
