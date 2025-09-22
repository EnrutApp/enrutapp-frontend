import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import { useState } from 'react';
import UbicacionProfile from './pages/UbicacionesProfile';

const Ubicacion = () => {
    const [selectedUbicacion, setSelectedUbicacion] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ubicacionToDelete, setUbicacionToDelete] = useState(null);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [ubicacionToSwitch, setUbicacionToSwitch] = useState(null);
    const allUbicaciones = [
        {
            nombre: 'Terminal Medellín',
            codigo: 'UBI-001',
            estado: 'Activa',
            ciudad: 'Medellín',
            direccion: 'Cl. 50 #40-25'
        },
        {
            nombre: 'Terminal Quibdó',
            codigo: 'UBI-002',
            estado: 'Activa',
            ciudad: 'Quibdó',
            direccion: 'Cl. 80 #12-2'
        },
        {
            nombre: 'Terminal Medellín',
            codigo: 'UBI-001',
            estado: 'Activa',
            ciudad: 'Medellín',
            direccion: 'Cl. 50 #40-25'
        },
        {
            nombre: 'Terminal Quibdó',
            codigo: 'UBI-002',
            estado: 'Activa',
            ciudad: 'Quibdó',
            direccion: 'Cl. 80 #12-2'
        },
        {
            nombre: 'Terminal Medellín',
            codigo: 'UBI-001',
            estado: 'Activa',
            ciudad: 'Medellín',
            direccion: 'Cl. 50 #40-25'
        },
        {
            nombre: 'Terminal Quibdó',
            codigo: 'UBI-002',
            estado: 'Activa',
            ciudad: 'Quibdó',
            direccion: 'Cl. 80 #12-2'
        }
    ];

    const handleOpenProfile = (ubicacion) => {
        setSelectedUbicacion(ubicacion);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedUbicacion(null);
    };

    const handleDeleteClick = (ubicacion) => {
        setUbicacionToDelete(ubicacion);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        console.log('Eliminando ubicación:', ubicacionToDelete);
        setIsDeleteModalOpen(false);
        setUbicacionToDelete(null);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setUbicacionToDelete(null);
    };

    const handleSwitchClick = (ubicacion) => {
        setUbicacionToSwitch(ubicacion);
        setIsSwitchModalOpen(true);
    };

    const handleSwitchConfirm = () => {
        console.log('Cambiando estado de ubicación:', ubicacionToSwitch);
        setIsSwitchModalOpen(false);
        setUbicacionToSwitch(null);
    };

    const handleSwitchCancel = () => {
        setIsSwitchModalOpen(false);
        setUbicacionToSwitch(null);
    };

    const {
        currentPage,
        totalPages,
        currentData: currentUbicaciones,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(allUbicaciones, 4);

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className='list-enter'>
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Ubicaciones</h1>
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
                                        Agregar una ubicación
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
                                    <h2 className='h4 text-primary font-bold'>{allUbicaciones.filter(u => u.estado === 'Activa').length}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-primary font-bold'>{allUbicaciones.filter(u => u.estado === 'Inactiva').length}</h2>
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
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 4, totalItems)} de {totalItems} ubicaciones
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentUbicaciones.map((ubicacion, index) => (
                                <div
                                    key={index}
                                    className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3 ${ubicacion.estado !== 'Activa' ? 'opacity-60' : ''}`}
                                    onClick={() => handleOpenProfile(ubicacion)}
                                >
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <h1 className='h4'>{ubicacion.nombre}</h1>
                                            <div className='flex gap-1'>
                                                <button className={`btn btn-lg font-medium flex items-center ${ubicacion.estado === 'Activa' ? 'btn-primary' : 'btn-secondary'}`}>{ubicacion.estado}</button>
                                                <button className='btn btn-primary font-medium btn-lg flex items-center'>{ubicacion.direccion}</button>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <md-switch
                                                icons
                                                show-only-selected-icon
                                                selected={ubicacion.estado === 'Activa'}
                                                onClick={(e) => { e.stopPropagation(); handleSwitchClick(ubicacion); }}
                                            ></md-switch>
                                            <button
                                                className='btn btn-secondary btn-lg font-medium flex items-center'
                                                onClick={e => { e.stopPropagation(); handleDeleteClick(ubicacion); }}
                                            >
                                                <md-icon className="text-sm">delete</md-icon>
                                            </button>
                                            <button className='btn btn-primary btn-lg font-medium flex items-center' onClick={e => e.stopPropagation()}>
                                                <md-icon className="text-sm">edit</md-icon>
                                                Editar
                                            </button>
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
                <UbicacionProfile
                    ubicacion={selectedUbicacion}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="ubicación"
                itemName={ubicacionToDelete?.nombre}
            />

            <SwitchModal
                isOpen={isSwitchModalOpen}
                onClose={handleSwitchCancel}
                onConfirm={handleSwitchConfirm}
                itemType="ubicación"
                isCurrentlyActive={ubicacionToSwitch?.estado === 'Activa'}
            />

        </section>
    )
}

export default Ubicacion;