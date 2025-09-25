import Modal from '../Modal'
import { useState } from 'react'
import { useTheme } from '../../../context/ThemeContext'
import ChangePassword from '../../changePassword/ChangePassword'
import '@material/web/icon/icon.js'
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'

const SettingsModal = ({ isOpen, onClose }) => {
    const { theme, toggleTheme, isDark } = useTheme();
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size='lg'>
                <main className="p-6">
                    <div className='flex items-center gap-1 mb-6'>
                        <button
                            onClick={onClose}
                            className='text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer'
                        >
                            <md-icon className="text-xl flex items-center justify-center">close</md-icon>
                        </button>
                        <h2 className='h4 font-medium text-primary'>Configuración</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="border-b border-border pb-6">
                            <h3 className="text-lg font-medium text-primary mb-4">Apariencia</h3>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-primary font-medium">Tema</span>
                                    <span className="text-secondary text-sm">
                                        {isDark ? 'Modo oscuro activado' : 'Modo claro activado'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <md-icon className="text-secondary text-xl">
                                        {isDark ? 'dark_mode' : 'light_mode'}
                                    </md-icon>
                                    <md-switch
                                        selected={isDark}
                                        onClick={toggleTheme}
                                        className="cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-border pb-6">
                            <h3 className="text-lg font-medium text-primary mb-4">Seguridad</h3>

                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-primary font-medium">Contraseña</span>
                                    <span className="text-secondary text-sm">
                                        Cambia tu contraseña actual
                                    </span>
                                </div>
                                <md-filled-button
                                    className="btn btn-primary"
                                    onClick={() => setIsChangePasswordOpen(true)}
                                >
                                    <md-icon slot="icon">lock</md-icon>
                                    Cambiar contraseña
                                </md-filled-button>
                            </div>
                        </div>
                    </div>
                </main>
            </Modal>

            <ChangePassword
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </>
    )
}

export default SettingsModal;
