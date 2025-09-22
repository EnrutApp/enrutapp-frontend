import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import { useState } from 'react';
import EncomiendaProfile from './pages/EncomiendasProfile';

const Encomiendas = () => {
    const [selectedEncomienda, setSelectedEncomienda] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [encomiendaToDelete, setEncomiendaToDelete] = useState(null);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [encomiendaToSwitch, setEncomiendaToSwitch] = useState(null);
    const allEncomiendas = [
        {
            codigo: 'ENC-001',
            destinatario: 'Diomedes Diaz',
            estado: 'Entregada',
            origen: 'Medellín',
            destino: 'Quibdó',
            peso: '5kg'
        },
        {
            codigo: 'ENC-001',
            destinatario: 'Diomedes Diaz',
            estado: 'Entregada',
            origen: 'Medellín',
            destino: 'Quibdó',
            peso: '5kg'
        },
        {
            codigo: 'ENC-001',
            destinatario: 'Diomedes Diaz',
            estado: 'Entregada',
            origen: 'Medellín',
            destino: 'Quibdó',
            peso: '5kg'
        },
        {
            codigo: 'ENC-001',
            destinatario: 'Diomedes Diaz',
            estado: 'Entregada',
            origen: 'Medellín',
            destino: 'Quibdó',
            peso: '5kg'
        },
        {
            codigo: 'ENC-001',
            destinatario: 'Diomedes Diaz',
            estado: 'Entregada',
            origen: 'Medellín',
            destino: 'Quibdó',
            peso: '5kg'
        }
    ];

    const handleOpenProfile = (encomienda) => {
        setSelectedEncomienda(encomienda);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedEncomienda(null);
    };

    const handleDeleteClick = (encomienda) => {
        setEncomiendaToDelete(encomienda);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        console.log('Eliminando encomienda:', encomiendaToDelete);
        setIsDeleteModalOpen(false);
        setEncomiendaToDelete(null);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setEncomiendaToDelete(null);
    };

    const handleSwitchClick = (encomienda) => {
        setEncomiendaToSwitch(encomienda);
        setIsSwitchModalOpen(true);
    };

    const handleSwitchConfirm = () => {
        console.log('Cambiando estado de la encomienda:', encomiendaToSwitch);
        setIsSwitchModalOpen(false);
        setEncomiendaToSwitch(null);
    };

    const handleSwitchCancel = () => {
        setIsSwitchModalOpen(false);
        setEncomiendaToSwitch(null);
    };

    const {
        currentPage,
        totalPages,
        currentData: currentEncomiendas,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(allEncomiendas, 4);

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className='list-enter'>
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Encomiendas</h1>
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
                                        Asignar encomienda
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
                                    <span className='subtitle2 font-light'>Entregado</span>
                                    <h2 className='h4 text-primary font-bold'>{allEncomiendas.filter(e => e.estado === 'Entregada').length}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>En transito</span>
                                    <h2 className='h4 text-primary font-bold'>{allEncomiendas.filter(e => e.estado === 'En transito').length}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Por enviar</span>
                                    <h2 className='h4 text-primary font-bold'>{allEncomiendas.filter(e => e.estado === 'Por enviar').length}</h2>
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
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 4, totalItems)} de {totalItems} encomiendas
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentEncomiendas.map((encomienda, index) => (
                                <div
                                    key={index}
                                    className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3 ${encomienda.estado !== 'Entregada' ? 'opacity-60' : ''}`}
                                    onClick={() => handleOpenProfile(encomienda)}
                                >
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <div className='flex flex-col'>
                                                <span className='body2'>20 de Mayo, 4:00AM | Alaskan</span>
                                                <h1 className='h4'>{encomienda.destinatario}</h1>
                                            </div>
                                            <div className='flex flex-col gap-2'>
                                                <div className='flex gap-1'>
                                                    <button className='btn btn-primary font-medium btn-sm-2 flex items-center'>
                                                        <md-icon slot="edit" className="text-sm">swap_horiz</md-icon>
                                                    </button>
                                                    <button className='btn btn-secondary font-medium btn-lg flex items-center'>
                                                        {encomienda.origen}
                                                    </button>
                                                    <button className='btn btn-secondary font-medium btn-lg flex items-center'>
                                                        {encomienda.destino}
                                                    </button>
                                                    <button className='btn btn-secondary font-medium btn-lg flex items-center'>
                                                        <md-icon slot="edit" className="text-lg">distance</md-icon>
                                                        {encomienda.peso}
                                                    </button>
                                                </div>
                                                <div className='flex gap-1'>
                                                    <button className='btn btn-primary font-medium btn-lg flex items-center'>
                                                        Verificados
                                                    </button>
                                                    <button className='btn btn-primary font-medium btn-lg flex items-center'>
                                                        Turno 1
                                                    </button>
                                                    <button className='btn btn-green font-medium btn-lg flex items-center'>
                                                        <md-icon slot="edit" className="text-sm">check</md-icon>
                                                        {encomienda.estado}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <md-switch
                                                icons
                                                show-only-selected-icon
                                                selected={encomienda.estado === 'Entregada'}
                                                onClick={(e) => { e.stopPropagation(); handleSwitchClick(encomienda); }}
                                            ></md-switch>
                                            <button
                                                className='btn btn-secondary btn-lg font-medium flex items-center'
                                                onClick={e => { e.stopPropagation(); handleDeleteClick(encomienda); }}
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
                <EncomiendaProfile
                    encomienda={selectedEncomienda}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="encomienda"
                itemName={encomiendaToDelete?.codigo}
            />

            <SwitchModal
                isOpen={isSwitchModalOpen}
                onClose={handleSwitchCancel}
                onConfirm={handleSwitchConfirm}
                itemType="encomienda"
                isCurrentlyActive={encomiendaToSwitch?.estado === 'Entregada'}
            />

        </section>
    )
}

export default Encomiendas;