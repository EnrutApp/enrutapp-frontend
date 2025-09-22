import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import VehiculoProfile from './pages/VehiculoProfile';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import { useState } from 'react';

const Vehiculos = () => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [vehicleToSwitch, setVehicleToSwitch] = useState(null);
    const allVehicles = [
        {
            name: 'Renault Alaskan',
            plate: 'JYN023',
            capacity: '5 pasajeros',
            model: '2018',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Sandero',
            plate: 'ABC456',
            capacity: '5 pasajeros',
            model: '2018',
            status: 'Mantenimiento',
            image: '/sandero.png',
            statusIcon: 'pause'
        },
        {
            name: 'Toyota Hilux',
            plate: 'DEF789',
            capacity: '4 pasajeros',
            model: '2020',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Chevrolet Spark',
            plate: 'GHI012',
            capacity: '4 pasajeros',
            model: '2019',
            status: 'Inactivo',
            image: '/sandero.png',
            statusIcon: 'block'
        },
        {
            name: 'Ford Ranger',
            plate: 'JKL345',
            capacity: '5 pasajeros',
            model: '2021',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Nissan Frontier',
            plate: 'MNO678',
            capacity: '5 pasajeros',
            model: '2017',
            status: 'Mantenimiento',
            image: '/sandero.png',
            statusIcon: 'pause'
        },
        {
            name: 'Renault Alaskan',
            plate: 'JYN023',
            capacity: '5 pasajeros',
            model: '2018',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Sandero',
            plate: 'ABC456',
            capacity: '5 pasajeros',
            model: '2018',
            status: 'Mantenimiento',
            image: '/sandero.png',
            statusIcon: 'pause'
        },
        {
            name: 'Toyota Hilux',
            plate: 'DEF789',
            capacity: '4 pasajeros',
            model: '2020',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Chevrolet Spark',
            plate: 'GHI012',
            capacity: '4 pasajeros',
            model: '2019',
            status: 'Inactivo',
            image: '/sandero.png',
            statusIcon: 'block'
        },
        {
            name: 'Ford Ranger',
            plate: 'JKL345',
            capacity: '5 pasajeros',
            model: '2021',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Nissan Frontier',
            plate: 'MNO678',
            capacity: '5 pasajeros',
            model: '2017',
            status: 'Mantenimiento',
            image: '/sandero.png',
            statusIcon: 'pause'
        },
        {
            name: 'Renault Alaskan',
            plate: 'JYN023',
            capacity: '5 pasajeros',
            model: '2018',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Sandero',
            plate: 'ABC456',
            capacity: '5 pasajeros',
            model: '2018',
            status: 'Mantenimiento',
            image: '/sandero.png',
            statusIcon: 'pause'
        },
        {
            name: 'Toyota Hilux',
            plate: 'DEF789',
            capacity: '4 pasajeros',
            model: '2020',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Chevrolet Spark',
            plate: 'GHI012',
            capacity: '4 pasajeros',
            model: '2019',
            status: 'Inactivo',
            image: '/sandero.png',
            statusIcon: 'block'
        },
        {
            name: 'Ford Ranger',
            plate: 'JKL345',
            capacity: '5 pasajeros',
            model: '2021',
            status: 'Activo',
            image: '/alaskan.png',
            statusIcon: 'check'
        },
        {
            name: 'Nissan Frontier',
            plate: 'MNO678',
            capacity: '5 pasajeros',
            model: '2017',
            status: 'Mantenimiento',
            image: '/sandero.png',
            statusIcon: 'pause'
        }
    ];

    const handleOpenProfile = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedVehicle(null);
    };

    const handleDeleteClick = (vehicle) => {
        setVehicleToDelete(vehicle);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        // Aquí iría la lógica para eliminar el vehículo
        console.log('Eliminando vehículo:', vehicleToDelete);
        setIsDeleteModalOpen(false);
        setVehicleToDelete(null);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setVehicleToDelete(null);
    };

    const handleSwitchClick = (vehicle) => {
        setVehicleToSwitch(vehicle);
        setIsSwitchModalOpen(true);
    };

    const handleSwitchConfirm = () => {
        console.log('Cambiando estado de vehículo:', vehicleToSwitch);
        setIsSwitchModalOpen(false);
        setVehicleToSwitch(null);
    };

    const handleSwitchCancel = () => {
        setIsSwitchModalOpen(false);
        setVehicleToSwitch(null);
    };

    const {
        currentPage,
        totalPages,
        currentData: currentVehicles,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(allVehicles, 3);

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className='list-enter'>
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Vehículos</h1>
                            <div className='flex gap-2'>
                                <div>
                                    <md-filled-button className="btn-search-minimal px-6 py-2">
                                        <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                                        Buscar
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

                        <div className='flex mt-4 gap-2'>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Totales</span>
                                    <h2 className='h4 text-primary font-bold'>{totalItems}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Activos</span>
                                    <h2 className='h4 text-primary font-bold'>{allVehicles.filter(vehicle => vehicle.status === 'Activo').length}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-primary font-bold'>{allVehicles.filter(vehicle => vehicle.status === 'Inactivo').length}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Mantenimiento</span>
                                    <h2 className='h4 text-primary font-bold'>{allVehicles.filter(vehicle => vehicle.status === 'Mantenimiento').length}</h2>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 mt-3'>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select name="Estado" id="" className='select-filter'>
                                    <option value="Todos">Estado: Todos</option>
                                    <option value="Activos">Estado: Activos</option>
                                    <option value="Inactivos">Estado: Inactivos</option>
                                </select>
                            </div>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select name="Estado" id="" className='select-filter'>
                                    <option value="Nombre">Ordenar por: Nombre</option>
                                    <option value="Apellido">Ordenar por: Apellido</option>
                                </select>
                            </div>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select name="Estado" id="" className='select-filter'>
                                    <option value="Ascendente">Orden: Ascendente</option>
                                    <option value="Descendente">Orden: Descendente</option>
                                </select>
                            </div>
                        </div>

                        <div className='flex justify-between items-center mt-6 mb-4'>
                            <span className='text-sm text-secondary'>
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 3, totalItems)} de {totalItems} vehículos
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3 space-y-3'>
                            {currentVehicles.map((vehicle, index) => (
                                <div key={index} className={`content-box-outline-4-small ${vehicle.status === 'Inactivo' ? 'opacity-60' : ''} ${vehicle.status === 'Mantenimiento' ? 'opacity-60' : ''}`} onClick={() => handleOpenProfile(vehicle)}>
                                    <div className='flex items-center gap-4'>
                                        <div className='flex-shrink-0 relative'>
                                            <img src={vehicle.image} alt={vehicle.name} className='w-24 h-24 object-cover rounded-lg' />
                                            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${vehicle.status === 'Activo' ? 'btn-green' :
                                                vehicle.status === 'Mantenimiento' ? 'btn-yellow' :
                                                    'btn-red'
                                                }`}>
                                                <md-icon className={`text-xs font-bold ${vehicle.status === 'Activo' ? 'text-text-green' :
                                                    vehicle.status === 'Mantenimiento' ? 'text-text-yellow' :
                                                        'text-red'
                                                    }`}>{vehicle.statusIcon}</md-icon>
                                            </div>
                                        </div>
                                        <div className='flex-1'>
                                            <h1 className='h4 font-semibold'>{vehicle.name}</h1>
                                            <div className='flex flex-col gap-2 mt-1'>
                                                <div className='flex gap-1'>
                                                    <button className='btn btn-secondary font-medium btn-lg flex items-center'>
                                                        <md-icon slot="edit" className="text-lg">directions_car</md-icon>
                                                        <strong className='font-semibold'>Placa:</strong>{vehicle.plate}
                                                    </button>
                                                    <button className='btn btn-secondary font-medium btn-lg flex items-center'>
                                                        <strong className='font-semibold'>Capacidad:</strong>{vehicle.capacity}
                                                    </button>
                                                </div>
                                                <div className='flex gap-1'>
                                                    <button className='btn btn-secondary font-medium btn-lg flex items-center'>
                                                        <strong className='font-semibold'>Modelo: {vehicle.model}</strong>
                                                    </button>
                                                    <button className={`btn font-medium btn-lg flex items-center ${vehicle.status === 'Activo' ? 'btn-green' :
                                                        vehicle.status === 'Mantenimiento' ? 'btn-yellow' :
                                                            'btn-red'
                                                        }`}>
                                                        <md-icon slot="edit" className="text-lg">{vehicle.statusIcon}</md-icon>
                                                        {vehicle.status}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex flex-col items-end gap-2'>
                                            <md-switch
                                                icons
                                                show-only-selected-icon
                                                selected={vehicle.status === 'Activo'}
                                                onClick={(e) => { e.stopPropagation(); handleSwitchClick(vehicle); }}
                                            ></md-switch>
                                            <div className='flex gap-2'>
                                                <button className='btn btn-primary btn-lg font-medium flex items-center'>
                                                    <md-icon className="text-sm">edit</md-icon>
                                                    Editar
                                                </button>
                                                <button
                                                    className='btn btn-outline btn-lg font-medium flex items-center'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(vehicle);
                                                    }}
                                                >
                                                    <md-icon className="text-sm">delete</md-icon>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        showPagination={showPagination}
                    />
                </>
            ) : (
                <VehiculoProfile
                    vehicle={selectedVehicle}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="vehículo"
                itemName={vehicleToDelete?.name}
            />

            <SwitchModal
                isOpen={isSwitchModalOpen}
                onClose={handleSwitchCancel}
                onConfirm={handleSwitchConfirm}
                itemType="vehículo"
                isCurrentlyActive={vehicleToSwitch?.status === 'Activo'}
            />

        </section>
    );
}

export default Vehiculos;