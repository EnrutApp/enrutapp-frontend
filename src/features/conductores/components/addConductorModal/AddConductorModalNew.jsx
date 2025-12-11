import Modal from '../../../../shared/components/modal/Modal';
import AddressAutocomplete from '../../../../shared/components/addressAutocomplete/AddressAutocomplete';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import { useState, useEffect } from 'react';
import { obtenerCategoriasLicencia } from '../../../../shared/services/categoriasLicenciaApi';
import apiClient from '../../../../shared/services/apiService';
import conductorService from '../../api/conductorService';

export default function AddConductorModalNew({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(1);
  const [completionMode, setCompletionMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    correo: '',
    numDocumento: '',
    telefono: '',
    direccion: '',
    idCiudad: '',
    tipoDoc: '',
  });

  const [generatedPassword, setGeneratedPassword] = useState(null);

  const [licencia, setLicencia] = useState({
    idCategoriaLicencia: '',
    fechaVencimientoLicencia: '',
    observaciones: '',
  });

  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);

  useEffect(() => {
    if (isOpen) {
      cargarDatosIniciales();
    } else {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setMode(null);
    setStep(1);
    setCompletionMode(null);
    setError(null);
    setNuevoUsuario({
      nombre: '',
      correo: '',
      numDocumento: '',
      telefono: '',
      direccion: '',
      idCiudad: '',
      tipoDoc: '',
    });
    setLicencia({
      idCategoriaLicencia: '',
      fechaVencimientoLicencia: '',
      observaciones: '',
    });
    setUsuarioSeleccionado(null);
    setGeneratedPassword(null);
  };

  const handleAddressSelect = addressData => {
    if (addressData) {
      setNuevoUsuario(prev => ({ ...prev, direccion: addressData.address }));
    }
  };

  const handleAddressChange = newAddress => {
    setNuevoUsuario(prev => ({ ...prev, direccion: newAddress }));
  };

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);

      const responseCategorias = await obtenerCategoriasLicencia();
      setCategorias(responseCategorias.data || responseCategorias || []);

      const responseCiudades = await apiClient.get('/ciudades');
      setCiudades(responseCiudades.data?.data || responseCiudades.data || []);

      const responseTipos = await apiClient.get('/tipos-documento');
      const tiposData = responseTipos.data?.data || responseTipos.data || [];
      console.log('Tipos de documento cargados:', tiposData);
      setTiposDocumento(tiposData);

      const responseUsuarios = await apiClient.get('/usuarios');
      const todosUsuarios =
        responseUsuarios.data?.data || responseUsuarios.data || [];

      const responseConductores = await conductorService.getConductores();
      const conductoresConPerfil = responseConductores.data || [];

      const usuariosSinPerfil = todosUsuarios.filter(u => {
        const esConductor = u.rol?.nombreRol === 'Conductor';
        const tienePerfil = conductoresConPerfil.some(
          c => c.idUsuario === u.idUsuario && c.numeroLicencia
        );
        return esConductor && !tienePerfil;
      });

      setUsuariosDisponibles(usuariosSinPerfil);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const generarPasswordAleatoria = (length = 10) => {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleCrearNuevoConductor = async () => {
    try {
      setLoading(true);
      setError(null);

      const password = generarPasswordAleatoria(10);
      setGeneratedPassword(password);

      const idRolConductor = await obtenerIdRolConductor();

      const responseUsuario = await apiClient.post('/usuarios', {
        nombre: nuevoUsuario.nombre.trim(),
        correo: nuevoUsuario.correo.trim(),
        contrasena: password,
        tipoDoc: nuevoUsuario.tipoDoc.trim(),
        numDocumento: nuevoUsuario.numDocumento.trim(),
        telefono: nuevoUsuario.telefono.trim(),
        direccion: nuevoUsuario.direccion.trim(),
        idCiudad: parseInt(nuevoUsuario.idCiudad),
        idRol: idRolConductor.trim(),
        estado: true,
      });

      if (!responseUsuario?.success) {
        throw new Error(responseUsuario?.message || 'Error al crear usuario');
      }

      const idUsuario = responseUsuario.data.idUsuario;

      if (completionMode === 'invite') {
        onSuccess();
        onClose();
        return;
      }

      const responseConductor = await conductorService.createConductor({
        idUsuario,
        numeroLicencia: nuevoUsuario.numDocumento,
        ...licencia,
      });

      if (!responseConductor.success) {
        throw new Error(responseConductor.error || 'Error al crear conductor');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al crear conductor:', error);

      let errorMessage = 'Error al crear el conductor';

      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;

        if (
          backendMessage.includes('Unique constraint failed') &&
          backendMessage.includes('correo')
        ) {
          errorMessage =
            'El correo electrónico ya está registrado. Por favor, usa otro correo.';
        } else if (
          backendMessage.includes('Unique constraint failed') &&
          backendMessage.includes('numDocumento')
        ) {
          errorMessage =
            'El número de documento ya está registrado en el sistema.';
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      if (completionMode === 'invite') {
        setStep(3);
        setCompletionMode(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarPerfilExistente = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await conductorService.createConductor({
        idUsuario: usuarioSeleccionado.idUsuario,
        numeroLicencia: usuarioSeleccionado.numDocumento,
        ...licencia,
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al completar perfil');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al completar perfil:', error);
      setError(error.message || 'Error al completar el perfil del conductor');
    } finally {
      setLoading(false);
    }
  };

  const obtenerIdRolConductor = async () => {
    const responseRoles = await apiClient.get('/roles');
    const roles = responseRoles.data?.data || responseRoles.data || [];
    const rolConductor = roles.find(r => r.nombreRol === 'Conductor');
    return rolConductor?.idRol;
  };

  const validarPaso1 = async () => {
    try {
      setLoading(true);
      setError(null);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nuevoUsuario.correo)) {
        setError('Por favor, ingresa un correo electrónico válido');
        return false;
      }

      const responseUsuarios = await apiClient.get('/usuarios');
      const todosUsuarios =
        responseUsuarios.data?.data || responseUsuarios.data || [];

      const correoExiste = todosUsuarios.some(
        u => u.correo.toLowerCase() === nuevoUsuario.correo.toLowerCase()
      );

      if (correoExiste) {
        setError(
          'El correo electrónico ya está registrado. Por favor, usa otro correo.'
        );
        return false;
      }

      const documentoExiste = todosUsuarios.some(
        u =>
          u.numDocumento === nuevoUsuario.numDocumento &&
          u.tipoDoc === nuevoUsuario.tipoDoc
      );

      if (documentoExiste) {
        setError('El número de documento ya está registrado en el sistema.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al validar:', error);
      setError('Error al validar los datos. Por favor, intenta nuevamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const renderSeleccionModo = () => (
    <div className="flex flex-col gap-4">
      <div className="leading-tight mb-6">
        <h2 className="h2 font-medium text-primary">Agregar Conductor</h2>
        <p className="h5 text-secondary font-medium">
          Selecciona cómo deseas agregar el conductor
        </p>
      </div>

      <button
        onClick={() => setMode('new')}
        className="p-6 content-box-outline-6-small hover:border-primary rounded-xl transition-all hover:shadow-md text-left group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center group-hover:bg-primary/20 transition-colors">
            <md-icon className="text-blue text-xl">person_add</md-icon>
          </div>
          <div className="flex flex-col">
            <h3 className="subtitle1 font-normal text-primary ">
              Crear nuevo usuario conductor
            </h3>
            <p className="text-secondary text-sm">
              Registra un nuevo usuario con rol de conductor y configura sus
              datos de licencia en un solo proceso
            </p>
          </div>
          <md-icon className="text-secondary text-lg">call_made</md-icon>
        </div>
      </button>

      {usuariosDisponibles.length > 0 && (
        <button
          onClick={() => setMode('existing')}
          className="p-6 content-box-outline-6-small hover:border-primary rounded-xl transition-all hover:shadow-md text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center group-hover:bg-primary/20 transition-colors">
              <md-icon className="text-blue text-xl">assignment_ind</md-icon>
            </div>
            <div className="flex flex-col gap-4 justify-between">
              <div className="flex-col">
                <h3 className="subtitle1 font-normal text-primary ">
                  Completar perfil de usuario existente
                </h3>
                <p className="text-secondary text-sm">
                  Selecciona un usuario con rol conductor y completa su
                  información de licencia
                </p>
              </div>

              <p className="bg-background border border-border rounded-full text-xs shadow-2xl px-5 py-2 w-max max-w-xs">
                {usuariosDisponibles.length} usuario
                {usuariosDisponibles.length !== 1 ? 's' : ''} disponible
                {usuariosDisponibles.length !== 1 ? 's' : ''}
              </p>
            </div>
            <md-icon className="text-secondary text-lg">call_made</md-icon>
          </div>
        </button>
      )}

      {usuariosDisponibles.length === 0 && (
        <div className="p-4 bg-fill border border-border rounded-lg">
          <p className="text-secondary text-sm text-center">
            No hay usuarios con rol conductor pendientes de completar perfil
          </p>
        </div>
      )}
    </div>
  );

  const renderStep1Usuario = () => (
    <div className="flex flex-col list-enter gap-4">
      <div className="leading-tight mb-6">
        <h2 className="h2 font-medium text-primary">Crear Conductor</h2>
        <p className="h5 text-secondary font-medium">Identificación y acceso</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(stepNum => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`
                                flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 transform
                                ${
                                  step >= stepNum
                                    ? 'bg-primary text-on-primary shadow-md scale-110 ring-4 ring-primary/20'
                                    : 'bg-fill text-secondary scale-100'
                                }
                                ${step === stepNum ? 'animate-pulse' : ''}
                                font-semibold
                            `}
            >
              {step > stepNum ? (
                <md-icon className="text-base">check</md-icon>
              ) : (
                stepNum
              )}
            </div>
            {stepNum < 3 && (
              <div
                className={`h-1 w-16 transition-all duration-300 ${step > stepNum ? 'bg-primary' : 'bg-fill'}`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Tipo de documento <span className="text-red">*</span>
          </label>
          <div className="select-wrapper">
            <md-icon className="text-sm">arrow_drop_down</md-icon>
            <select
              value={nuevoUsuario.tipoDoc}
              onChange={e =>
                setNuevoUsuario({ ...nuevoUsuario, tipoDoc: e.target.value })
              }
              className="select-filter w-full px-4 input bg-fill border border-border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
            >
              <option value="">Selecciona</option>
              {tiposDocumento.map(tipo => (
                <option key={tipo.idTipoDoc} value={tipo.idTipoDoc}>
                  {tipo.nombreTipoDoc}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Número de documento <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={nuevoUsuario.numDocumento}
            onChange={e =>
              setNuevoUsuario({ ...nuevoUsuario, numDocumento: e.target.value })
            }
            className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="Número de documento"
            disabled={loading}
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Correo electrónico <span className="text-red">*</span>
          </label>
          <input
            type="email"
            value={nuevoUsuario.correo}
            onChange={e =>
              setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })
            }
            className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="correo@ejemplo.com"
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red/10 border border-red/30 rounded-lg p-3 mt-4">
          <p className="text-red text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center gap-2 pt-2">
        <button
          onClick={() => setMode(null)}
          className="btn w-full btn-secondary px-6"
          disabled={loading}
        >
          Atrás
        </button>
        <button
          onClick={async () => {
            const esValido = await validarPaso1();
            if (esValido) {
              setStep(2);
            }
          }}
          className="btn btn-primary w-full px-8 flex items-center justify-center gap-2"
          disabled={
            loading ||
            !nuevoUsuario.tipoDoc ||
            !nuevoUsuario.numDocumento ||
            !nuevoUsuario.correo
          }
        >
          {loading && (
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {loading ? 'Validando...' : 'Siguiente'}
        </button>
      </div>
    </div>
  );

  const renderStep2Usuario = () => (
    <div className="flex flex-col list-enter gap-4">
      <div className="leading-tight mb-6">
        <h2 className="h2 font-medium text-primary">Crear Conductor</h2>
        <p className="h5 text-secondary font-medium">
          Información personal y contacto
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(stepNum => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`
                                flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 transform
                                ${
                                  step >= stepNum
                                    ? 'bg-primary text-on-primary shadow-md scale-110 ring-4 ring-primary/20'
                                    : 'bg-fill text-secondary scale-100'
                                }
                                ${step === stepNum ? 'animate-pulse' : ''}
                                font-semibold
                            `}
            >
              {step > stepNum ? (
                <md-icon className="text-base">check</md-icon>
              ) : (
                stepNum
              )}
            </div>
            {stepNum < 3 && (
              <div
                className={`h-1 w-16 transition-all duration-300 ${step > stepNum ? 'bg-primary' : 'bg-fill'}`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Nombre completo <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={nuevoUsuario.nombre}
            onChange={e =>
              setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
            }
            className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="Nombre del conductor"
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Teléfono <span className="text-red">*</span>
          </label>
          <input
            type="tel"
            value={nuevoUsuario.telefono}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 10) {
                setNuevoUsuario({ ...nuevoUsuario, telefono: val });
              }
            }}
            className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="Teléfono"
            disabled={loading}
          />
          {nuevoUsuario.telefono && !/^3\d{9}$/.test(nuevoUsuario.telefono) && (
            <span className="text-red-500 text-xs mt-1">
              Debe ser celular válido (10 dígitos, empieza con 3)
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Ciudad <span className="text-red">*</span>
          </label>
          <div className="select-wrapper">
            <md-icon className="text-sm">arrow_drop_down</md-icon>
            <select
              value={nuevoUsuario.idCiudad}
              onChange={e =>
                setNuevoUsuario({ ...nuevoUsuario, idCiudad: e.target.value })
              }
              className="select-filter w-full px-4 input bg-fill border border-border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
            >
              <option value="">Selecciona</option>
              {ciudades.map(ciudad => (
                <option key={ciudad.idCiudad} value={ciudad.idCiudad}>
                  {ciudad.nombreCiudad}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Dirección <span className="text-red">*</span>
          </label>
          <div className="relative">
            <AddressAutocomplete
              value={nuevoUsuario.direccion}
              onChange={handleAddressChange}
              onSelect={handleAddressSelect}
              placeholder="Dirección completa"
              disabled={loading}
              country="co"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red/10 border border-red/30 rounded-lg p-3 mt-4">
          <p className="text-red text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center gap-2 pt-2">
        <button
          onClick={() => setStep(1)}
          className="btn w-full btn-secondary px-6"
          disabled={loading}
        >
          Atrás
        </button>
        <button
          onClick={() => setStep(3)}
          className="btn btn-primary w-full px-8"
          disabled={
            loading ||
            !nuevoUsuario.nombre ||
            !nuevoUsuario.telefono ||
            !/^3\d{9}$/.test(nuevoUsuario.telefono) ||
            !nuevoUsuario.direccion ||
            !nuevoUsuario.idCiudad
          }
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  const renderSeleccionUsuarioExistente = () => (
    <div className="flex flex-col gap-4">
      <div className="leading-tight mb-6">
        <h2 className="h2 font-medium text-primary">Datos de Licencia</h2>
        <p className="h5 text-secondary font-medium">
          ¿Cómo deseas completar la información?
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {usuariosDisponibles.map(usuario => (
          <button
            key={usuario.idUsuario}
            onClick={() => {
              setUsuarioSeleccionado(usuario);
              setStep(2);
            }}
            className="p-6 content-box-outline-6-small hover:border-primary rounded-xl transition-all hover:shadow-md text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold text-primary">{usuario.nombre}</p>
                <p className="text-sm text-secondary">
                  {usuario.correo} | {usuario.numDocumento}
                </p>
              </div>
              <md-icon className="text-secondary text-lg">
                arrow_forward
              </md-icon>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => setMode(null)}
        className="btn btn-secondary w-full"
        disabled={loading}
      >
        Atrás
      </button>
    </div>
  );

  const renderSeleccionCompletacion = () => (
    <div className="flex flex-col gap-4">
      <div className="leading-tight mb-6">
        <h2 className="h2 font-medium text-primary">Datos de Licencia</h2>
        <p className="h5 text-secondary font-medium">
          ¿Cómo deseas completar la información?
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map(stepNum => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`
                                flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 transform
                                ${
                                  step >= stepNum
                                    ? 'bg-primary text-on-primary shadow-md scale-110 ring-4 ring-primary/20'
                                    : 'bg-fill text-secondary scale-100'
                                }
                                ${step === stepNum ? 'animate-pulse' : ''}
                                font-semibold
                            `}
            >
              {step > stepNum ? (
                <md-icon className="text-base">check</md-icon>
              ) : (
                stepNum
              )}
            </div>
            {stepNum < 3 && (
              <div
                className={`h-1 w-16 transition-all duration-300 ${step > stepNum ? 'bg-primary' : 'bg-fill'}`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setCompletionMode('now');
          setStep(4);
        }}
        className="p-6 content-box-outline-6-small hover:border-primary rounded-xl transition-all hover:shadow-md text-left group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center group-hover:bg-primary/20 transition-colors">
            <md-icon className="text-blue text-xl">edit_document</md-icon>
          </div>
          <div className="flex flex-col">
            <h3 className="subtitle1 font-normal text-primary ">
              Completar datos ahora
            </h3>
            <p className="text-secondary text-sm">
              Ingresa la información de la licencia del conductor en este
              momento
            </p>
          </div>
          <md-icon className="text-secondary text-lg">call_made</md-icon>
        </div>
      </button>

      <button
        onClick={() => {
          setCompletionMode('invite');
          setStep(4);
        }}
        className="p-6 content-box-outline-6-small hover:border-primary rounded-xl transition-all hover:shadow-md text-left group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center group-hover:bg-primary/20 transition-colors">
            <md-icon className="text-blue text-xl">mail</md-icon>
          </div>
          <div className="flex flex-col">
            <h3 className="subtitle1 font-normal text-primary ">
              Enviar invitación al conductor
            </h3>
            <p className="text-secondary text-sm">
              El conductor recibirá un correo con sus credenciales y podrá
              completar sus datos de licencia al iniciar sesión
            </p>
          </div>
          <md-icon className="text-secondary text-lg">call_made</md-icon>
        </div>
      </button>

      <div className="flex justify-between items-center gap-2 pt-2 mt-3">
        <button
          onClick={() => setStep(2)}
          className="btn w-full btn-secondary px-6"
          disabled={loading}
        >
          Atrás
        </button>
      </div>
    </div>
  );

  const renderFormularioLicencia = () => {
    if (mode === 'new' && completionMode === 'invite') {
      return (
        <div className="flex flex-col gap-4">
          <div className="leading-tight mb-6">
            <h2 className="h2 font-medium text-primary">
              Confirmar Invitación
            </h2>
            <p className="h5 text-secondary font-medium">
              Revisa los detalles antes de enviar
            </p>
          </div>

          <div className="space-y-3">
            <div className="content-box-outline-2-small  rounded-xl p-6 w-full mb-8 flex items-center gap-4">
              <md-icon className="text-blue text-2xl mt-1">mail</md-icon>
              <div className="flex-1 text-center">
                <p className="text-primary font-semibold mb-1">
                  Confirma la Invitación
                </p>
                <p className="text-secondary text-sm max-w-56">
                  Se le enviara un correo con los proximos pasos para completar
                  su perfil
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 content-box-outline-9-small bg-fill rounded-xl border border-border">
              <md-icon className="text-primary text-xl">passkey</md-icon>
              <div>
                <p className="subtitle1 font-medium text-primary">
                  Credenciales de acceso
                </p>
                <p className="text-xs text-secondary">
                  Usuario y contraseña temporal generada
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 content-box-outline-9-small bg-fill rounded-xl border border-border">
              <md-icon className="text-primary text-xl">assignment</md-icon>
              <div>
                <p className="subtitle1 font-medium text-primary">
                  Instrucciones
                </p>
                <p className="text-xs text-secondary">
                  Indicaciones para completar sus datos de licencia
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 rounded-lg p-3 mt-4">
              <p className="text-red text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center gap-2 pt-2">
            <button
              onClick={() => {
                setCompletionMode(null);
                setStep(3);
              }}
              className="btn w-full btn-secondary px-6"
              disabled={loading}
            >
              Atrás
            </button>
            <button
              onClick={handleCrearNuevoConductor}
              className="btn w-full btn-primary px-8 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="leading-tight mb-6">
          <h2 className="h2 font-medium text-primary">
            {mode === 'new' ? 'Información de Licencia' : 'Completar Perfil'}
          </h2>
          <p className="h5 text-secondary font-medium">
            {mode === 'new'
              ? 'Datos de la licencia de conducir'
              : 'Completa la información de licencia'}
          </p>
        </div>

        {mode === 'new' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map(stepNum => (
              <div key={stepNum} className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary shadow-md scale-110 ring-4 ring-primary/20 font-semibold">
                  <md-icon className="text-base">check</md-icon>
                </div>
                {stepNum < 3 && <div className="h-1 w-16 bg-primary"></div>}
              </div>
            ))}
          </div>
        )}

        {mode === 'existing' && usuarioSeleccionado && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 flex flex-col gap-1">
              <label className="subtitle1 text-primary font-medium">
                Nombre completo <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={usuarioSeleccionado.nombre}
                className="w-full px-4 py-3 input bg-surface border rounded-lg text-secondary cursor-not-allowed opacity-75"
                disabled
                readOnly
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="subtitle1 text-primary font-medium">
                Correo electrónico <span className="text-red">*</span>
              </label>
              <input
                type="email"
                value={usuarioSeleccionado.correo}
                className="w-full px-4 py-3 input bg-surface border rounded-lg text-secondary cursor-not-allowed opacity-75"
                disabled
                readOnly
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="subtitle1 text-primary font-medium">
                Número de licencia <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={usuarioSeleccionado.numDocumento}
                className="w-full px-4 py-3 input bg-surface border rounded-lg text-secondary cursor-not-allowed opacity-75"
                disabled
                readOnly
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Categoría de licencia <span className="text-red">*</span>
          </label>
          <div className="select-wrapper">
            <md-icon className="text-sm">arrow_drop_down</md-icon>
            <select
              value={licencia.idCategoriaLicencia}
              onChange={e =>
                setLicencia({
                  ...licencia,
                  idCategoriaLicencia: e.target.value,
                })
              }
              className="select-filter w-full px-4 input bg-fill border border-border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
              disabled={loading}
            >
              <option value="">Selecciona</option>
              {categorias.map(cat => (
                <option
                  key={cat.idCategoriaLicencia}
                  value={cat.idCategoriaLicencia}
                >
                  {cat.nombreCategoria} - {cat.descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Fecha de vencimiento licencia <span className="text-red">*</span>
          </label>
          <input
            type="date"
            value={licencia.fechaVencimientoLicencia}
            onChange={e =>
              setLicencia({
                ...licencia,
                fechaVencimientoLicencia: e.target.value,
              })
            }
            className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all date-secondary"
            disabled={loading}
          />
          <span className="text-xs text-secondary mt-1">
            La fecha debe ser futura
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="subtitle1 text-primary font-medium">
            Observaciones
          </label>
          <textarea
            value={licencia.observaciones}
            onChange={e =>
              setLicencia({ ...licencia, observaciones: e.target.value })
            }
            rows="3"
            className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            placeholder="Información adicional sobre la licencia (opcional)"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red/10 border border-red/30 rounded-lg p-3 mt-4">
            <p className="text-red text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-between items-center gap-2 pt-2 ">
          <button
            onClick={() => {
              if (mode === 'new') {
                setCompletionMode(null);
                setStep(3);
              } else {
                setStep(1);
              }
            }}
            className="btn w-full btn-secondary px-6"
            disabled={loading}
          >
            Atrás
          </button>
          <button
            onClick={
              mode === 'new'
                ? handleCrearNuevoConductor
                : handleCompletarPerfilExistente
            }
            className="btn w-full btn-primary px-8 flex items-center justify-center gap-2"
            disabled={
              loading ||
              !licencia.idCategoriaLicencia ||
              !licencia.fechaVencimientoLicencia
            }
          >
            {loading && (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {loading
              ? 'Procesando...'
              : mode === 'new'
                ? 'Crear Conductor'
                : 'Completar Perfil'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <main className="relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-1 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
              disabled={loading}
            >
              <md-icon className="text-xl flex items-center justify-center">
                close
              </md-icon>
            </button>
          </div>

          <div className="px-8 md:px-20">
            {mode === null
              ? renderSeleccionModo()
              : mode === 'new' && step === 1
                ? renderStep1Usuario()
                : mode === 'new' && step === 2
                  ? renderStep2Usuario()
                  : mode === 'new' && step === 3 && completionMode === null
                    ? renderSeleccionCompletacion()
                    : mode === 'existing' && step === 1
                      ? renderSeleccionUsuarioExistente()
                      : step === 2 || step === 4
                        ? renderFormularioLicencia()
                        : null}
          </div>
        </div>
      </main>
    </Modal>
  );
}
