import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState, useEffect } from 'react';

// Ejemplo de campos para usuario y rol
const userFields = [
    { label: 'Nombre', name: 'nombre', type: 'text', required: true },
    { label: 'Correo', name: 'correo', type: 'email', required: true },
    { label: 'Tipo de documento', name: 'tipoDoc', type: 'select', required: true },
    { label: 'Número de documento', name: 'numDocumento', type: 'text', required: true },
    { label: 'Teléfono', name: 'telefono', type: 'text', required: true },
    { label: 'Dirección', name: 'direccion', type: 'text', required: true },
    { label: 'Ciudad', name: 'idCiudad', type: 'select', required: true },
    { label: 'Rol', name: 'idRol', type: 'select', required: true },
];

const roleFields = [
    { label: 'Nombre del rol', name: 'nombreRol', type: 'text', required: true },
    { label: 'Descripción', name: 'descripcion', type: 'text', required: false },
];

export default function EditModal({ isOpen, onClose, onConfirm, itemType = 'usuario', fields, itemData }) {
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [ciudades, setCiudades] = useState([]);
    const [roles, setRoles] = useState([]);
    const [tiposDoc, setTiposDoc] = useState([]);

    useEffect(() => {
        if (isOpen && itemData) {
            setForm({ ...itemData });
            setError(null);
            setSuccess(false);
        }
    }, [isOpen, itemData]);

    useEffect(() => {
        if (!isOpen) {
            setForm({});
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    // Fetchs para selects si es usuario
    useEffect(() => {
        if (isOpen && itemType === 'usuario') {
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/ciudades`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.data)) {
                        setCiudades(data.data);
                    }
                });
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/roles`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.data)) {
                        setRoles(data.data.filter(r => r.estado));
                    }
                });
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/tipos-documento`)
                .then(res => res.ok ? res.json() : Promise.reject(new Error('404')))
                .then(data => {
                    if (data.success && Array.isArray(data.data)) {
                        setTiposDoc(data.data);
                    } else {
                        setTiposDoc([]);
                    }
                })
                .catch(() => setTiposDoc([]));
        }
    }, [isOpen, itemType]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        // Validación básica
        const modalFields = fields || (itemType === 'rol' ? roleFields : userFields);
        for (const field of modalFields) {
            if (field.required && !form[field.name]) {
                setError(`El campo "${field.label}" es obligatorio.`);
                setLoading(false);
                return;
            }
        }
        if (itemType === 'usuario' && !form.correo.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
            setError('El correo no es válido.');
            setLoading(false);
            return;
        }
        if (itemType === 'usuario' && tiposDoc.length > 0 && !form.tipoDoc) {
            setError('Debes seleccionar un tipo de documento.');
            setLoading(false);
            return;
        }
        try {
            let endpoint = itemType === 'usuario' ? `/api/usuarios/${form.idUsuario}` : `/api/roles/${form.idRol}`;
            const payload = itemType === 'usuario' ? {
                ...form,
                idCiudad: parseInt(form.idCiudad),
                ...(form.tipoDoc ? { tipoDoc: form.tipoDoc } : {})
            } : {
                nombreRol: form.nombreRol,
                descripcion: form.descripcion || null,
                estado: true,
            };
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || `Error al editar ${itemType}`);
            setSuccess(true);
            if (onConfirm) onConfirm(data.data);
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Determinar campos y título según el tipo
    const modalFields = fields || (itemType === 'rol' ? roleFields : userFields);
    const title = `Editar ${itemType}`;
    
    // Verificar si es administrador (usuario o rol)
    const isAdminUser = itemType === 'usuario' && (
        form.rol?.nombreRol?.toLowerCase() === 'administrador' ||
        roles.find(r => r.idRol === form.idRol)?.nombreRol?.toLowerCase() === 'administrador'
    );
    
    const isAdminRole = itemType === 'rol' && form.nombreRol?.toLowerCase() === 'administrador';

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <main className='p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg'>
                <div className='flex items-center gap-1 mb-4'>
                    <button
                        type="button"
                        onClick={onClose}
                        className='text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer'
                    >
                        <md-icon className="text-xl flex items-center justify-center">close</md-icon>
                    </button>
                </div>

                <div className='px-44'>
                    <div className='leading-tight mb-5'>
                        <h2 className='h2 font-medium text-primary'>{title}</h2>
                        <p className='h5 text-secondary font-medium'>
                            {isAdminRole 
                                ? 'No se puede editar el rol Administrador' 
                                : isAdminUser
                                    ? 'Editando usuario Administrador - Campos protegidos: Rol y Estado'
                                    : `Aquí puedes editar información del ${itemType}`}
                        </p>
                    </div>
                    
                    {isAdminRole && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <md-icon className="text-yellow-600">warning</md-icon>
                                <p className="text-sm text-yellow-800 font-medium">
                                    El rol Administrador no puede ser editado por seguridad del sistema.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {isAdminUser && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <md-icon className="text-blue-600">info</md-icon>
                                <p className="text-sm text-blue-800 font-medium">
                                    Puedes editar la información personal, pero los campos <strong>Rol</strong> y <strong>Estado</strong> están protegidos.
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4 mb-4">
                            {modalFields.map((field) => (
                                <div key={field.name} className="flex flex-col gap-1">
                                    <label className="subtitle1 text-primary font-medium" htmlFor={field.name}>{field.label}</label>
                                    {field.type === 'select' && field.name === 'tipoDoc' ? (
                                        tiposDoc.length > 0 ? (
                                            <div className='select-wrapper w-full'>
                                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                                <select
                                                    id={field.name}
                                                    name={field.name}
                                                    required={field.required && tiposDoc.length > 0}
                                                    value={form[field.name] || ''}
                                                    onChange={handleChange}
                                                    disabled={isAdminRole}
                                                    className='select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                                    aria-label="Tipo de documento"
                                                >
                                                    <option value="">Selecciona el tipo de documento</option>
                                                    {tiposDoc.map((t) => (
                                                        <option key={t.idTipoDoc} value={t.idTipoDoc}>{t.nombreTipoDoc}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className='text-secondary text-sm'>Se usará el tipo de documento por defecto.</div>
                                        )
                                    ) : field.type === 'select' && field.name === 'idCiudad' ? (
                                        <div className='select-wrapper w-full'>
                                            <md-icon className="text-sm">arrow_drop_down</md-icon>
                                            <select
                                                id={field.name}
                                                name={field.name}
                                                required={field.required}
                                                value={form[field.name] || ''}
                                                onChange={handleChange}
                                                disabled={isAdminRole}
                                                className='select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                                aria-label="Ciudad"
                                            >
                                                <option value="">Selecciona la ciudad</option>
                                                {ciudades.map((c) => (
                                                    <option key={c.idCiudad} value={c.idCiudad}>{c.nombreCiudad}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : field.type === 'select' && field.name === 'idRol' ? (
                                        <div className='select-wrapper w-full'>
                                            <md-icon className="text-sm">arrow_drop_down</md-icon>
                                            <select
                                                id={field.name}
                                                name={field.name}
                                                required={field.required}
                                                value={form[field.name] || ''}
                                                onChange={handleChange}
                                                disabled={isAdminUser || isAdminRole}
                                                className='select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                                aria-label="Rol"
                                            >
                                                <option value="">Selecciona un rol</option>
                                                {roles.map((r) => (
                                                    <option key={r.idRol} value={r.idRol}>{r.nombreRol}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            required={field.required}
                                            value={form[field.name] || ''}
                                            onChange={handleChange}
                                            disabled={isAdminRole}
                                            className="w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        {error && <div className="text-red mb-2">{error}</div>}
                        {success && (
                            <div className="text-green mb-2 text-center">
                                <strong>¡{itemType === 'rol' ? 'Rol' : 'Usuario'} actualizado correctamente!</strong>
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button type="button" className="btn px-5 text-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <md-filled-button 
                                className="btn-add px-24" 
                                type="submit" 
                                disabled={loading || success || isAdminRole}
                            >
                                {loading ? 'Actualizando...' : success ? 'Actualizado' : 'Actualizar'}
                            </md-filled-button>
                        </div>
                    </form>
                </div>
            </main>
        </Modal>
    );
}
