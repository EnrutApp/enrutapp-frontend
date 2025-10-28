import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import VehiculoProfile from './pages/VehiculoProfile';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddVehiculoModal from '../../shared/components/modal/addModal/AddVehiculoModal';
import EditVehiculoModal from '../../shared/components/modal/editModal/EditVehiculoModal';
import { vehiculoService } from '../../shared/services/vehiculoService';
import { useEffect, useMemo, useState } from 'react';

const Vehiculos = () => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [vehicleToSwitch, setVehicleToSwitch] = useState(null);
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [vehicleToEdit, setVehicleToEdit] = useState(null);

    const cargarVehiculos = async () => {
        try {
            setLoading(true);
            const res = await vehiculoService.getVehiculos();
            const list = res?.data || res; // apiClient interceptor devuelve data directamente
            setVehiculos(Array.isArray(list) ? list : []);
        } catch (err) {
            setError(err.message || 'Error al cargar vehículos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarVehiculos();
    }, []);

    const mapToCard = (v) => ({
        idVehiculo: v.idVehiculo,
        name: v.linea,
        plate: v.placa,
        capacity: v.capacidadPasajeros ? `${v.capacidadPasajeros} pasajeros` : '-',
        model: v.modelo,
        status: v.estado ? 'Activo' : 'Inactivo',
        image: v.fotoUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${v.fotoUrl}` : '/alaskan.png',
        statusIcon: v.estado ? 'check' : 'block',
        raw: v,
    });

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

    const handleDeleteConfirm = async () => {
        try {
            await vehiculoService.deleteVehiculo(vehicleToDelete?.raw?.idVehiculo || vehicleToDelete?.idVehiculo);
            await cargarVehiculos();
        } catch (err) {
            console.error('Error al eliminar', err);
        } finally {
            setIsDeleteModalOpen(false);
            setVehicleToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setVehicleToDelete(null);
    };

    const handleSwitchClick = (vehicle) => {
        setVehicleToSwitch(vehicle);
        setIsSwitchModalOpen(true);
    };

    const handleSwitchConfirm = async () => {
        try {
            const id = vehicleToSwitch?.raw?.idVehiculo || vehicleToSwitch?.idVehiculo;
            const nuevoEstado = !(vehicleToSwitch?.raw?.estado ?? (vehicleToSwitch?.status === 'Activo'));
            await vehiculoService.updateVehiculo(id, { estado: nuevoEstado });
            await cargarVehiculos();
        } catch (err) {
            console.error('Error al cambiar estado', err);
        } finally {
            setIsSwitchModalOpen(false);
            setVehicleToSwitch(null);
        }
    };

    const handleSwitchCancel = () => {
        setIsSwitchModalOpen(false);
        setVehicleToSwitch(null);
    };

    const cards = useMemo(() => vehiculos.map(mapToCard), [vehiculos]);
    const {
        currentPage,
        totalPages,
        currentData: currentVehicles,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(cards, 3);

    const handleOpenAdd = () => setIsAddOpen(true);
    const handleCloseAdd = () => setIsAddOpen(false);
    const handleSubmitVehiculo = async (form, file) => {
        await vehiculoService.createVehiculo({
            ...form,
            modelo: Number(form.modelo),
            capacidadPasajeros: Number(form.capacidadPasajeros),
            capacidadCarga: form.capacidadCarga ? Number(form.capacidadCarga) : undefined,
        }, file);
        await cargarVehiculos();
    };

    const handleOpenEdit = (vehicle) => {
        setVehicleToEdit(vehicle.raw || vehicle);
        setIsEditOpen(true);
    };
    const handleCloseEdit = () => setIsEditOpen(false);
    const handleUpdateVehiculo = async (id, data) => {
        await vehiculoService.updateVehiculo(id, data);
        await cargarVehiculos();
    };
    const handleUpdateFoto = async (id, file) => {
        await vehiculoService.updateFoto(id, file);
        await cargarVehiculos();
    };

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
                                    <md-filled-button className="btn-add px-5" onClick={handleOpenAdd}>
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
                                    <h2 className='h4 text-primary font-bold'>{cards.filter(vehicle => vehicle.status === 'Activo').length}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-primary font-bold'>{cards.filter(vehicle => vehicle.status === 'Inactivo').length}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Mantenimiento</span>
                                    <h2 className='h4 text-primary font-bold'>{0}</h2>
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
                                                <button className='btn btn-primary btn-lg font-medium flex items-center' onClick={(e) => { e.stopPropagation(); handleOpenEdit(vehicle); }}>
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
                    onEdit={(v) => { setVehicleToEdit(v.raw || v); setIsEditOpen(true); }}
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

            <AddVehiculoModal
                isOpen={isAddOpen}
                onClose={handleCloseAdd}
                onConfirm={() => { }}
                onSubmitVehiculo={handleSubmitVehiculo}
            />

            {isEditOpen && (
                <EditVehiculoModal
                    isOpen={isEditOpen}
                    onClose={handleCloseEdit}
                    vehiculo={vehicleToEdit}
                    onUpdateVehiculo={handleUpdateVehiculo}
                    onUpdateFoto={handleUpdateFoto}
                />
            )}

        </section>
    );
}

export default Vehiculos;