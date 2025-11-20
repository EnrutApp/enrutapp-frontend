import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../../../shared/services/apiService';
import Modal from '../../../../shared/components/modal/Modal';
import '@material/web/icon/icon.js';

export const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial'
    )
    .required('La nueva contraseña es obligatoria'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Las contraseñas deben coincidir')
    .required('Confirmar nueva contraseña es obligatorio'),
});

const ResetPasswordModal = ({ isOpen, onClose }) => {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [step, setStep] = useState(1);
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [codigoValidado, setCodigoValidado] = useState(false);
  const [restablecido, setRestablecido] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState('');
  const [mensajeCodigo, setMensajeCodigo] = useState('');
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setEnviando(true);
    try {
      await api.post('/auth/forgot-password', { correo });
      setMensaje('Código enviado a tu correo.');
      setMostrarCodigo(true);
      setStep(2);
    } catch (err) {
      setError(err?.message || 'Error al enviar el código');
    } finally {
      setEnviando(false);
    }
  };

  const handleValidarCodigo = e => {
    e.preventDefault();
    setErrorCodigo('');
    setMensajeCodigo('');
    if (code.some(c => !c)) {
      setErrorCodigo('Debes ingresar el código completo');
      return;
    }
    setCodigoValidado(true);
    setStep(3);
  };

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: errorsForm },
    reset,
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClose = () => {
    setCorreo('');
    setMensaje('');
    setError('');
    setEnviando(false);
    setStep(1);
    setMostrarCodigo(false);
    setCode(['', '', '', '', '', '']);
    setCodigoValidado(false);
    setRestablecido(false);
    setErrorCodigo('');
    setMensajeCodigo('');
    setEnviandoCodigo(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    reset();
    if (typeof onClose === 'function') onClose();
  };

  const handleRestablecer = async data => {
    setErrorCodigo('');
    setMensajeCodigo('');
    setEnviandoCodigo(true);
    try {
      const codeValue = code.join('');
      await api.post('/auth/reset-password', {
        code: codeValue,
        newPassword: data.newPassword,
      });
      setRestablecido(true);
      setMensajeCodigo('¡Contraseña restablecida correctamente!');
    } catch (err) {
      setErrorCodigo(err?.message || 'Error al restablecer la contraseña');
    } finally {
      setEnviandoCodigo(false);
    }
  };

  const handleCodeInput = (e, idx) => {
    const val = e.target.value.replace(/[^0-9]/g, '');

    if (val.length === 6) {
      const arr = val.split('').slice(0, 6);
      setCode(arr);

      codeRefs[5].current?.focus();
      return;
    }

    const digit = val.slice(0, 1);
    const newCode = [...code];
    newCode[idx] = digit;
    setCode(newCode);

    if (digit && idx < 5) {
      codeRefs[idx + 1].current?.focus();
    }
    if (
      !digit &&
      idx > 0 &&
      e.nativeEvent.inputType === 'deleteContentBackward'
    ) {
      codeRefs[idx - 1].current?.focus();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="p-3 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
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
          {!restablecido && (
            <div className="list-enter">
              <div className="flex flex-col mb-2">
                <h1 className="h2 font-semibold text-primary text-2xl leading-tight mb-1">
                  Restablecer contraseña
                </h1>
                <p className="font-normal text-secondary text-sm mb-2">
                  Ingresa tus datos para restablecer tu contraseña.
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
            </div>
          )}

          {step === 1 && !restablecido && (
            <form className="space-y-4 list-enter" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label
                  htmlFor="documento"
                  className="text-secondary subtitle1 mb-1"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="documento"
                  placeholder="Aquí tu correo"
                  className="w-full px-4 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-red-600">{error}</div>}
              {mensaje && (
                <div className="text-green-600 text-center">{mensaje}</div>
              )}
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full btn btn-primary py-3 font-medium text-subtitle1 flex items-center justify-center gap-2"
                  disabled={enviando}
                >
                  {enviando && (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {enviando ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && !restablecido && (
            <form
              className="space-y-4 list-enter"
              onSubmit={handleValidarCodigo}
            >
              <div className="flex flex-col">
                <label className="text-secondary subtitle1 mb-1">
                  Código recibido
                </label>
                <div className="flex gap-2">
                  {code.map((val, idx) => (
                    <input
                      key={idx}
                      ref={codeRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-full h-12 flex items-center justify-center text-center text-xl input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                      value={val}
                      onChange={e => handleCodeInput(e, idx)}
                      onPaste={e => {
                        const pasted = e.clipboardData
                          .getData('Text')
                          .replace(/[^0-9]/g, '');
                        if (pasted.length === 6) {
                          e.preventDefault();
                          setCode(pasted.split('').slice(0, 6));
                          codeRefs[5].current?.focus();
                        }
                      }}
                      onFocus={e => e.target.select()}
                      required
                    />
                  ))}
                </div>
              </div>
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full btn btn-primary py-3 font-medium text-subtitle1"
                  disabled={code.some(c => !c)}
                >
                  Verificar
                </button>
              </div>
              {errorCodigo && (
                <div className="text-red-600 text-center">{errorCodigo}</div>
              )}
            </form>
          )}

          {step === 3 && !restablecido && (
            <form
              className="space-y-4"
              onSubmit={handleSubmitForm(handleRestablecer)}
            >
              <div className="flex flex-col relative">
                <label
                  htmlFor="newPassword"
                  className="text-secondary subtitle1 mb-1"
                >
                  Nueva contraseña
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  placeholder="Nueva contraseña"
                  className="w-full px-4 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors pr-10"
                  {...registerForm('newPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-13 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  <md-icon className="text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </md-icon>
                </button>
                {errorsForm.newPassword && (
                  <span className="text-red-500 text-sm mt-1">
                    {errorsForm.newPassword.message}
                  </span>
                )}
              </div>
              <div className="flex flex-col relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Repite la contraseña"
                  className="w-full px-4 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                  {...registerForm('confirmPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-6 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  <md-icon className="text-base">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </md-icon>
                </button>
                {errorsForm.confirmPassword && (
                  <span className="text-red-500 text-sm mt-1">
                    {errorsForm.confirmPassword.message}
                  </span>
                )}
              </div>
              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full btn btn-primary py-3 font-medium text-subtitle1 flex items-center justify-center gap-2"
                  disabled={enviandoCodigo}
                >
                  {enviandoCodigo && (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {enviandoCodigo ? 'Restableciendo...' : 'Restablecer'}
                </button>
              </div>
              {mensajeCodigo && (
                <div className="text-green-600 text-center">
                  {mensajeCodigo}
                </div>
              )}
              {errorCodigo && (
                <div className="text-red-600 ">{errorCodigo}</div>
              )}
            </form>
          )}

          {restablecido && (
            <div className="flex flex-col items-center gap-2 justify-center text-center list-enter">
              <md-icon
                style={{
                  fontSize: '50px',
                  height: '96px',
                  width: '96px',
                  display: 'block',
                }}
              >
                check_circle
              </md-icon>
              <h1 className="h3">¡Contraseña restablecida correctamente!</h1>
              <p className="text-secondary">
                Tu contraseña ha sido restablecida correctamente. Ahora puedes
                iniciar sesión utilizando tus nuevas credenciales.
              </p>
              <button
                className="w-full text-primary btn btn-primary block mt-2"
                onClick={handleClose}
              >
                Ir a iniciar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;
