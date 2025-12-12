import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/checkbox/checkbox.js';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../shared/context/AuthContext';
import { loginSchema } from '../../shared/utils/validationSchemas';
import ModalRegister from './components/registerModal/RegisterModal';
import ResetPasswordModal from './components/resetPasswordModal/ResetPasswordModal';

const Login = () => {
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, isLoading, error, isAuthenticated } =
    useAuth();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const navigate = useNavigate();

  const googleHostRef = useRef(null);
  const googleButtonRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const rememberRef = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleRegisterClick = e => {
    if (e?.preventDefault) e.preventDefault();
    setIsRegisterModalOpen(true);
  };

  const handleRegisterExit = () => {
    setIsRegisterModalOpen(false);
    reset();
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const rememberValue = watch('remember');

  useEffect(() => {
    rememberRef.current = !!rememberValue;
  }, [rememberValue]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const getButtonWidth = () => {
      const width = googleHostRef.current?.clientWidth || 360;
      return Math.max(240, Math.min(420, width));
    };

    const initGoogle = () => {
      if (googleInitializedRef.current) return true;
      const googleObj = window.google;
      if (!googleObj?.accounts?.id) return false;
      if (!googleButtonRef.current) return false;

      const alreadyInitialized = !!window.__enrutappGoogleIdInitialized;

      if (!alreadyInitialized) {
        googleObj.accounts.id.initialize({
          client_id: clientId,
          callback: async response => {
            try {
              await loginWithGoogle({
                idToken: response.credential,
                remember: rememberRef.current,
              });
            } catch {
              // El error se muestra vía AuthContext (error)
            }
          },
        });

        window.__enrutappGoogleIdInitialized = true;
      }

      googleObj.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: getButtonWidth(),
      });

      googleInitializedRef.current = true;
      setIsGoogleReady(true);
      return true;
    };

    if (initGoogle()) return;

    const intervalId = setInterval(() => {
      if (initGoogle()) {
        clearInterval(intervalId);
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [loginWithGoogle]);

  const onSubmit = async data => {
    try {
      await login({ ...data, remember: data.remember || false });
    } catch { }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen relative list-enter overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="/renault-alaskan.jpg"
          alt="Renault Alaskan"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-background z-10"></div>

      <div className="absolute left-0 top-0 bottom-0 w-[50%] flex items-center justify-center p-8 z-20">
        <div className="w-full max-w-md p-8 content-box-outline-auth-small bg-background rounded-2xl shadow-2xl">
          <div className="mb-3">
            <h1 className="h2 font-medium text-primary">Inicia sesión</h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            onKeyDown={handleKeyDown}
          >
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col">
              <label htmlFor="email" className="text-secondary subtitle1 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                placeholder="Aqui tu correo"
                autoComplete="email"
                {...register('email')}
                className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.email ? 'border-red-500' : 'border-border'}`}
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="text-secondary subtitle1 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Aquí tu contraseña"
                  autoComplete="current-password"
                  {...register('password')}
                  className={`w-full px-4 py-3 input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.password ? 'border-red-500' : 'border-border'}`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                >
                  <md-icon className="text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </md-icon>
                </button>
              </div>
              {errors.password && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </span>
              )}

              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 select-none">
                  <md-checkbox
                    id="remember"
                    name="remember"
                    checked={!!rememberValue}
                    onInput={e => setValue('remember', e.target.checked)}
                    label="Recuérdame"
                    class="accent-primary"
                  ></md-checkbox>
                  <span className="text-secondary text-sm">Recuérdame</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-secondary subtitle2 underline hover:text-primary transition-colors bg-transparent border-none p-0 m-0 cursor-pointer"
                >
                  Olvidé mi contraseña
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full btn btn-primary font-medium text-subtitle1 flex items-center justify-center gap-2"
              >
                {isLoading && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {isLoading ? 'Iniciando sesión...' : 'Inicia sesión'}
              </button>
            </div>

            <div>
              <div className="flex items-center gap-3 my-2 pb-2">
                <div className="flex-1 h-px border border-border" />
                <span className="text-secondary text-xs">o</span>
                <div className="flex-1 h-px border border-border" />
              </div>
              <div ref={googleHostRef} className="relative w-full group">
                <button
                  type="button"
                  disabled={!isGoogleReady || isLoading}
                  className="w-full btn btn-secondary font-medium text-subtitle1 flex items-center justify-center gap-2 transition-all duration-150 group-hover:opacity-90 group-hover:-translate-y-px"
                >
                  <img
                    src="/googleIcon.png"
                    alt="Google"
                    className="w-5 h-5 object-contain"
                    draggable={false}
                  />
                  <span>Continuar con Google</span>
                </button>

                <div
                  className={`absolute inset-0 z-10 ${isGoogleReady ? 'opacity-0' : 'opacity-0 pointer-events-none'
                    }`}
                >
                  <div ref={googleButtonRef} className="w-full flex justify-center" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-secondary subtitle2">
                ¿No tienes cuenta?{' '}
              </span>
              <button
                type="button"
                onClick={handleRegisterClick}
                className="text-primary subtitle2 underline hover:opacity-80 transition-opacity"
              >
                Regístrate aquí
              </button>
            </div>
          </form>
        </div>
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
