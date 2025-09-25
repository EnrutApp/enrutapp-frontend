import Modal from '../Modal'
import '@material/web/icon/icon.js'
import '@material/web/button/filled-button.js';
import Avvvatars from 'avvvatars-react';
import { useAuth } from '../../../context/AuthContext';
import { useState } from 'react';
import LogoutModal from '../logoutModal/LogoutModal';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true)
    }

    const handleLogoutConfirm = () => {
        logout()
        setIsLogoutModalOpen(false)
    }

    const handleLogoutCancel = () => {
        setIsLogoutModalOpen(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='lg'>
            <main className="p-6">
                <div className='flex items-center gap-1 mb-4'>
                    <button
                        onClick={onClose}
                        className='text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer'
                    >
                        <md-icon className="text-xl flex items-center justify-center">close</md-icon>
                    </button>
                    <h2 className='h4 font-medium text-primary'>Perfil de Usuario</h2>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                    <div className='bg-background content-box-small flex items-center'>
                        <div className='border-6 border-border rounded-full relative'>
                            <Avvvatars value={user?.nombre || 'Usuario'} size={80} />
                            <div className='absolute -bottom-2 -right-1 px-1 bg-black rounded-full border-background hover:opacity-80 transition-all cursor-pointer'>
                                <md-icon className='text-white text-sm'>photo_camera</md-icon>
                            </div>
                        </div>
                        <h1 className='h3'>{user?.nombre || 'Usuario sin nombre'}</h1>
                        <div className="text-center">
                            <span className="inline-block px-3 py-1 bg-primary text-on-primary rounded-full caption font-medium">
                                {user?.rol?.nombreRol || 'Rol no definido'}
                            </span>
                        </div>
                    </div>

                    <div className='content-box-outline-3-small'>
                        <span className="subtitle1 text-primary font-light">Email:</span>
                        <span className='subtitle1 text-secondary mt-1'>{user?.correo || 'Email no disponible'}</span>
                    </div>

                    <div className='content-box-outline-3-small'>
                        <span className="subtitle1 text-primary font-light">Documento:</span>
                        <span className='subtitle1 text-secondary mt-1'>
                            {user?.numDocumento || 'Documento no disponible'}
                            {user?.tipoDocumento?.nombreTipoDoc && ` (${user.tipoDocumento.nombreTipoDoc})`}
                        </span>
                    </div>

                    <div className='content-box-outline-3-small'>
                        <span className="subtitle1 text-primary font-light">Teléfono:</span>
                        <span className='subtitle1 text-secondary mt-1'>{user?.telefono || 'Teléfono no disponible'}</span>
                        <div className='flex justify-end'>
                            <button className='btn-secondary btn-sm cursor-pointer'>Editar</button>
                        </div>
                    </div>

                    <div className='content-box-outline-3-small'>
                        <span className="subtitle1 text-primary font-light">Dirección:</span>
                        <span className='subtitle1 text-secondary mt-1'>{user?.direccion || 'Dirección no disponible'}</span>
                    </div>

                    <div className='content-box-outline-3-small'>
                        <span className="subtitle1 text-primary font-light">Ciudad:</span>
                        <span className='subtitle1 text-secondary mt-1'>{user?.ciudad || 'Ciudad no disponible'}</span>
                    </div>

                    <div className='content-box-outline-3-small'>
                        <span className="subtitle1 text-primary font-light">Estado:</span>
                        <span className={`subtitle1 mt-1 font-medium ${user?.estado ? 'text-green-600' : 'text-red-600'}`}>
                            {user?.estado ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <button
                        className='btn btn-secondary w-full text-red'
                        onClick={handleLogoutClick}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </main>
            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={handleLogoutCancel}
                onConfirm={handleLogoutConfirm}
            />
        </Modal>
    )
}

export default ProfileModal;
