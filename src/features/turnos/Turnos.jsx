import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import TurnoDetail from './pages/TurnoDetail';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import AddTurnoModal from '../../shared/components/modal/addModal/AddTurnoModal';
import EditTurnoModal from '../../shared/components/modal/editModal/EditTurnoModal';
import { turnoService } from '../../shared/services/turnoService';
import { useEffect, useMemo, useState } from 'react';

const Turnos = () => {
    const [selectedTurno, setSelectedTurno] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [turnoToDelete, setTurnoToDelete] = useState(null);
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [turnoToEdit, setTurnoToEdit] = useState(null);

    // Estados para búsqueda y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('Todos');
    const [sortBy, setSortBy] = useState('Fecha');
    const [sortOrder, setSortOrder] = useState('Descendente');

    const cargarTurnos = async () => {
        try {
            setLoading(true);
            const res = await turnoService.getTurnos();
            const list = res?.data || res;
            setTurnos(Array.isArray(list) ? list : []);
        } catch (err) {
            setError(err.message || 'Error al cargar turnos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarTurnos();
    }, []);

    const mapToCard = (t) => ({
        idTurno: t.idTurno,
        fecha: t.fecha,
        hora: t.hora,
        conductor: t.conductor ? `${t.conductor.nombre} ${t.conductor.apellido}` : 'Sin conductor',
        vehiculo: t.vehiculo ? `${t.vehiculo.placa} - ${t.vehiculo.linea}` : 'Sin vehículo',
        estado: t.estado,
        raw: t,
    });

    const handleOpenDetail = (turno) => {
        setSelectedTurno(turno);
        setIsDetailOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedTurno(null);
    };

    const handleDeleteClick = (turno) => {
        setTurnoToDelete(turno);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await turnoService.deleteTurno(turnoToDelete?.raw?.idTurno || turnoToDelete?.idTurno);
            await cargarTurnos();
        } catch (err) {
            console.error('Error al eliminar', err);
        } finally {
            setIsDeleteModalOpen(false);
            setTurnoToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setTurnoToDelete(null);
    };

    const handleToggleEstado = async (turno, e) => {
        e.stopPropagation();
        try {
            const id = turno?.raw?.idTurno || turno?.idTurno;
            const nuevoEstado = turno.estado === 'Programado' ? 'Cancelado' : 'Programado';
            await turnoService.updateTurno(id, { estado: nuevoEstado });
            await cargarTurnos();
        } catch (err) {
            console.error('Error al cambiar estado', err);
        }
    };

    // Lógica de búsqueda y filtrado
    const filteredAndSortedCards = useMemo(() => {
        let result = turnos.map(mapToCard);

        // Filtrar por búsqueda
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(t =>
                t.conductor.toLowerCase().includes(term) ||
                t.vehiculo.toLowerCase().includes(term) ||
                t.hora.toLowerCase().includes(term)
            );
        }

        // Filtrar por estado
        if (filterEstado !== 'Todos') {
            result = result.filter(t => t.estado === filterEstado);
        }

        // Ordenar
        result.sort((a, b) => {
            let aVal, bVal;

            if (sortBy === 'Fecha') {
                aVal = new Date(a.fecha).getTime();
                bVal = new Date(b.fecha).getTime();
            } else if (sortBy === 'Nombre') {
                aVal = a.conductor.toLowerCase();
                bVal = b.conductor.toLowerCase();
            }

            if (sortOrder === 'Ascendente') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return result;
    }, [turnos, searchTerm, filterEstado, sortBy, sortOrder]);

    const {
        currentPage,
        totalPages,
        currentData: currentTurnos,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(filteredAndSortedCards, 4);

    const handleOpenAdd = () => setIsAddOpen(true);
    const handleCloseAdd = () => setIsAddOpen(false);
    const handleSubmitTurno = async (data) => {
        await turnoService.createTurno(data);
        await cargarTurnos();
    };

    const handleOpenEdit = (turno) => {
        setTurnoToEdit(turno.raw || turno);
        setIsEditOpen(true);
    };
    const handleCloseEdit = () => setIsEditOpen(false);
    const handleUpdateTurno = async (id, data) => {
        await turnoService.updateTurno(id, data);
        await cargarTurnos();
    };

    // Contadores
    const totalProgramados = filteredAndSortedCards.filter(t => t.estado === 'Programado').length;
    const totalCompletados = filteredAndSortedCards.filter(t => t.estado === 'Completado').length;
    const totalCancelados = filteredAndSortedCards.filter(t => t.estado === 'Cancelado').length;

    // Formatear fecha
    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-CO', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <section>
            {!isDetailOpen ? (
                <>
                    <div className='list-enter'>
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Turnos</h1>
                            <div className='flex gap-2'>
                                <div className='relative'>
                                    <button className="btn btn-secondary px-6 py-2">
                                        <md-icon className="text-sm text-secondary">search</md-icon>
                                        Buscar
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Buscar turno..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='absolute top-0 right-0 input bg-fill border rounded-lg text-primary pl-10 pr-4 py-2 w-64 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity z-10'
                                    />
                                </div>
                                <div>
                                    <button className="btn btn-primary px-5" onClick={handleOpenAdd}>
                                        <md-icon className="text-sm text-on-primary">add</md-icon>
                                        Asignar un turno
                                    </button>
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
                                    <span className='subtitle2 font-light'>Programados</span>
                                    <h2 className='h4 text-primary font-bold'>{totalProgramados}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Completados</span>
                                    <h2 className='h4 text-primary font-bold'>{totalCompletados}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Cancelados</span>
                                    <h2 className='h4 text-primary font-bold'>{totalCancelados}</h2>
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
                                    <option value="Programado">Estado: Programado</option>
                                    <option value="Completado">Estado: Completado</option>
                                    <option value="Cancelado">Estado: Cancelado</option>
                                </select>
                            </div>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className='select-filter'
                                >
                                    <option value="Fecha">Ordenar por: Fecha</option>
                                    <option value="Nombre">Ordenar por: Nombre</option>
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
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 4, totalItems)} de {totalItems} turnos
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentTurnos.length === 0 ? (
                                <div className='text-center py-12 text-secondary'>
                                    <md-icon className='text-6xl mb-2'>search_off</md-icon>
                                    <p>No se encontraron turnos</p>
                                </div>
                            ) : (
                                currentTurnos.map((turno, index) => (
                                    <div
                                        key={index}
                                        className='content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3'
                                        onClick={() => handleOpenDetail(turno)}
                                    >
                                        <div className='flex justify-between items-center'>
                                            <div className='flex-1'>
                                                <div className='flex items-center gap-2 mb-1'>
                                                    <h1 className='h5 font-medium'>{formatFecha(turno.fecha)}, {turno.hora}</h1>
                                                    <span className='text-secondary'>|</span>
                                                    <span className='subtitle1 text-secondary'>{turno.vehiculo}</span>
                                                </div>
                                                <h2 className='h4'>{turno.conductor}</h2>
                                                
                                                {/* Badge de Estado Simple */}
                                                <div className='flex gap-2 mt-2'>
                                                    {turno.estado === 'Programado' && (
                                                        <span className='px-3 py-1 bg-green/10 text-green rounded-full text-sm font-medium'>
                                                            Programado
                                                        </span>
                                                    )}
                                                    {turno.estado === 'Completado' && (
                                                        <span className='px-3 py-1 bg-blue/10 text-blue rounded-full text-sm font-medium'>
                                                            Completado
                                                        </span>
                                                    )}
                                                    {turno.estado === 'Cancelado' && (
                                                        <span className='px-3 py-1 bg-red/10 text-red rounded-full text-sm font-medium'>
                                                            Cancelado
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Botones de Acción - Estilo Consistente */}
                                            <div className='flex gap-2 items-center'>
                                                {/* Botón Toggle Estado */}
                                                {(turno.estado === 'Programado' || turno.estado === 'Cancelado') && (
                                                    <button
                                                        className='btn btn-secondary px-5'
                                                        onClick={(e) => handleToggleEstado(turno, e)}
                                                    >
                                                        {turno.estado === 'Programado' ? 'Cancelar' : 'Programar'}
                                                    </button>
                                                )}
                                                
                                                {/* Botón Eliminar */}
                                                <button
                                                    className='btn btn-secondary btn-lg font-medium flex items-center'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(turno);
                                                    }}
                                                >
                                                    <md-icon className="text-sm">delete</md-icon>
                                                </button>
                                                
                                                {/* Botón Editar */}
                                                <button
                                                    className='btn btn-primary btn-lg font-medium flex items-center px-5'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEdit(turno);
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
                <TurnoDetail
                    turno={selectedTurno}
                    isOpen={isDetailOpen}
                    onClose={handleCloseDetail}
                    onEdit={(t) => { setTurnoToEdit(t.raw || t); setIsEditOpen(true); }}
                    onDelete={(t) => { setTurnoToDelete(t); setIsDeleteModalOpen(true); }}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="turno"
                itemName={`${formatFecha(turnoToDelete?.fecha)} - ${turnoToDelete?.conductor}`}
            />

            <AddTurnoModal
                isOpen={isAddOpen}
                onClose={handleCloseAdd}
                onSubmitTurno={handleSubmitTurno}
            />

            {isEditOpen && (
                <EditTurnoModal
                    isOpen={isEditOpen}
                    onClose={handleCloseEdit}
                    turno={turnoToEdit}
                    onUpdateTurno={handleUpdateTurno}
                />
            )}
        </section>
    );
};

export default Turnos;
