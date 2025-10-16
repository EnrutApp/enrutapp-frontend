import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useState, useEffect } from 'react';

const userFields = [
    { label: 'Nombre', name: 'nombre', type: 'text', required: true, placeholder: 'Aqui el nombre' },
    { label: 'Correo', name: 'correo', type: 'email', required: true, placeholder: 'Aqui el correo' },
    { label: 'Tipo de documento', name: 'tipoDoc', type: 'select', required: true },
    { label: 'Número de documento', name: 'numDocumento', type: 'text', required: true, placeholder: 'Aqui el numero de documento' },
    { label: 'Teléfono', name: 'telefono', type: 'text', required: true, placeholder: 'Aqui el teléfono' },
    { label: 'Dirección', name: 'direccion', type: 'text', required: true, placeholder: 'Aqui la dirección' },
    { label: 'Ciudad', name: 'idCiudad', type: 'select', required: true },
    { label: 'Rol', name: 'idRol', type: 'select', required: true },
];

const roleFields = [
    { label: 'Nombre del rol', name: 'nombreRol', type: 'text', required: true, placeholder: 'Aqui el nombre' },
    { label: 'Descripción', name: 'descripcion', type: 'text', required: false, placeholder: 'Aqui la descripción' },
];

const AddModal = ({ isOpen, onClose, onConfirm, itemType = 'usuario', fields }) => {
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedPassword, setGeneratedPassword] = useState(null);
    const [ciudades, setCiudades] = useState([]);
    const [success, setSuccess] = useState(false);
    const [roles, setRoles] = useState([]);
    const [tiposDoc, setTiposDoc] = useState([]);

    useEffect(() => {
        if (!isOpen) {
            setForm({});
            setError(null);
            setSuccess(false);
            setGeneratedPassword(null);
        }
    }, [isOpen]);

    // Obtener ciudades, roles y tipos de documento al abrir el modal
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

    function generarPasswordAleatoria(length = 8) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let pass = '';
        for (let i = 0; i < length; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pass;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        // Validación básica
        if (itemType === 'usuario') {
            for (const field of userFields) {
                if (field.required && !form[field.name]) {
                    setError(`El campo "${field.label}" es obligatorio.`);
                    setLoading(false);
                    return;
                }
            }
            if (!form.correo.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
                setError('El correo no es válido.');
                setLoading(false);
                return;
            }
            if (!form.idRol) {
                setError('Debes seleccionar un rol.');
                setLoading(false);
                return;
            }
            if (tiposDoc.length > 0 && !form.tipoDoc) {
                setError('Debes seleccionar un tipo de documento.');
                setLoading(false);
                return;
            }
            // Verificaciones de duplicado antes de enviar
            try {
                const emailChk = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/usuarios/check-email/${encodeURIComponent(form.correo)}`);
                const emailData = await emailChk.json();
                if (emailData?.exists) {
                    setError('El correo ya está registrado.');
                    setLoading(false);
                    return;
                }
                const docChk = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/usuarios/check-document/${encodeURIComponent(form.tipoDoc)}/${encodeURIComponent(form.numDocumento)}`);
                const docData = await docChk.json();
                if (docData?.exists) {
                    setError('El número de documento ya está registrado.');
                    setLoading(false);
                    return;
                }
            } catch (preErr) {
                // Si fallan los checks, no bloqueamos pero seguimos
                console.warn('Checks de duplicado fallaron:', preErr);
            }
        }
        let password = generarPasswordAleatoria(10);
        setGeneratedPassword(password);
        try {
            let endpoint = '/api/usuarios';
            if (itemType === 'rol') endpoint = '/api/roles';
            const payload = itemType === 'usuario' ? {
                ...form,
                contrasena: password,
                idRol: form.idRol,
                idCiudad: parseInt(form.idCiudad),
                ...(form.tipoDoc ? { tipoDoc: form.tipoDoc } : {})
            } : {
                nombreRol: form.nombreRol,
                descripcion: form.descripcion || null,
                estado: true,
            };
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || `Error al agregar ${itemType}`);
            setSuccess(true);
            if (onConfirm) onConfirm(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Determinar campos y título según el tipo
    const modalFields = fields || (itemType === 'rol' ? roleFields : userFields);
    const title = itemType === 'rol' && form.nombreRol ? `Añadir rol: ${form.nombreRol}` : `Añadir ${itemType}`;

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
                        <p className='h5 text-secondary font-medium'>Aquí puedes agregar información del {itemType}</p>
                    </div>

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
                                                    className='select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors'
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
                                                className='select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors'
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
                                                className='select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors'
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
                                            placeholder={field.placeholder}
                                            value={form[field.name] || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        {error && <div className="text-red mb-2">{error}</div>}
                        {success && (
                            <div className="text-green mb-2 text-center">
                                <strong>¡Usuario agregado correctamente!</strong><br />
                                {generatedPassword && itemType === 'usuario' && (
                                    <>
                                        <span>La contraseña fue enviada al correo del usuario.</span><br />
                                        <span className="font-mono">{generatedPassword}</span>
                                    </>
                                )}
                            </div>
                        )}
                        {!success && generatedPassword && itemType === 'usuario' && (
                            <div className="text-green mb-2 text-center">
                                <strong>Contraseña generada para el usuario:</strong> <span className="font-mono">{generatedPassword}</span>
                                <br />Compártela con el usuario o envíala por correo.
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button className="btn px-5 text-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <md-filled-button className="btn-add px-24" type="submit" disabled={loading}>
                                {loading ? 'Agregando...' : 'Agregar'}
                            </md-filled-button>
                        </div>
                    </form>
                </div>

            </main>
        </Modal>
    );
};

export default AddModal;
