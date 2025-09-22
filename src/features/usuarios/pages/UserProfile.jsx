import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useState } from 'react';

const UserProfile = ({ user, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [isClosing, setIsClosing] = useState(false);

    if (!isOpen || !user) return null;

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    return (
        <div className={`flex flex-col gap-4 overflow-auto ${isClosing ? 'profile-exit' : 'profile-enter'}`}
            style={{
                background: 'var(--background)',
                boxSizing: 'border-box',
                width: '100%',
                height: '100%'
            }}>

            <div className='flex justify-between items-center'>
                <div className='flex items-center gap-1'>
                    <button
                        onClick={handleClose}
                        className='text-secondary p-2 mr-2 btn-search rounded-full hover:text-primary transition-colors cursor-pointer'
                    >
                        <md-icon className="text-xl flex items-center justify-center">arrow_back</md-icon>
                    </button>
                    <h2 className='h4 font-medium text-primary'>Perfil de Usuario</h2>
                </div>
                <div className='flex gap-2'>
                    <div>
                        <md-filled-button className="btn-add px-6 py-2">
                            <md-icon slot="icon" className="text-sm text-on-primary">edit</md-icon>
                            Editar datos
                        </md-filled-button>
                    </div>
                    <div>
                        <md-filled-button className="btn-add px-5">
                            <md-icon slot="icon" className="text-sm text-on-primary">person_add</md-icon>
                            Agregar un usuario
                        </md-filled-button>
                    </div>
                </div>
            </div>

            <div className='bg-primary text-on-primary content-box-small'>
                <h1 className='h3 text-on-primary'>{user.name}</h1>
                <span className='subtitle1 font-medium text-on-primary'>{user.id}</span>
            </div>

            <div className="flex flex-col gap-3 flex-1">
                <div className="flex flex-col">
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1 text-primary font-light">Estado del usuario</span>
                        <div className='flex mt-1'>
                            <button className={`btn font-medium btn-lg flex items-center ${user.status === 'Activo' ? 'btn-primary' : 'btn-secondary'}`}>
                                {user.status}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1 text-primary font-light">Rol</span>
                        <span className='subtitle1 text-secondary mt-1'>
                            {user.role}
                        </span>
                    </div>
                </div>

                <div className="content-box-outline-3-small">
                    <span className="subtitle1 text-primary font-light">Identificación</span>
                    <span className="subtitle1 text-secondary mt-1">
                        {user.id}
                    </span>
                </div>

                <div className="content-box-outline-3">
                    <div className="flex flex-col gap-1">
                        <span className="subtitle1 text-primary font-light">Contacto</span>
                        <span className="subtitle1 text-secondary">
                            Correo: No especificado
                        </span>
                        <span className="subtitle1 text-secondary">
                            Telefono: {user.tel}
                        </span>
                        <div className="flex gap-2 flex-wrap mt-2">
                            <md-filled-button className="btn-add px-5">
                                <md-icon slot="icon" className="text-lg text-on-primary">mail</md-icon>
                                Agregar un correo
                            </md-filled-button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 mt-4 p-4 rounded-xl" style={{ background: 'var(--border)' }}>
                        <div className="flex flex-col gap-2 flex-1">
                            <span className="subtitle1 font-medium">Notificaciones</span>
                            <span className="body2 text-secondary">El usuario recibirá notificaciones por correo sobre cambios importantes.</span>
                        </div>
                        <div className="flex items-center">
                            <md-switch icons></md-switch>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1">Ciudad</span>
                        <span className="subtitle1 text-secondary mt-1">
                            {user.city}
                        </span>
                    </div>
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1">Dirección</span>
                        <span className="subtitle1 text-secondary mt-1">
                            {user.adress}
                        </span>
                    </div>
                </div>

                <div>
                    <button className='btn btn-red font-medium flex text-red items-center'>
                        <md-icon className="text-sm">delete</md-icon>
                        Eliminar usuario
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
