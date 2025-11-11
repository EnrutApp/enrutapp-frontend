import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState, useEffect } from 'react';
import { conductorService } from '../../../services/conductorService';
import { vehiculoService } from '../../../services/vehiculoService';

const turnoFields = [
    { label: 'Conductor', name: 'idConductor', type: 'select', required: true },
    { label: 'Vehículo', name: 'idVehiculo', type: 'select', required: true },
    { label: 'Fecha', name: 'fecha', type: 'date', required: true },
    { label: 'Hora', name: 'hora', type: 'text', required: true, placeholder: '4:00 AM' },
];

const AddTurnoModal = ({ isOpen, onClose, onSubmitTurno }) => {
    const [conductores, setConductores] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [form, setForm] = useState({
        idConductor: '',
        idVehiculo: '',
        fecha: '',
        hora: '',
        estado: 'Programado',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setForm({
                idConductor: '',
                idVehiculo: '',
                fecha: '',
                hora: '',
                estado: 'Programado',
            });
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            cargarDatos();
        }
    }, [isOpen]);

    const cargarDatos = async () => {
        try {
            const [resConductores, resVehiculos] = await Promise.all([
                conductorService.getConductores(),
                vehiculoService.getVehiculos(),
            ]);
            
            const listConductores = resConductores?.data || resConductores;
            const listVehiculos = resVehiculos?.data || resVehiculos;
            
            setConductores(Array.isArray(listConductores) ? listConductores.filter(c => c.estado) : []);
            setVehiculos(Array.isArray(listVehiculos) ? listVehiculos.filter(v => v.estado) : []);
        } catch (err) {
            console.error('Error al cargar datos', err);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleEstado = () => {
        setForm({ 
            ...form, 
            estado: form.estado === 'Programado' ? 'Cancelado' : 'Programado' 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Validación básica
        for (const field of turnoFields) {
            if (field.required && !form[field.name]) {
                setError(`El campo "${field.label}" es obligatorio.`);
                setLoading(false);
                return;
            }
        }

        // Validar formato de hora
        if (!form.hora.match(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)) {
            setError('La hora debe tener el formato HH:MM AM/PM (ejemplo: 4:00 AM)');
            setLoading(false);
            return;
        }

        try {
            const fechaISO = new Date(form.fecha).toISOString();
            
            await onSubmitTurno({
                ...form,
                fecha: fechaISO,
            });
            
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Error al crear turno');
        } finally {
            setLoading(false);
        }
    };

    const title = 'Asignar un turno';

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <main className='p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg'>
                <div className='flex items-center justify-between mb-4'>
                    <button
                        type="button"
                        onClick={onClose}
                        className='text-secondary p-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer'
                    >
                        <md-icon className="text-xl flex items-center justify-center">close</md-icon>
                    </button>

                    {/* Estado Badge y Botón Toggle */}
                    <div className='flex items-center gap-3'>
                        {form.estado === 'Programado' ? (
                            <span className='flex items-center gap-1 px-3 py-1 bg-green/10 text-green rounded-full text-sm font-medium'>
                                <md-icon className="text-base">check_circle</md-icon>
                                Programado
                            </span>
                        ) : (
                            <span className='flex items-center gap-1 px-3 py-1 bg-red/10 text-red rounded-full text-sm font-medium'>
                                <md-icon className="text-base">cancel</md-icon>
                                Cancelado
                            </span>
                        )}
                        
                        <button
                            type="button"
                            onClick={toggleEstado}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                form.estado === 'Programado'
                                    ? 'bg-red/10 text-red hover:bg-red/20'
                                    : 'bg-green/10 text-green hover:bg-green/20'
                            }`}
                        >
                            {form.estado === 'Programado' ? 'Cancelar' : 'Programar'}
                        </button>
                    </div>
                </div>

                <div className='px-44'>
                    <div className='leading-tight mb-5'>
                        <h2 className='h2 font-medium text-primary'>{title}</h2>
                        <p className='h5 text-secondary font-medium'>Aquí puedes agregar información del turno</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4 mb-4">
                            {turnoFields.map((field) => (
                                <div key={field.name} className="flex flex-col gap-1">
                                    <label className="subtitle1 text-primary font-medium" htmlFor={field.name}>
                                        {field.label}
                                    </label>
                                    {field.type === 'select' && field.name === 'idConductor' ? (
                                        <div className='select-wrapper w-full'>
                                            <md-icon className="text-sm">arrow_drop_down</md-icon>
                                            <select
                                                id={field.name}
                                                name={field.name}
                                                required={field.required}
                                                value={form[field.name] || ''}
                                                onChange={handleChange}
                                                className='select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors'
                                                aria-label="Conductor"
                                            >
                                                <option value="">Seleccione un conductor</option>
                                                {conductores.map((c) => (
                                                    <option key={c.idConductor} value={c.idConductor}>
                                                        {c.nombre} {c.apellido} - {c.cedula}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : field.type === 'select' && field.name === 'idVehiculo' ? (
                                        <div className='select-wrapper w-full'>
                                            <md-icon className="text-sm">arrow_drop_down</md-icon>
                                            <select
                                                id={field.name}
                                                name={field.name}
                                                required={field.required}
                                                value={form[field.name] || ''}
                                                onChange={handleChange}
                                                className='select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors'
                                                aria-label="Vehículo"
                                            >
                                                <option value="">Seleccione un vehículo</option>
                                                {vehiculos.map((v) => (
                                                    <option key={v.idVehiculo} value={v.idVehiculo}>
                                                        {v.placa} - {v.linea} ({v.marcaVehiculo?.nombreMarca || ''})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            value={form[field.name] || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                                        />
                                    )}
                                    {field.name === 'hora' && (
                                        <span className="text-xs text-secondary">
                                            Formato: HH:MM AM/PM (ejemplo: 4:00 AM)
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {error && <div className="text-red mb-2">{error}</div>}
                        {success && (
                            <div className="text-green mb-2 text-center">
                                <strong>¡Turno agregado correctamente!</strong>
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button type="button" className="btn px-5 text-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <md-filled-button className="btn-add px-24" type="submit" disabled={loading || success}>
                                {loading ? 'Agregando...' : success ? 'Agregado' : 'Guardar turno'}
                            </md-filled-button>
                        </div>
                    </form>
                </div>
            </main>
        </Modal>
    );
};

export default AddTurnoModal;
