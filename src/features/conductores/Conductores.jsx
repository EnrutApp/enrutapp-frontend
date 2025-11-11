import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import ConductorProfile from './pages/ConductoresProfile';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddConductorModal from '../../shared/components/modal/addModal/AddConductorModal';
import EditConductorModal from '../../shared/components/modal/editModal/EditConductorModal';
import { conductorService } from '../../shared/services/conductorService';
import { useEffect, useMemo, useState } from 'react';

const Conductores = () => {
    const [selectedConductor, setSelectedConductor] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [conductorToDelete, setConductorToDelete] = useState(null);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [conductorToSwitch, setConductorToSwitch] = useState(null);
    const [conductores, setConductores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [conductorToEdit, setConductorToEdit] = useState(null);

    // 🔥 Estados para búsqueda y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('Todos');
    const [sortBy, setSortBy] = useState('Nombre');
    const [sortOrder, setSortOrder] = useState('Ascendente');

    const cargarConductores = async () => {
        try {
            setLoading(true);
            const res = await conductorService.getConductores();
            const list = res?.data || res;
            setConductores(Array.isArray(list) ? list : []);
        } catch (err) {
            setError(err.message || 'Error al cargar conductores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarConductores();
    }, []);

    const mapToCard = (c) => ({
        idConductor: c.idConductor,
        nombre: `${c.nombre} ${c.apellido}`,
        cedula: c.cedula,
        telefono: c.telefono,
        correo: c.correo,
        licencia: c.licencia,
        estado: c.estado ? 'Activo' : 'Inactivo',
        fotoUrl: c.fotoUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${c.fotoUrl}` : '/default-avatar.png',
        raw: c,
    });

    const handleOpenProfile = (conductor) => {
        setSelectedConductor(conductor);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedConductor(null);
    };

    const handleDeleteClick = (conductor) => {
        setConductorToDelete(conductor);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await conductorService.deleteConductor(conductorToDelete?.raw?.idConductor || conductorToDelete?.idConductor);
            await cargarConductores();
        } catch (err) {
            console.error('Error al eliminar', err);
        } finally {
            setIsDeleteModalOpen(false);
            setConductorToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setConductorToDelete(null);
    };

    const handleSwitchClick = (conductor) => {
        setConductorToSwitch(conductor);
        setIsSwitchModalOpen(true);
    };

    const handleSwitchConfirm = async () => {
        try {
            const id = conductorToSwitch?.raw?.idConductor || conductorToSwitch?.idConductor;
            const nuevoEstado = !(conductorToSwitch?.raw?.estado ?? (conductorToSwitch?.estado === 'Activo'));
            await conductorService.updateConductor(id, { estado: nuevoEstado });
            await cargarConductores();
        } catch (err) {
            console.error('Error al cambiar estado', err);
        } finally {
            setIsSwitchModalOpen(false);
            setConductorToSwitch(null);
        }
    };

    const handleSwitchCancel = () => {
        setIsSwitchModalOpen(false);
        setConductorToSwitch(null);
    };

    // 🔥 Lógica de búsqueda y filtrado
    const filteredAndSortedCards = useMemo(() => {
        let result = conductores.map(mapToCard);

        // Filtrar por búsqueda
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c => 
                c.nombre.toLowerCase().includes(term) ||
                c.cedula.toLowerCase().includes(term) ||
                c.telefono.toLowerCase().includes(term) ||
                c.correo?.toLowerCase().includes(term) ||
                c.licencia.toLowerCase().includes(term)
            );
        }

        // Filtrar por estado
        if (filterEstado !== 'Todos') {
            result = result.filter(c => 
                filterEstado === 'Activos' ? c.estado === 'Activo' : c.estado === 'Inactivo'
            );
        }

        // Ordenar
        result.sort((a, b) => {
            let aVal, bVal;
            
            if (sortBy === 'Nombre') {
                aVal = a.nombre.toLowerCase();
                bVal = b.nombre.toLowerCase();
            } else if (sortBy === 'Apellido') {
                const aApellido = a.raw?.apellido?.toLowerCase() || '';
                const bApellido = b.raw?.apellido?.toLowerCase() || '';
                aVal = aApellido;
                bVal = bApellido;
            }

            if (sortOrder === 'Ascendente') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return result;
    }, [conductores, searchTerm, filterEstado, sortBy, sortOrder]);

    const {
        currentPage,
        totalPages,
        currentData: currentConductores,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(filteredAndSortedCards, 4);

    const handleOpenAdd = () => setIsAddOpen(true);
    const handleCloseAdd = () => setIsAddOpen(false);
    const handleSubmitConductor = async (form, file) => {
        await conductorService.createConductor(form, file);
        await cargarConductores();
    };

    const handleOpenEdit = (conductor) => {
        setConductorToEdit(conductor.raw || conductor);
        setIsEditOpen(true);
    };
    const handleCloseEdit = () => setIsEditOpen(false);
    const handleUpdateConductor = async (id, data) => {
        await conductorService.updateConductor(id, data);
        await cargarConductores();
    };
    const handleUpdateFoto = async (id, file) => {
        await conductorService.updateFoto(id, file);
        await cargarConductores();
    };

    // Contadores basados en datos filtrados
    const totalActivos = filteredAndSortedCards.filter(c => c.estado === 'Activo').length;
    const totalInactivos = filteredAndSortedCards.filter(c => c.estado === 'Inactivo').length;

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className='list-enter'>
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Conductores</h1>
                            <div className='flex gap-2'>
                                <div className='relative'>
                                    <md-filled-button className="btn-search-minimal px-6 py-2">
                                        <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                                        Buscar
                                    </md-filled-button>
                                    <input
                                        type="text"
                                        placeholder="Buscar conductor..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='absolute top-0 right-0 input bg-fill border rounded-lg text-primary pl-10 pr-4 py-2 w-64 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity z-10'
                                    />
                                </div>
                                <div>
                                    <md-filled-button className="btn-add px-5" onClick={handleOpenAdd}>
                                        <md-icon slot="icon" className="text-sm text-on-primary">person_add</md-icon>
                                        Agregar conductores
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
                                    <h2 className='h4 text-primary font-bold'>{totalActivos}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-primary font-bold'>{totalInactivos}</h2>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 mt-3'>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select 
                                    value={filterEstado} 
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                    className='select-filter'
                                >
                                    <option value="Todos">Estado: Todos</option>
                                    <option value="Activos">Estado: Activos</option>
                                    <option value="Inactivos">Estado: Inactivos</option>
                                </select>
                            </div>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className='select-filter'
                                >
                                    <option value="Nombre">Ordenar por: Nombre</option>
                                    <option value="Apellido">Ordenar por: Apellido</option>
                                </select>
                            </div>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select 
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className='select-filter'
                                >
                                    <option value="Ascendente">Orden: Ascendente</option>
                                    <option value="Descendente">Orden: Descendente</option>
                                </select>
                            </div>
                        </div>

                        <div className='flex justify-between items-center mt-6 mb-4'>
                            <span className='text-sm text-secondary'>
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 4, totalItems)} de {totalItems} conductores
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentConductores.length === 0 ? (
                                <div className='text-center py-12 text-secondary'>
                                    <md-icon className='text-6xl mb-2'>search_off</md-icon>
                                    <p>No se encontraron conductores</p>
                                </div>
                            ) : (
                                currentConductores.map((conductor, index) => (
                                    <div
                                        key={index}
                                        className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3 ${conductor.estado === 'Inactivo' ? 'opacity-60' : ''}`}
                                        onClick={() => handleOpenProfile(conductor)}
                                    >
                                        <div className='flex justify-between items-center'>
                                            <div>
                                                <h1 className='h4'>{conductor.nombre}</h1>
                                                <div className='flex gap-1'>
                                                    <button className={`btn btn-lg font-medium flex items-center ${conductor.estado === 'Activo' ? 'btn-primary' : 'btn-secondary'}`}>
                                                        {conductor.estado}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className='flex gap-2'>
                                                {/* 🔥 CAMBIO: Botón Habilitar/Deshabilitar en lugar de switch */}
                                                <button
                                                    className={`btn btn-lg font-medium flex items-center ${conductor.estado === 'Activo' ? 'btn-secondary' : 'btn-primary'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSwitchClick(conductor);
                                                    }}
                                                >
                                                    {conductor.estado === 'Activo' ? 'Deshabilitar' : 'Habilitar'}
                                                </button>
                                                <button
                                                    className='btn btn-secondary btn-lg font-medium flex items-center'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(conductor);
                                                    }}
                                                >
                                                    <md-icon className="text-sm">delete</md-icon>
                                                </button>
                                                <button 
                                                    className='btn btn-primary btn-lg font-medium flex items-center' 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEdit(conductor);
                                                    }}
                                                >
                                                    <md-icon className="text-sm">edit</md-icon>
                                                    Editar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
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
                <ConductorProfile
                    conductor={selectedConductor}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                    onEdit={(c) => { setConductorToEdit(c.raw || c); setIsEditOpen(true); }}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="conductor"
                itemName={conductorToDelete?.nombre}
            />

            <SwitchModal
                isOpen={isSwitchModalOpen}
                onClose={handleSwitchCancel}
                onConfirm={handleSwitchConfirm}
                itemType="conductor"
                itemName={conductorToSwitch?.nombre}
                isCurrentlyActive={conductorToSwitch?.estado === 'Activo'}
            />

            <AddConductorModal
                isOpen={isAddOpen}
                onClose={handleCloseAdd}
                onConfirm={() => { }}
                onSubmitConductor={handleSubmitConductor}
            />

            {isEditOpen && (
                <EditConductorModal
                    isOpen={isEditOpen}
                    onClose={handleCloseEdit}
                    conductor={conductorToEdit}
                    onUpdateConductor={handleUpdateConductor}
                    onUpdateFoto={handleUpdateFoto}
                />
            )}
        </section>
    );
}

export default Conductores;
