import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import '@material/web/icon/icon.js';
import '@material/web/progress/linear-progress.js';
import { categoriasLicenciaService } from '../../../shared/services/categoriasLicenciaApi';
import { conductorService } from '../api/conductorService';
import { useAuth } from '../../../shared/context/AuthContext';

const schema = yup.object().shape({
  idCategoriaLicencia: yup
    .string()
    .required('La categoría de licencia es obligatoria'),
  fechaVencimientoLicencia: yup
    .date()
    .required('La fecha de vencimiento es obligatoria')
    .min(new Date(), 'La fecha de vencimiento debe ser futura')
    .typeError('Fecha inválida'),
  observaciones: yup.string().max(500, 'Máximo 500 caracteres'),
});

function CompletarPerfilPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      idCategoriaLicencia: '',
      fechaVencimientoLicencia: '',
      observaciones: '',
    },
  });

  const watchAllFields = watch();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoadingCategorias(true);
        const response = await categoriasLicenciaService.getCategorias();
        if (response.success) {
          setCategorias(response.data);
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        setError('No se pudieron cargar las categorías de licencia');
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  const onSubmit = async data => {
    setLoading(true);
    setError('');

    try {
      console.log('Datos a enviar:', data);
      const response = await conductorService.completarPerfil(data);
      console.log('Respuesta del servidor:', response);

      if (response.success) {
        window.location.href = '/dashboard';
      } else {
        setError(response.error || 'Error al completar el perfil');
      }
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Response data:', err.response?.data);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          'Error al completar el perfil. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const categoriaSeleccionada = categorias.find(
    c => c.idCategoriaLicencia === watchAllFields.idCategoriaLicencia
  );

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
                    <md-icon className="text-3xl text-blue">
                      directions_car
                    </md-icon>
                  </div>
                  <h2 className="h3 font-semibold text-primary">
                    ¡Bienvenido, {user?.nombre}!
                  </h2>
                  <p className="text-secondary text-sm">
                    Para acceder a todas las funcionalidades como conductor,
                    necesitamos que configures tu información de licencia.
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
                  <label
                    className="subtitle1 text-primary font-medium mb-1"
                    htmlFor="direccion"
                  >
                    Numero de Licencia <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={user?.numDocumento || ''}
                    disabled
                    className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-secondary cursor-not-allowed"
                  />
                  <span className="text-secondary text-xs mt-1">
                    Tu número de licencia es el mismo que tu documento
                  </span>
                </div>

                <div className="flex flex-col">
                  <label
                    className="subtitle1 text-primary font-medium mb-1"
                    htmlFor="direccion"
                  >
                    Categoria de la Licencia <span className="text-red">*</span>
                  </label>
                  <div className="select-wrapper w-full">
                    <md-icon className="text-sm">arrow_drop_down</md-icon>
                    <Controller
                      name="idCategoriaLicencia"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors ${
                            errors.idCategoriaLicencia
                              ? 'border-red-500'
                              : 'border-border'
                          }`}
                          disabled={loadingCategorias}
                        >
                          <option value="">Selecciona la categoría</option>
                          {categorias.map(categoria => (
                            <option
                              key={categoria.idCategoriaLicencia}
                              value={categoria.idCategoriaLicencia}
                            >
                              {categoria.nombreCategoria} -{' '}
                              {categoria.descripcion}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  {errors.idCategoriaLicencia && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.idCategoriaLicencia.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label
                    className="subtitle1 text-primary font-medium mb-1"
                    htmlFor="direccion"
                  >
                    Fecha de vencimiento <span className="text-red">*</span>
                  </label>
                  <Controller
                    name="fechaVencimientoLicencia"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        {...field}
                        className={`w-full px-4 py-3 input bg-fill border border-border rounded-lg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all date-secondary ${
                          errors.fechaVencimientoLicencia
                            ? 'border-red-500'
                            : 'border-border'
                        }`}
                      />
                    )}
                  />
                  {errors.fechaVencimientoLicencia && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.fechaVencimientoLicencia.message}
                    </span>
                  )}
                  <span className="text-secondary text-xs mt-1">
                    La fecha debe ser futura
                  </span>
                </div>

                <div className="flex flex-col">
                  <label
                    className="subtitle1 text-primary font-medium mb-1"
                    htmlFor="direccion"
                  >
                    Observaciones
                  </label>
                  <Controller
                    name="observaciones"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows="3"
                        placeholder="Información adicional sobre tu licencia"
                        className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none ${
                          errors.observaciones
                            ? 'border-red-500'
                            : 'border-border'
                        }`}
                      />
                    )}
                  />
                  {errors.observaciones && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.observaciones.message}
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
                    onClick={async () => {
                      const valid = await trigger([
                        'idCategoriaLicencia',
                        'fechaVencimientoLicencia',
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
              <div className="flex flex-col gap-4 list-enter content-box-outline-7-small">
                <div className="text-center">
                  <div className="w-20 h-20 flex items-center justify-center mx-auto">
                    <md-icon className="text-3xl text-yellow-2">
                      document_search
                    </md-icon>
                  </div>
                  <h2 className="h3 font-semibold text-primary mb-2">
                    Confirma tu Información
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="content-box-outline-2-small">
                    <p className="text-secondary text-xs font-semibold mb-1">
                      Número de Licencia
                    </p>
                    <p className="text-primary font-medium">
                      {user?.numDocumento}
                    </p>
                  </div>

                  <div className="content-box-outline-2-small">
                    <p className="text-secondary text-xs font-semibold mb-1">
                      Categoría
                    </p>
                    <p className="text-primary font-medium">
                      {categoriaSeleccionada?.nombreCategoria || 'N/A'}
                    </p>
                    <p className="text-secondary text-xs">
                      {categoriaSeleccionada?.descripcion}
                    </p>
                  </div>

                  <div className="content-box-outline-2-small">
                    <p className="text-secondary text-xs font-semibold mb-1">
                      Fecha de Vencimiento
                    </p>
                    <p className="text-primary font-medium">
                      {watchAllFields.fechaVencimientoLicencia
                        ? new Date(
                            watchAllFields.fechaVencimientoLicencia
                          ).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>

                  {watchAllFields.observaciones && (
                    <div className="bg-fill border border-border rounded-lg p-3">
                      <p className="text-secondary text-xs font-semibold mb-1">
                        Observaciones
                      </p>
                      <p className="text-primary text-sm">
                        {watchAllFields.observaciones}
                      </p>
                    </div>
                  )}
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

export default CompletarPerfilPage;
