import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

let conductorService, vehiculoService;
try {
  conductorService =
    require('../../../services/conductorService').default ||
    require('../../../services/conductorService').conductorService;
} catch (e) {
  console.warn('Error importando conductorService:', e);
  conductorService = { getAllConductores: async () => ({ data: [] }) };
}

try {
  vehiculoService =
    require('../../../services/vehiculoService').default ||
    require('../../../services/vehiculoService').vehiculoService;
} catch (e) {
  console.warn('Error importando vehiculoService:', e);
  vehiculoService = { getVehiculos: async () => ({ data: [] }) };
}

const conductorSchema = Yup.object().shape({
  idConductor: Yup.string().required('El conductor es requerido'),
  idVehiculo: Yup.string(),
});

const AsignarConductorModal = ({
  isOpen,
  onClose,
  onConfirm,
  reserva,
  isEditMode = false,
  conductores: conductoresProp = [],
  vehiculos: vehiculosProp = [],
  requireVehiculo = true,
}) => {
  const [conductores, setConductores] = useState(conductoresProp || []);
  const [vehiculos, setVehiculos] = useState(vehiculosProp || []);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (
      isOpen &&
      (!conductoresProp || conductoresProp.length === 0 || !vehiculosProp)
    ) {
      cargarDatos();
    } else if (isOpen && conductoresProp && vehiculosProp) {
      setConductores(conductoresProp);
      setVehiculos(vehiculosProp);
    }
  }, [isOpen, conductoresProp, vehiculosProp]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setSubmitError(null);

      try {
        const responseConductores = await conductorService.getAllConductores();
        console.log('Respuesta conductores completa:', responseConductores);

        let conductoresData = [];

        if (Array.isArray(responseConductores)) {
          conductoresData = responseConductores;
        } else if (responseConductores?.data) {
          conductoresData = Array.isArray(responseConductores.data)
            ? responseConductores.data
            : responseConductores.data.conductores ||
              responseConductores.data.data ||
              [];
        } else if (responseConductores?.conductores) {
          conductoresData = Array.isArray(responseConductores.conductores)
            ? responseConductores.conductores
            : [];
        } else if (
          responseConductores?.success &&
          responseConductores?.result
        ) {
          conductoresData = Array.isArray(responseConductores.result)
            ? responseConductores.result
            : [];
        }

        setConductores(conductoresData || []);
        console.log('Conductores procesados:', conductoresData);
      } catch (err) {
        console.warn('Error al cargar conductores:', err);
        setConductores([]);
      }

      try {
        const responseVehiculos = await vehiculoService.getVehiculos();
        console.log('Respuesta vehículos completa:', responseVehiculos);

        let vehiculosData = [];

        if (Array.isArray(responseVehiculos)) {
          vehiculosData = responseVehiculos;
        } else if (responseVehiculos?.data) {
          vehiculosData = Array.isArray(responseVehiculos.data)
            ? responseVehiculos.data
            : responseVehiculos.data.vehiculos ||
              responseVehiculos.data.data ||
              [];
        } else if (responseVehiculos?.vehiculos) {
          vehiculosData = Array.isArray(responseVehiculos.vehiculos)
            ? responseVehiculos.vehiculos
            : [];
        } else if (responseVehiculos?.success && responseVehiculos?.result) {
          vehiculosData = Array.isArray(responseVehiculos.result)
            ? responseVehiculos.result
            : [];
        }

        setVehiculos(vehiculosData || []);
        console.log('Vehículos procesados:', vehiculosData);
      } catch (err) {
        console.warn('Error al cargar vehículos:', err);
        setVehiculos([]);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setSubmitError('Error al cargar datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      idConductor: reserva?.idConductor || '',
      idVehiculo: reserva?.idVehiculo || '',
    },
    validationSchema: Yup.object().shape({
      idConductor: Yup.string().required('El conductor es requerido'),
      idVehiculo: requireVehiculo
        ? Yup.string().required('El vehículo es requerido')
        : Yup.string(),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async values => {
      try {
        setSubmitError(null);

        const conductorSeleccionado = conductores.find(
          c => c.id == values.idConductor
        );
        const vehiculoSeleccionado = vehiculos.find(
          v => v.id == values.idVehiculo
        );

        const asignacion = {
          id: conductorSeleccionado?.id,
          idConductor: conductorSeleccionado?.id,
          nombre: conductorSeleccionado?.nombre,
          nombreConductor: conductorSeleccionado?.nombre || 'No disponible',
          idVehiculo: values.idVehiculo ? vehiculoSeleccionado?.id : null,
          placaVehiculo: values.idVehiculo
            ? vehiculoSeleccionado?.placa || 'No disponible'
            : null,
        };

        if (onConfirm) onConfirm(asignacion);

        setTimeout(() => {
          formik.resetForm();
          onClose();
        }, 500);
      } catch (err) {
        setSubmitError(err.message || 'Error al asignar conductor');
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setSubmitError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
        <div className="flex items-center gap-1 mb-4">
          <button
            type="button"
            onClick={handleClose}
            className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
          >
            <md-icon className="text-xl flex items-center justify-center">
              close
            </md-icon>
          </button>
        </div>

        <div className="px-4">
          <div className="leading-tight mb-6">
            <h2 className="h3 font-medium text-primary">
              {isEditMode ? 'Editar asignación conductor' : 'Asignar conductor'}
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <md-icon className="text-sm text-secondary">group</md-icon>
              <span className="text-sm text-secondary">
                Ver lista de pasajeros
              </span>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center justify-between">
                <label className="subtitle1 text-primary font-medium">
                  Conductor *
                </label>
                <span className="text-xs text-secondary">Requerido</span>
              </div>
              <div className="select-wrapper w-full">
                <md-icon className="text-sm">arrow_drop_down</md-icon>
                <select
                  name="idConductor"
                  value={formik.values.idConductor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="select-filter w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Seleccionar conductor</option>
                  {conductores && conductores.length > 0 ? (
                    conductores.map(conductor => (
                      <option key={conductor.id} value={conductor.id}>
                        {conductor.nombre}
                      </option>
                    ))
                  ) : (
                    <option value="">No hay conductores disponibles</option>
                  )}
                </select>
              </div>
              {formik.touched.idConductor && formik.errors.idConductor && (
                <span className="text-red text-xs">
                  {formik.errors.idConductor}
                </span>
              )}
            </div>

            {requireVehiculo && (
              <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center justify-between">
                  <label className="subtitle1 text-primary font-medium">
                    Vehículo *
                  </label>
                  <span className="text-xs text-secondary">Requerido</span>
                </div>
                <div className="select-wrapper w-full">
                  <md-icon className="text-sm">arrow_drop_down</md-icon>
                  <select
                    name="idVehiculo"
                    value={formik.values.idVehiculo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="select-filter w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Seleccionar vehículo</option>
                    {vehiculos && vehiculos.length > 0 ? (
                      vehiculos.map(vehiculo => (
                        <option key={vehiculo.id} value={vehiculo.id}>
                          {vehiculo.placa} - {vehiculo.modelo}
                        </option>
                      ))
                    ) : (
                      <option value="">No hay vehículos disponibles</option>
                    )}
                  </select>
                </div>
                {formik.touched.idVehiculo && formik.errors.idVehiculo && (
                  <span className="text-red text-xs">
                    {formik.errors.idVehiculo}
                  </span>
                )}
              </div>
            )}

            {!requireVehiculo && (
              <div className="flex flex-col gap-2 mb-8">
                <div className="flex items-center justify-between">
                  <label className="subtitle1 text-primary font-medium">
                    Vehículo (Opcional)
                  </label>
                  <span className="text-xs text-secondary">Opcional</span>
                </div>
                <div className="select-wrapper w-full">
                  <md-icon className="text-sm">arrow_drop_down</md-icon>
                  <select
                    name="idVehiculo"
                    value={formik.values.idVehiculo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="select-filter w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Sin vehículo</option>
                    {vehiculos && vehiculos.length > 0 ? (
                      vehiculos.map(vehiculo => (
                        <option key={vehiculo.id} value={vehiculo.id}>
                          {vehiculo.placa} - {vehiculo.modelo}
                        </option>
                      ))
                    ) : (
                      <option value="">No hay vehículos disponibles</option>
                    )}
                  </select>
                </div>
              </div>
            )}

            {submitError && (
              <div className="text-red mb-4 text-sm p-3 bg-red bg-opacity-10 rounded">
                {submitError}
              </div>
            )}

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                className="btn px-6 text-secondary"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <md-filled-button
                className="btn-add px-8"
                type="submit"
                disabled={loading || !formik.isValid || formik.isSubmitting}
              >
                {formik.isSubmitting
                  ? isEditMode
                    ? 'Actualizando...'
                    : 'Asignando...'
                  : isEditMode
                    ? 'Editar'
                    : 'Asignar'}
              </md-filled-button>
            </div>
          </form>
        </div>
      </main>
    </Modal>
  );
};

export default AsignarConductorModal;
