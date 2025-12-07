import Modal from '../Modal';
import EditarAsignacionModal from '../editarAsignacionModal/EditarAsignacionModal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Importar servicios de forma segura
let userService, ubicacionesService;
try {
    userService = require('../../../services/userService').default;
} catch (e) {
    console.warn('Error importando userService:', e);
    userService = { getClientes: async () => ({ data: [] }) };
}

try {
    ubicacionesService = require('../../../services/ubicacionesService').default;
} catch (e) {
    console.warn('Error importando ubicacionesService:', e);
    ubicacionesService = { getAll: async () => ({ data: [] }) };
}

// Datos mock
const MOCK_CLIENTES = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '3001234567' },
    { id: 2, nombre: 'María García', email: 'maria@example.com', telefono: '3007654321' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', telefono: '3009876543' },
    { id: 4, nombre: 'Ana Martínez', email: 'ana@example.com', telefono: '3005555555' },
    { id: 5, nombre: 'Luis Rodríguez', email: 'luis@example.com', telefono: '3001111111' }
];

const MOCK_UBICACIONES = [
    { id: 1, nombre: 'Centro Comercial' },
    { id: 2, nombre: 'Terminal de Transporte' },
    { id: 3, nombre: 'Estación de Tren' },
    { id: 4, nombre: 'Aeropuerto' },
    { id: 5, nombre: 'Zona Residencial Norte' },
    { id: 6, nombre: 'Zona Residencial Sur' },
    { id: 7, nombre: 'Hospital Central' },
    { id: 8, nombre: 'Universidad' }
];

// Schema de validación
const reservaSchema = Yup.object().shape({
    nombreCliente: Yup.string().required('El cliente es requerido'),
    pasajeros: Yup.array().min(1, 'Debe agregar al menos un pasajero').required('Los pasajeros son requeridos'),
    origen: Yup.string().required('El origen es requerido'),
    destino: Yup.string().required('El destino es requerido'),
    fecha: Yup.string().required('La fecha es requerida'),
    hora: Yup.string().required('La hora es requerida'),
    precio: Yup.number().required('El precio es requerido').min(0, 'El precio debe ser mayor a 0'),
    estado: Yup.string().required('El estado es requerido')
});

const EditReservaModal = ({ isOpen, onClose, onConfirm, reserva }) => {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [showEditarAsignacion, setShowEditarAsignacion] = useState(false);
    const [conductorAsignado, setConductorAsignado] = useState(null);
    const [nuevoNombrePasajero, setNuevoNombrePasajero] = useState('');
    const [nuevoTelefonoPasajero, setNuevoTelefonoPasajero] = useState('');

    // Cargar datos del backend
    useEffect(() => {
        if (isOpen) {
            cargarDatos();
            setNuevoNombrePasajero('');
            setNuevoTelefonoPasajero('');
        }
    }, [isOpen]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setSubmitError(null);

            // Cargar clientes
            let clientesData = [];
            try {
                const responseClientes = await userService.getClientes();
                console.log('Respuesta clientes completa:', responseClientes);
                
                // Si es un array directamente
                if (Array.isArray(responseClientes)) {
                    clientesData = responseClientes;
                }
                // Si tiene propiedad 'data'
                else if (responseClientes?.data) {
                    clientesData = Array.isArray(responseClientes.data) 
                        ? responseClientes.data 
                        : responseClientes.data.usuarios || responseClientes.data.data || [];
                }
                // Si tiene propiedad 'usuarios'
                else if (responseClientes?.usuarios) {
                    clientesData = Array.isArray(responseClientes.usuarios) 
                        ? responseClientes.usuarios 
                        : [];
                }
                // Si tiene propiedad 'success' (estructura diferente)
                else if (responseClientes?.success && responseClientes?.result) {
                    clientesData = Array.isArray(responseClientes.result) 
                        ? responseClientes.result 
                        : [];
                }
                
                console.log('Clientes procesados:', clientesData);
            } catch (err) {
                console.warn('Error al cargar clientes del backend:', err);
            }

            // Si no hay datos del backend, usar mock
            if (!clientesData || clientesData.length === 0) {
                console.log('Usando datos mock de clientes');
                clientesData = MOCK_CLIENTES;
            }
            
            setClientes(clientesData || []);

            // Cargar ubicaciones
            let ubicacionesData = [];
            try {
                const responseUbicaciones = await ubicacionesService.getAll();
                console.log('Respuesta ubicaciones completa:', responseUbicaciones);
                
                // Si es un array directamente
                if (Array.isArray(responseUbicaciones)) {
                    ubicacionesData = responseUbicaciones;
                }
                // Si tiene propiedad 'data'
                else if (responseUbicaciones?.data) {
                    ubicacionesData = Array.isArray(responseUbicaciones.data) 
                        ? responseUbicaciones.data 
                        : responseUbicaciones.data.ubicaciones || responseUbicaciones.data.data || [];
                }
                // Si tiene propiedad 'ubicaciones'
                else if (responseUbicaciones?.ubicaciones) {
                    ubicacionesData = Array.isArray(responseUbicaciones.ubicaciones) 
                        ? responseUbicaciones.ubicaciones 
                        : [];
                }
                // Si tiene propiedad 'success' (estructura diferente)
                else if (responseUbicaciones?.success && responseUbicaciones?.result) {
                    ubicacionesData = Array.isArray(responseUbicaciones.result) 
                        ? responseUbicaciones.result 
                        : [];
                }
                
                console.log('Ubicaciones procesadas:', ubicacionesData);
            } catch (err) {
                console.warn('Error al cargar ubicaciones del backend:', err);
            }

            // Si no hay datos del backend, usar mock
            if (!ubicacionesData || ubicacionesData.length === 0) {
                console.log('Usando datos mock de ubicaciones');
                ubicacionesData = MOCK_UBICACIONES;
            }

            setUbicaciones(ubicacionesData || []);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setSubmitError('Error al cargar datos del servidor');
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: reserva ? {
            nombreCliente: reserva.idCliente || '',
            pasajeros: Array.isArray(reserva.pasajeros) ? reserva.pasajeros : [reserva.pasajeros] || [],
            origen: reserva.origen || '',
            destino: reserva.destino || '',
            fecha: reserva.fecha || '',
            hora: reserva.hora || '',
            precio: reserva.precio || '',
            estado: reserva.estado || 'Pendiente'
        } : {
            nombreCliente: '',
            pasajeros: [],
            origen: '',
            destino: '',
            fecha: '',
            hora: '',
            precio: '',
            estado: 'Pendiente'
        },
        validationSchema: reservaSchema || undefined,
        validateOnChange: true,
        validateOnBlur: true,
        onSubmit: async (values) => {
            try {
                setSubmitError(null);

                // Buscar datos del cliente seleccionado
                const clienteSeleccionado = clientes.find(c => c.id == values.nombreCliente);

                const updatedReserva = {
                    id: reserva?.id,
                    idCliente: parseInt(values.nombreCliente),
                    nombreCliente: clienteSeleccionado?.nombre || 'No disponible',
                    pasajeros: values.pasajeros,
                    origen: values.origen,
                    destino: values.destino,
                    fecha: values.fecha,
                    hora: values.hora,
                    precio: parseFloat(values.precio),
                    estado: values.estado,
                    idConductor: conductorAsignado?.idConductor || reserva?.idConductor || null,
                    nombreConductor: conductorAsignado?.nombreConductor || reserva?.nombreConductor || null,
                    idVehiculo: conductorAsignado?.idVehiculo || reserva?.idVehiculo || null,
                    placaVehiculo: conductorAsignado?.placaVehiculo || reserva?.placaVehiculo || null
                };

                if (onConfirm) onConfirm(updatedReserva);

                setTimeout(() => {
                    formik.resetForm();
                    setConductorAsignado(null);
                    setNuevoNombrePasajero('');
                    setNuevoTelefonoPasajero('');
                    onClose();
                }, 500);
            } catch (err) {
                setSubmitError(err.message || 'Error al actualizar la reserva');
            }
        }
    });

    // Funciones de gestión
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

    const handleEliminarPasajero = (index) => {
        const pasajerosActuales = formik.values.pasajeros;
        formik.setFieldValue('pasajeros', pasajerosActuales.filter((_, i) => i !== index));
    };

    // Obtener fecha mínima (hoy)
    const getMinDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    };

    const handleClose = () => {
        setSubmitError(null);
        setConductorAsignado(null);
        setNuevoNombrePasajero('');
        setNuevoTelefonoPasajero('');
        onClose();
    };

    const handleEditarAsignacion = (asignacion) => {
        setConductorAsignado(asignacion);
        console.log('Asignación actualizada:', asignacion);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl">
            <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
                    >
                        <md-icon className="text-xl flex items-center justify-center">close</md-icon>
                    </button>
                </div>

                <div className="px-8">
                    <div className="leading-tight mb-5">
                        <h2 className="h2 font-medium text-primary">Editar reserva</h2>
                        <p className="h5 text-secondary font-medium">Información básica de la reserva</p>
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
                                    className="select-filter w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors text-sm"
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

                        {/* Pasajeros - Nueva estructura */}
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

                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col gap-1">
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
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="subtitle1 text-primary font-medium text-sm">Estado *</label>
                                        <div className='select-wrapper w-full'>
                                            <md-icon className="text-sm">arrow_drop_down</md-icon>
                                            <select
                                                name="estado"
                                                value={formik.values.estado}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="select-filter w-full px-4 py-3 input bg-fill border border-outline rounded-lg text-primary focus:outline-none focus:border-primary transition-colors text-sm"
                                            >
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="Activo">Activo</option>
                                                <option value="Completada">Completada</option>
                                                <option value="Cancelada">Cancelada</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="subtitle1 text-primary font-medium">Asignación de Conductor</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditarAsignacion(true)}
                                        className="px-4 py-2 bg-outline text-secondary rounded-lg hover:bg-border transition-all duration-200 flex items-center gap-2 font-medium text-xs"
                                    >
                                        <md-icon className="text-base">assignment_ind</md-icon>
                                        {conductorAsignado?.nombreConductor || reserva?.nombreConductor ? `${conductorAsignado?.nombreConductor || reserva?.nombreConductor}` : 'Asignar'}
                                    </button>
                                    {(conductorAsignado?.placaVehiculo || reserva?.placaVehiculo) && (
                                        <p className="text-xs text-secondary">{conductorAsignado?.placaVehiculo || reserva?.placaVehiculo}</p>
                                    )}
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
                                {formik.isSubmitting ? 'Actualizando...' : 'Actualizar'}
                            </md-filled-button>
                        </div>
                    </form>
                </div>
            </main>
            
            <EditarAsignacionModal 
                isOpen={showEditarAsignacion}
                onClose={() => setShowEditarAsignacion(false)}
                onConfirm={handleEditarAsignacion}
                reserva={reserva || {}}
            />
        </Modal>
    );
};

export default EditReservaModal;
