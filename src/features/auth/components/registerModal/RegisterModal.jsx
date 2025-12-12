import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import '@material/web/progress/linear-progress.js';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../../../shared/context/AuthContext';
import apiClient from '../../../../shared/services/apiService';
import { registerSchema } from '../../../../shared/utils/validationSchemas';
import catalogService from '../../../../shared/services/catalogService';
import useApi from '../../../../shared/hooks/useApi';
import Modal from '../../../../shared/components/modal/Modal';
import AddressAutocomplete from '../../../../shared/components/addressAutocomplete/AddressAutocomplete';

const ModalRegister = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const { register: registerUser, loginWithGoogle, isLoading } = useAuth();
  const [registerError, setRegisterError] = useState('');
  const [step1Loading, setStep1Loading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const navigate = useNavigate();

  const googleHostRef = useRef(null);
  const googleButtonRef = useRef(null);
  const googleRenderedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur',
  });

  const handleClose = () => {
    reset();
    setStep(1);
    setRegisterError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Opción de registro/inicio con Google (usa GIS; el backend crea Cliente y redirige a completar perfil)
  useEffect(() => {
    if (!isOpen) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const getButtonWidth = () => {
      const width = googleHostRef.current?.clientWidth || 360;
      return Math.max(240, Math.min(420, width));
    };

    const initGoogle = () => {
      if (googleRenderedRef.current) return true;
      const googleObj = window.google;
      if (!googleObj?.accounts?.id) return false;
      if (!googleButtonRef.current) return false;

      const alreadyInitialized = !!window.__enrutappGoogleIdInitialized;
      if (!alreadyInitialized) {
        googleObj.accounts.id.initialize({
          client_id: clientId,
          callback: async response => {
            try {
              await loginWithGoogle({ idToken: response.credential, remember: false });
              handleClose();
              navigate('/dashboard', { replace: true });
            } catch {
              // errores vía AuthContext
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

      googleRenderedRef.current = true;
      setIsGoogleReady(true);
      return true;
    };

    if (initGoogle()) return;

    const intervalId = setInterval(() => {
      if (initGoogle()) clearInterval(intervalId);
    }, 250);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, loginWithGoogle]);

  const { data: roles, isLoading: rolesLoading } = useApi(
    catalogService.getRoles,
    []
  );

  const clienteRoleId = useMemo(() => {
    if (!roles || !Array.isArray(roles)) return '';
    const clienteRole = roles.find(
      r => r.nombreRol?.toLowerCase() === 'cliente'
    );
    return clienteRole?.idRol || '';
  }, [roles]);

  const { data: documentTypes, isLoading: docTypesLoading } = useApi(
    catalogService.getDocumentTypes,
    []
  );

  const { data: cities, isLoading: citiesLoading } = useApi(
    catalogService.getCities,
    []
  );

  const onSubmit = async data => {
    setRegisterError('');

    if (!data.roleId) {
      data.roleId = clienteRoleId;
    }

    if (!data.roleId || data.roleId.trim() === '') {
      setRegisterError(
        'No se pudo obtener el rol de Cliente. Por favor, recarga la página.'
      );
      return;
    }
    if (!data.documentType || data.documentType.trim() === '') {
      setRegisterError('Por favor, selecciona un tipo de documento.');
      return;
    }

    if (data.idCiudad) {
      data.idCiudad = Number(data.idCiudad);
    }

    try {
      const response = await registerUser(data);
      if (response.success) {
        alert('Registro exitoso. Ya puedes iniciar sesión.');
        if (typeof onClose === 'function') {
          onClose();
        }
        navigate('/login');
      } else if (response.message) {
        setRegisterError(response.message);
      } else {
        setRegisterError('No se pudo registrar el usuario.');
      }
    } catch (error) {
      setRegisterError(error?.message || 'No se pudo registrar el usuario.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <main className="p-5 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
        <div className="absolute left-5 top-4 z-20">
          <button
            onClick={handleClose}
            className="text-secondary p-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Cerrar"
          >
            <md-icon className="text-base">close</md-icon>
          </button>
        </div>
        <div className="w-full max-w-md mx-auto px-0 flex flex-col min-h-[500px] justify-center transition-all duration-300">
          <div className="flex flex-col mb-2">
            <div className="flex items-center gap-2 mb-5 bg-fill rounded-lg p-2 border border-border w-fit mx-auto">
              <img src="/favicon.ico" alt="Enrutapp" className="w-7 h-7" />
              <h1 className="body2 font-semibold text-primary text-2xl leading-tight mb-1">
                Enrutapp
              </h1>
            </div>
            <h1 className="h2 font-semibold text-primary text-2xl leading-tight mb-1">
              Registrate
            </h1>
            <p className="font-normal text-secondary text-sm mb-2">
              Ingresa tus datos para registrarte.
            </p>
          </div>

          <div className="flex items-center gap-2 justify-center mb-2">
            <md-linear-progress
              indeterminate={false}
              value={step === 1 ? 0 : step === 2 ? 0.5 : 1}
              style={{
                flex: 1,
                borderRadius: 10,
                '--md-sys-color-primary': 'var(--primary)',
              }}
            ></md-linear-progress>
            <span className="text-secondary text-xs min-w-max">
              Paso {step} de 3
            </span>
          </div>

          {registerError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs mb-2 text-center">
              {registerError}
            </div>
          )}
          <form
            className="flex flex-col w-full gap-y-3 transition-all duration-300"
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            {step === 1 && (
              <div
                className="flex flex-col gap-2 list-enter"
                onKeyDown={async e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setRegisterError('');
                    const valid = await trigger([
                      'email',
                      'documentType',
                      'documentNumber',
                    ]);
                    if (!valid) return;
                    setStep1Loading(true);
                    try {
                      const email = watch('email');
                      const documentType = watch('documentType');
                      const documentNumber = watch('documentNumber');
                      const emailRes = await apiClient.get(
                        `/usuarios/check-email/${email}`
                      );
                      if (emailRes.exists) {
                        setRegisterError(
                          'El correo electrónico ya está registrado.'
                        );
                        setStep1Loading(false);
                        return;
                      }
                      const docRes = await apiClient.get(
                        `/usuarios/check-document/${documentType}/${documentNumber}`
                      );
                      if (docRes.exists) {
                        setRegisterError('El documento ya está registrado.');
                        setStep1Loading(false);
                        return;
                      }
                      setStep(2);
                    } catch {
                      setRegisterError('Error validando correo o documento.');
                    } finally {
                      setStep1Loading(false);
                    }
                  }
                }}
              >
                <div className="flex flex-col w-full mx-auto max-w-md">
                  <label
                    htmlFor="email"
                    className="text-secondary subtitle1 mb-1"
                  >
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Aqui tu correo"
                    {...register('email')}
                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.email ? 'border-red-500' : 'border-border'}`}
                    aria-label="Correo electrónico"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <span
                      id="email-error"
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full mx-auto max-w-md">
                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="documentType"
                      className="text-secondary subtitle1 mb-1"
                    >
                      Documento
                    </label>
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        id="documentType"
                        {...register('documentType')}
                        className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                        disabled={docTypesLoading}
                        aria-label="Tipo de documento"
                        aria-invalid={!!errors.documentType}
                        aria-describedby={
                          errors.documentType ? 'documentType-error' : undefined
                        }
                      >
                        <option value="">Selecciona el documento</option>
                        {documentTypes?.map(docType => (
                          <option
                            key={docType.idTipoDoc}
                            value={docType.idTipoDoc}
                          >
                            {docType.nombreTipoDoc}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.documentType && (
                      <span
                        id="documentType-error"
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.documentType.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col w-full">
                    <input
                      type="text"
                      id="documentNumber"
                      placeholder="Aqui el numero de documento"
                      {...register('documentNumber')}
                      className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.documentNumber ? 'border-red-500' : 'border-border'}`}
                      aria-label="Número de documento"
                      aria-invalid={!!errors.documentNumber}
                      aria-describedby={
                        errors.documentNumber
                          ? 'documentNumber-error'
                          : undefined
                      }
                    />
                    {errors.documentNumber && (
                      <span
                        id="documentNumber-error"
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.documentNumber.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-end items-center w-full mx-auto max-w-md gap-3">
                  <button
                    type="button"
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                    disabled={step1Loading}
                    onClick={async () => {
                      setRegisterError('');
                      const valid = await trigger([
                        'email',
                        'documentType',
                        'documentNumber',
                      ]);
                      if (!valid) return;
                      setStep1Loading(true);
                      try {
                        const email = watch('email');
                        const documentType = watch('documentType');
                        const documentNumber = watch('documentNumber');
                        const emailRes = await apiClient.get(
                          `/usuarios/check-email/${email}`
                        );
                        if (emailRes.exists) {
                          setRegisterError(
                            'El correo electrónico ya está registrado.'
                          );
                          setStep1Loading(false);
                          return;
                        }
                        const docRes = await apiClient.get(
                          `/usuarios/check-document/${documentType}/${documentNumber}`
                        );
                        if (docRes.exists) {
                          setRegisterError('El documento ya está registrado.');
                          setStep1Loading(false);
                          return;
                        }
                        setStep(2);
                      } catch {
                        setRegisterError('Error validando correo o documento.');
                      } finally {
                        setStep1Loading(false);
                      }
                    }}
                  >
                    {step1Loading && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {step1Loading ? 'Validando...' : 'Siguiente'}
                  </button>

                  <div className="flex items-center gap-3 w-full">
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
                      {isLoading && (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                    </button>

                    <div
                      className={`absolute inset-0 z-10 ${isGoogleReady ? 'opacity-0' : 'opacity-0 pointer-events-none'
                        }`}
                    >
                      <div
                        ref={googleButtonRef}
                        className="w-full flex justify-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div
                className="flex flex-col gap-1 list-enter"
                onKeyDown={async e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const valid = await trigger([
                      'name',
                      'phone',
                      'city',
                      'address',
                      'roleId',
                    ]);
                    if (valid) {
                      setStep(3);
                    }
                  }
                }}
              >
                <div className="flex flex-col w-full mx-auto max-w-md">
                  <label
                    htmlFor="name"
                    className="text-secondary subtitle1 mb-1"
                  >
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Aquí tu nombre"
                    {...register('name')}
                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.name ? 'border-red-500' : 'border-border'}`}
                    aria-label="Nombre completo"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && (
                    <span id="name-error" className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col w-full mx-auto max-w-md">
                  <label
                    htmlFor="phone"
                    className="text-secondary subtitle1 mb-1"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Aqui tu teléfono"
                    {...register('phone')}
                    onChange={e => {
                      const val = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);
                      setValue('phone', val, { shouldValidate: true });
                    }}
                    className={`w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.phone ? 'border-red-500' : 'border-border'}`}
                    aria-label="Teléfono"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <span
                      id="phone-error"
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.phone.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full mx-auto max-w-md">
                  <div className="flex flex-col w-full mx-auto max-w-md">
                    <label
                      htmlFor="idCiudad"
                      className="text-secondary subtitle1 mb-1"
                    >
                      Ciudad *
                    </label>
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        id="idCiudad"
                        {...register('idCiudad')}
                        className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                        disabled={citiesLoading}
                        aria-label="Ciudad"
                        aria-invalid={!!errors.idCiudad}
                        aria-describedby={
                          errors.idCiudad ? 'idCiudad-error' : undefined
                        }
                      >
                        <option value="">Selecciona la ciudad</option>
                        {cities?.map(city => (
                          <option
                            key={city.idCiudad}
                            value={String(city.idCiudad)}
                          >
                            {city.nombreCiudad}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.idCiudad && (
                      <span
                        id="idCiudad-error"
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.idCiudad.message}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col w-full mx-auto max-w-md">
                    <div className="relative">
                      <AddressAutocomplete
                        value={watch('address') || ''}
                        onChange={val =>
                          setValue('address', val, { shouldValidate: true })
                        }
                        onSelect={data =>
                          setValue('address', data.address, {
                            shouldValidate: true,
                          })
                        }
                        placeholder="Aquí tu dirección"
                        country="co"
                      />
                    </div>
                    <input type="hidden" {...register('address')} />
                    {errors.address && (
                      <span
                        id="address-error"
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.address.message}
                      </span>
                    )}
                  </div>
                </div>

                <input
                  type="hidden"
                  value={clienteRoleId}
                  {...register('roleId')}
                />

                <div className="flex justify-between items-center gap-2 pt-2 w-full mx-auto max-w-md">
                  <button
                    type="button"
                    className="btn btn-secondary w-1/2"
                    onClick={() => setStep(1)}
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    disabled={isLoading || rolesLoading || docTypesLoading}
                    className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2"
                    onClick={async () => {
                      const valid = await trigger([
                        'name',
                        'phone',
                        'city',
                        'address',
                        'roleId',
                      ]);
                      if (valid) {
                        setStep(3);
                      }
                    }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="flex flex-col gap-2 list-enter">
                <div className="flex flex-col gap-4 flex-1 justify-center w-full mx-auto max-w-md">
                  <div className="flex flex-col w-full mx-auto max-w-md">
                    <label
                      htmlFor="password"
                      className="text-secondary subtitle1 mb-1"
                    >
                      Contraseña *
                    </label>
                    <div className="relative mb-2 w-full">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="Aqui tu contraseña"
                        autoComplete="new-password"
                        {...register('password')}
                        className={`w-full input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.password ? 'border-red-500' : 'border-border'}`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-6 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                      >
                        <md-icon className="text-base">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </md-icon>
                      </button>
                    </div>

                    <div className="relative w-full">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        placeholder="Repite tu contraseña"
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                        className={`w-full input pr-12 bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-border'}`}
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute right-3 top-6 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                      >
                        <md-icon className="text-base">
                          {showConfirmPassword
                            ? 'visibility_off'
                            : 'visibility'}
                        </md-icon>
                      </button>
                    </div>

                    {errors.password && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </span>
                    )}
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2 pt-2 w-full mx-auto max-w-md">
                  <button
                    type="button"
                    className="btn btn-secondary w-1/2"
                    onClick={() => setStep(2)}
                  >
                    Anterior
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                  >
                    {isLoading && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </Modal>
  );
};

export default ModalRegister;
