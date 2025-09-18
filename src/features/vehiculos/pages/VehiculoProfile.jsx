import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useState } from 'react';

const VehiculoProfile = ({ vehicle, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [isClosing, setIsClosing] = useState(false);

    if (!isOpen || !vehicle) return null;

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
                        className='text-secondary p-2 mr-2 btn-search rounded-full hover:text-white transition-colors cursor-pointer'
                    >
                        <md-icon className="text-xl flex items-center justify-center">arrow_back</md-icon>
                    </button>
                    <h2 className='h4 font-medium text-white'>Vehículo</h2>
                </div>
                <div className='flex gap-2'>
                    <div>
                        <md-filled-button className="btn-add px-6 py-2">
                            <md-icon slot="icon" className="text-sm text-on-primary">edit</md-icon>
                            Editar vehículo
                        </md-filled-button>
                    </div>
                    <div>
                        <md-filled-button className="btn-add px-5">
                            <md-icon slot="icon" className="text-sm text-on-primary">add</md-icon>
                            Agregar un vehículo
                        </md-filled-button>
                    </div>
                </div>
            </div>

            <div className='bg-primary text-on-primary content-box-small'>
                <h1 className='h3 text-on-primary'>{vehicle.name}</h1>
                <span className='subtitle1 font-medium text-on-primary'>{vehicle.plate}</span>
            </div>

            <div className="flex flex-col gap-3 flex-1">
                <div className="flex flex-col">
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1 text-primary font-light">Estado del vehículo</span>
                        <div className='flex mt-1'>
                            <button className={`btn font-medium btn-lg flex items-center ${vehicle.status === 'Activo' ? 'btn-primary' : 'btn-secondary'}`}>
                                {vehicle.status}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1 text-primary font-light">Descripción</span>
                        <span className='subtitle1 text-secondary mt-1'>
                            Placa: {vehicle.plate}
                        </span>
                        <span className='subtitle1 text-secondary mt-1'>
                            Capacidad: {vehicle.capacity}
                        </span>
                        <span className='subtitle1 text-secondary mt-1'>
                            Modelo: {vehicle.model}
                        </span>
                        <div className='flex mt-1'>
                            <button className='btn btn-primary font-medium btn-lg flex items-center'>
                                Editar
                            </button>
                        </div>
                    </div>
                </div>

                <div className="content-box-outline-3-small">
                    <span className="subtitle1 text-primary font-light">Permisos</span>
                    <div className='flex mt-1'>
                        <button className='btn btn-primary font-medium btn-lg flex items-center'>
                            Ver permisos
                        </button>
                    </div>
                </div>

                <div className='mt-14'>
                    <button className=' font-medium flex text-red items-center'>
                        <md-icon className="text-sm">delete</md-icon>
                        Eliminar vehículo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VehiculoProfile;
