import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../../shared/components/modal/switchModal/SwitchModal';
import Pagination from '../../../shared/components/pagination/Pagination';
import usePagination from '../../../shared/hooks/usePagination';
import { useState } from 'react';
import RutasProfile from '../pages/RutasProfile';

const RutasAdmin = () => {
    const [selectedRuta, setSelectedRuta] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rutaToDelete, setRutaToDelete] = useState(null);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [rutaToSwitch, setRutaToSwitch] = useState(null);
    const allRutas = [
        {
            nombre: 'MED - UIB',
            codigo: 'RUTA-001',
            estado: 'Activa',
            origen: 'Medellín',
            destino: 'Quibdó',
            distancia: '350 km',
            precio: '$1.300.000'
        },
        {
            nombre: 'MED - UIB',
            codigo: 'RUTA-001',
            estado: 'Activa',
            origen: 'Medellín',
            destino: 'Quibdó',
            distancia: '350 km',
            precio: '$1.300.000'
        },
        {
            nombre: 'MED - UIB',
            codigo: 'RUTA-001',
            estado: 'Activa',
            origen: 'Medellín',
            destino: 'Quibdó',
            distancia: '350 km',
            precio: '$1.300.000'
        },
        {
            nombre: 'MED - UIB',
            codigo: 'RUTA-001',
            estado: 'Activa',
            origen: 'Medellín',
            destino: 'Quibdó',
            distancia: '350 km',
            precio: '$1.300.000'
        },
        {
            nombre: 'MED - UIB',
            codigo: 'RUTA-001',
            estado: 'Inactiva',
            origen: 'Medellín',
            destino: 'Quibdó',
            distancia: '350 km',
            precio: '$1.300.000'
        }
    ];

    const handleOpenProfile = (ruta) => {
        setSelectedRuta(ruta);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedRuta(null);
    };

    const handleDeleteClick = (ruta) => {
        setRutaToDelete(ruta);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        console.log('Eliminando ruta:', rutaToDelete);
        setIsDeleteModalOpen(false);
        setRutaToDelete(null);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setRutaToDelete(null);
    };

    const handleSwitchClick = (ruta) => {
        setRutaToSwitch(ruta);
        setIsSwitchModalOpen(true);
    };

    const handleSwitchConfirm = () => {
        console.log('Cambiando estado de ruta:', rutaToSwitch);
        setIsSwitchModalOpen(false);
        setRutaToSwitch(null);
    };

    const handleSwitchCancel = () => {
        setIsSwitchModalOpen(false);
        setRutaToSwitch(null);
    };

    const {
        currentPage,
        totalPages,
        currentData: currentRutas,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(allRutas, 4);

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className='list-enter'>
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Rutas</h1>
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
                                        Agregar rutas
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
                                    <h2 className='h4 text-primary font-bold'>{allRutas.filter(r => r.estado === 'Activa').length}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-primary font-bold'>{allRutas.filter(r => r.estado === 'Inactiva').length}</h2>
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
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 4, totalItems)} de {totalItems} rutas
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentRutas.map((ruta, index) => (
                                <div
                                    key={index}
                                    className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3 ${ruta.estado !== 'Activa' ? 'opacity-60' : ''}`}
                                    onClick={() => handleOpenProfile(ruta)}
                                >
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <div className='flex items-center'>
                                                <h1 className='h4'>{ruta.origen}</h1>
                                                <md-icon className="text-xl text-secondary">arrow_right</md-icon>
                                                <h1 className='h4'>{ruta.destino}</h1>
                                            </div>
                                            <div className='flex gap-1'>
                                                <button className='btn btn-primary font-medium btn-lg flex items-center'>{ruta.estado}</button>
                                                <button className='btn btn-green font-medium btn-lg flex items-center'>{ruta.precio}</button>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <md-switch
                                                icons
                                                show-only-selected-icon
                                                selected={ruta.estado === 'Activa'}
                                                onClick={(e) => { e.stopPropagation(); handleSwitchClick(ruta); }}
                                            ></md-switch>
                                            <button
                                                className='btn btn-secondary btn-lg font-medium flex items-center'
                                                onClick={e => { e.stopPropagation(); handleDeleteClick(ruta); }}
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
                <RutasProfile
                    ruta={selectedRuta}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="ruta"
                itemName={rutaToDelete?.nombre}
            />

            <SwitchModal
                isOpen={isSwitchModalOpen}
                onClose={handleSwitchCancel}
                onConfirm={handleSwitchConfirm}
                itemType="ruta"
                isCurrentlyActive={rutaToSwitch?.estado === 'Activa'}
            />

        </section>
    )
}

export default RutasAdmin;

