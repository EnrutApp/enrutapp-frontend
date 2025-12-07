import Modal from '../Modal';
import AsignarConductorModal from '../asignarConductorModal/AsignarConductorModal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { userService } from '../../../services/userService';
import ubicacionesService from '../../../services/ubicacionesService';
import conductorService from '../../../services/conductorService';

// Datos mock para fallback
const MOCK_CLIENTES = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '3001234567' },
    { id: 2, nombre: 'María García', email: 'maria@example.com', telefono: '3007654321' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', telefono: '3009876543' },
];

const MOCK_UBICACIONES = [
    { id: 1, nombre: 'Centro Comercial' },
    { id: 2, nombre: 'Terminal de Transporte' },
    { id: 3, nombre: 'Aeropuerto' },
    { id: 4, nombre: 'Hospital Central' },
];

const MOCK_CONDUCTORES = [
    { id: 1, nombre: 'Carlos López', placa: 'ABC-1234' },
    { id: 2, nombre: 'Jorge Díaz', placa: 'XYZ-5678' },
];

// Schema de validación
const reservaSchema = Yup.object().shape({
    nombreCliente: Yup.string().required('El cliente es requerido'),
    pasajeros: Yup.array().min(1, 'Debe agregar al menos un pasajero').required('Los pasajeros son requeridos'),
    origen: Yup.string().required('El origen es requerido'),
    destino: Yup.string().required('El destino es requerido'),
    fecha: Yup.string().required('La fecha es requerida'),
    hora: Yup.string().required('La hora es requerida'),
    precio: Yup.number().required('El precio es requerido').min(0, 'El precio debe ser mayor a 0')
});

const AddReservaModal = ({ isOpen, onClose, onConfirm }) => {
    const [clientes, setClientes] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [conductores, setConductores] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [conductorAsignado, setConductorAsignado] = useState(null);
    const [showAsignarConductor, setShowAsignarConductor] = useState(false);
    const [nuevoNombrePasajero, setNuevoNombrePasajero] = useState('');
    const [nuevoTelefonoPasajero, setNuevoTelefonoPasajero] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Inicializar con MOCK data inmediatamente
            setClientes(MOCK_CLIENTES);
            setUbicaciones(MOCK_UBICACIONES);
            setConductores(MOCK_CONDUCTORES);
            
            // Luego cargar desde la API
            cargarDatos();
            setNuevoNombrePasajero('');
            setNuevoTelefonoPasajero('');
            setConductorAsignado(null);
        }
    }, [isOpen]);

    const extraerDatos = (respuesta) => {
        if (!respuesta) return [];
        
        console.log('Extrayendo datos de:', respuesta);
        
        // Si es un array directamente
        if (Array.isArray(respuesta)) {
            return respuesta;
        }
        
        // Si tiene propiedad .data con array
        if (respuesta.data && Array.isArray(respuesta.data)) {
            return respuesta.data;
        }
        
        // Si tiene propiedad .result
        if (respuesta.result && Array.isArray(respuesta.result)) {
            return respuesta.result;
        }
        
        // Si es un objeto con estructura de respuesta API
        if (respuesta.success === true && respuesta.data && Array.isArray(respuesta.data)) {
            return respuesta.data;
        }
        
        console.warn('Estructura de respuesta no reconocida:', respuesta);
        return [];
    };

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setSubmitError(null);

            // Cargar clientes
            try {
                const responseClientes = await userService.getClientes();
                const clientesData = extraerDatos(responseClientes);
                console.log('Clientes cargados:', clientesData);
                setClientes(clientesData && clientesData.length > 0 ? clientesData : MOCK_CLIENTES);
            } catch (err) {
                console.warn('Error cargando clientes, usando MOCK:', err.message);
                setClientes(MOCK_CLIENTES);
            }

            // Cargar ubicaciones
            try {
                const responseUbicaciones = await ubicacionesService.getAll();
                const ubicacionesData = extraerDatos(responseUbicaciones);
                console.log('Ubicaciones cargadas:', ubicacionesData);
                setUbicaciones(ubicacionesData && ubicacionesData.length > 0 ? ubicacionesData : MOCK_UBICACIONES);
            } catch (err) {
                console.warn('Error cargando ubicaciones, usando MOCK:', err.message);
                setUbicaciones(MOCK_UBICACIONES);
            }

            // Cargar conductores
            try {
                const responseConductores = await userService.getUsers();
                const todosUsuarios = extraerDatos(responseConductores);
                const conductoresData = todosUsuarios.filter(u => 
                    u.rol && (u.rol.toLowerCase() === 'conductor')
                );
                console.log('Conductores cargados:', conductoresData);
                setConductores(conductoresData && conductoresData.length > 0 ? conductoresData : MOCK_CONDUCTORES);
            } catch (err) {
                console.warn('Error cargando conductores, usando MOCK:', err.message);
                setConductores(MOCK_CONDUCTORES);
            }
        } catch (err) {
            console.error('Error cargando datos:', err);
            setSubmitError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleAsignarConductor = (conductor) => {
        setConductorAsignado({
            id: conductor.id,
            idConductor: conductor.id,
            nombre: conductor.nombre,
            nombreConductor: conductor.nombre,
            idVehiculo: conductor.idVehiculo || null,
            placaVehiculo: conductor.placaVehiculo || conductor.placa || null
        });
        setShowAsignarConductor(false);
        console.log('Conductor asignado:', conductor);
    };

    const formik = useFormik({
        initialValues: {
            nombreCliente: '',
            pasajeros: [],
            origen: '',
            destino: '',
            fecha: '',
            hora: '',
            precio: ''
        },
        validationSchema: reservaSchema || undefined,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
            try {
                setSubmitError(null);

                // Buscar datos del cliente seleccionado
                const clienteSeleccionado = clientes.find(c => c.id == values.nombreCliente);

                const newReserva = {
                    idCliente: parseInt(values.nombreCliente),
                    nombreCliente: clienteSeleccionado?.nombre || 'No disponible',
                    pasajeros: values.pasajeros,
                    origen: values.origen,
                    destino: values.destino,
                    fecha: values.fecha,
                    hora: values.hora,
                    precio: parseFloat(values.precio),
                    estado: 'Pendiente',
                    idConductor: conductorAsignado?.idConductor || null,
                    nombreConductor: conductorAsignado?.nombreConductor || null,
                    idVehiculo: conductorAsignado?.idVehiculo || null,
                    placaVehiculo: conductorAsignado?.placaVehiculo || null
                };

                if (onConfirm) onConfirm(newReserva);

                setTimeout(() => {
                    formik.resetForm();
                    setConductorAsignado(null);
                    setNuevoNombrePasajero('');
                    setNuevoTelefonoPasajero('');
                    onClose();
                }, 500);
            } catch (err) {
                setSubmitError(err.message || 'Error al crear la reserva');
            }
        }
    });

    // Agregar un nuevo pasajero
    const handleAgregarPasajero = () => {
        if (!nuevoNombrePasajero.trim()) {
            setSubmitError('Por favor ingrese el nombre del pasajero');
            return;
        }
        
        if (nuevoNombrePasajero.trim().length < 3) {
            setSubmitError('El nombre del pasajero debe tener al menos 3 caracteres');
            return;
        }
        
        if (nuevoTelefonoPasajero && nuevoTelefonoPasajero.trim().length < 7) {
            setSubmitError('El teléfono debe tener al menos 7 dígitos');
            return;
        }

        const nuevoPasajero = {
            nombre: nuevoNombrePasajero.trim(),
            telefono: nuevoTelefonoPasajero.trim() || 'N/A',
            esNuevo: true
        };

        const pasajerosActuales = formik.values.pasajeros;
        formik.setFieldValue('pasajeros', [...pasajerosActuales, nuevoPasajero]);
        
        setNuevoNombrePasajero('');
        setNuevoTelefonoPasajero('');
        setSubmitError(null);
    };

    // Eliminar un pasajero
    const handleEliminarPasajero = (index) => {
        const pasajerosActuales = formik.values.pasajeros;
        formik.setFieldValue('pasajeros', pasajerosActuales.filter((_, i) => i !== index));
    };

    const handleClose = () => {
        formik.resetForm();
        setSubmitError(null);
        setConductorAsignado(null);
        setNuevoNombrePasajero('');
        setNuevoTelefonoPasajero('');
        onClose();
    };

    // Obtener fecha mínima (hoy)
    const getMinDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size='xl'>
            <main className='p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg'>
                <div className='flex items-center gap-1 mb-4'>
                    <button
                        type="button"
                        onClick={handleClose}
                        className='text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer'
                    >
                        <md-icon className="text-xl flex items-center justify-center">close</md-icon>
                    </button>
                </div>

                <div className='px-8'>
                    <div className='leading-tight mb-5'>
                        <h2 className='h2 font-medium text-primary'>Agregar nueva reserva</h2>
                        <p className='h5 text-secondary font-medium'>Información básica de la reserva</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Nombre de quien reserva */}
                        <div className="flex flex-col gap-2">
                            <label className="subtitle1 text-primary font-medium">Nombre de quién reserva *</label>
                            <div className='select-wrapper w-full'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select
                                    name="nombreCliente"
                                    value={formik.values.nombreCliente}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="select-filter w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                                >
                                    <option value="">Seleccionar cliente</option>
                                    {clientes && clientes.length > 0 ? (
                                        clientes.map((cliente) => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nombre}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No hay clientes disponibles</option>
                                    )}
                                </select>
                            </div>
                            {formik.touched.nombreCliente && formik.errors.nombreCliente && (
                                <span className='text-red text-xs'>{formik.errors.nombreCliente}</span>
                            )}
                        </div>

                        {/* Pasajeros */}
                        <div className="flex flex-col gap-2">
                            <label className="subtitle1 text-primary font-medium">Pasajeros *</label>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nombre del pasajero"
                                        value={nuevoNombrePasajero}
                                        onChange={(e) => setNuevoNombrePasajero(e.target.value)}
                                        className="flex-1 px-4 py-3 input bg-fill border border-outline rounded-lg text-primary placeholder:text-secondary placeholder:opacity-60 focus:outline-none focus:border-primary transition-colors text-sm"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Teléfono (opcional)"
                                        value={nuevoTelefonoPasajero}
                                        onChange={(e) => setNuevoTelefonoPasajero(e.target.value)}
                                        className="flex-1 px-4 py-3 input bg-fill border border-outline rounded-lg text-primary placeholder:text-secondary placeholder:opacity-60 focus:outline-none focus:border-primary transition-colors text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAgregarPasajero}
                                        className="px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-1 font-medium text-sm"
                                        title="Agregar pasajero"
                                    >
                                        <md-icon className="text-base">add</md-icon>
                                    </button>
                                </div>

                                {/* Lista de pasajeros */}
                                {formik.values.pasajeros && formik.values.pasajeros.length > 0 ? (
                                    <div className="space-y-2">
                                        {formik.values.pasajeros.map((pasajero, index) => (
                                            <div 
                                                key={index} 
                                                className="flex items-center justify-between bg-fill p-3 rounded-lg border border-outline"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-primary">
                                                        {typeof pasajero === 'string' ? pasajero : pasajero.nombre}
                                                    </p>
                                                    {pasajero.telefono && pasajero.telefono !== 'N/A' && (
                                                        <p className="text-xs text-secondary">
                                                            {pasajero.telefono}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEliminarPasajero(index)}
                                                    className="ml-2 p-2 text-red hover:bg-red hover:bg-opacity-10 rounded-lg transition-colors"
                                                    title="Eliminar pasajero"
                                                >
                                                    <md-icon className="text-lg">close</md-icon>
                                                </button>
                                            </div>
                                        ))}
                                        <p className="text-xs text-secondary font-medium mt-2">Total: {formik.values.pasajeros.length} pasajero(s)</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-secondary italic">Sin pasajeros agregados</p>
                                )}
                            </div>
                            {formik.touched.pasajeros && formik.errors.pasajeros && (
                                <span className='text-red text-xs'>{formik.errors.pasajeros}</span>
                            )}
                        </div>

                        {/* Datos de la ruta */}
                        <div>
                            <h3 className="subtitle1 text-primary font-medium mb-4">Datos de la ruta</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="subtitle1 text-primary font-medium text-sm">Origen *</label>
                                        <div className='select-wrapper w-full'>
                                            <md-icon className="text-sm">arrow_drop_down</md-icon>
                                            <select
                                                name="origen"
                                                value={formik.values.origen}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="select-filter w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                                            >
                                                <option value="">Seleccionar origen</option>
                                                {ubicaciones && ubicaciones.length > 0 ? (
                                                    ubicaciones.map((ubicacion) => (
                                                        <option key={ubicacion.id} value={ubicacion.nombre || ubicacion.id}>
                                                            {ubicacion.nombre}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No hay ubicaciones</option>
                                                )}
                                            </select>
                                        </div>
                                        {formik.touched.origen && formik.errors.origen && (
                                            <span className='text-red text-xs'>{formik.errors.origen}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="subtitle1 text-primary font-medium text-sm">Destino *</label>
                                        <div className='select-wrapper w-full'>
                                            <md-icon className="text-sm">arrow_drop_down</md-icon>
                                            <select
                                                name="destino"
                                                value={formik.values.destino}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="select-filter w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                                            >
                                                <option value="">Seleccionar destino</option>
                                                {ubicaciones && ubicaciones.length > 0 ? (
                                                    ubicaciones.map((ubicacion) => (
                                                        <option key={ubicacion.id} value={ubicacion.nombre || ubicacion.id}>
                                                            {ubicacion.nombre}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option value="">No hay ubicaciones</option>
                                                )}
                                            </select>
                                        </div>
                                        {formik.touched.destino && formik.errors.destino && (
                                            <span className='text-red text-xs'>{formik.errors.destino}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="subtitle1 text-primary font-medium">Fecha *</label>
                                        <input
                                            name="fecha"
                                            type="date"
                                            value={formik.values.fecha}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            min={getMinDate()}
                                            className="w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                                        />
                                        {formik.touched.fecha && formik.errors.fecha && (
                                            <span className='text-red text-xs'>{formik.errors.fecha}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="subtitle1 text-primary font-medium">Hora *</label>
                                        <input
                                            name="hora"
                                            type="time"
                                            value={formik.values.hora}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                                        />
                                        {formik.touched.hora && formik.errors.hora && (
                                            <span className='text-red text-xs'>{formik.errors.hora}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="subtitle1 text-primary font-medium text-sm">Precio *</label>
                                    <input
                                        name="precio"
                                        type="number"
                                        placeholder="Ingrese el precio acordado"
                                        step="0.01"
                                        min="0"
                                        value={formik.values.precio}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary placeholder:text-secondary placeholder:opacity-60 focus:outline-none focus:border-primary transition-colors text-sm"
                                    />
                                    {formik.touched.precio && formik.errors.precio && (
                                        <span className='text-red text-xs'>{formik.errors.precio}</span>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="subtitle1 text-primary font-medium text-sm">Conductor (Opcional)</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Toca el botón para asignar un conductor"
                                                value={conductorAsignado ? `${conductorAsignado.nombre} ${conductorAsignado.placaVehiculo ? `(${conductorAsignado.placaVehiculo})` : ''}` : ''}
                                                readOnly
                                                className="w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary placeholder:text-secondary placeholder:opacity-60 focus:outline-none focus:border-primary transition-colors text-sm cursor-pointer"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowAsignarConductor(true)}
                                            className="px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm whitespace-nowrap"
                                            title="Asignar conductor"
                                        >
                                            <md-icon className="text-base">person_add</md-icon>
                                            Asignar
                                        </button>
                                        {conductorAsignado && (
                                            <button
                                                type="button"
                                                onClick={() => setConductorAsignado(null)}
                                                className="px-4 py-3 bg-red bg-opacity-10 border border-red text-red rounded-lg hover:opacity-80 transition-all duration-200 flex items-center justify-center gap-1 font-medium text-sm"
                                                title="Limpiar conductor"
                                            >
                                                <md-icon className="text-base">close</md-icon>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {submitError && (
                            <div className="text-red mb-3 text-sm p-3 bg-red bg-opacity-10 rounded-lg font-medium border border-red border-opacity-30">
                                {submitError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-outline">
                            <button
                                type="button"
                                className="btn btn-outline px-6 text-secondary font-medium"
                                onClick={handleClose}
                            >
                                Cancelar
                            </button>
                            <md-filled-button
                                className="btn-primary px-8"
                                type="submit"
                                disabled={loading || !formik.isValid || formik.isSubmitting}
                            >
                                {formik.isSubmitting ? 'Agregando...' : 'Agregar'}
                            </md-filled-button>
                        </div>
                    </form>
                </div>

            </main>
            
            <AsignarConductorModal
                isOpen={showAsignarConductor}
                onClose={() => setShowAsignarConductor(false)}
                conductores={conductores}
                vehiculos={vehiculos}
                onConfirm={handleAsignarConductor}
                requireVehiculo={false}
            />
        </Modal>
    );
};

export default AddReservaModal;
