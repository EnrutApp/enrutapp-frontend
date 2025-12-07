import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import AddReservaModal from '../../shared/components/modal/addReservaModal/AddReservaModal';
import EditReservaModal from '../../shared/components/modal/editReservaModal/EditReservaModal';
import ReservasProfile from './pages/ReservasProfile';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import reservaService from '../../shared/services/reservaService';
import { useState, useEffect } from 'react';

const Reservas = () => {
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reservaToDelete, setReservaToDelete] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [reservaToEdit, setReservaToEdit] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEstado, setFilterEstado] = useState('Todos');
    const [sortBy, setSortBy] = useState('Fecha');
    const [sortOrder, setSortOrder] = useState('Descendente');
    const [allReservas, setAllReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar reservas del backend
    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await reservaService.getAllReservas();
            
            // Validar que la respuesta sea exitosa
            if (response.success && Array.isArray(response.data)) {
                setAllReservas(response.data);
            } else {
                console.warn('No hay reservas disponibles');
                setAllReservas([]);
            }
        } catch (err) {
            console.error('Error al cargar reservas:', err);
            setError('Error al cargar las reservas del servidor');
            setAllReservas([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar y ordenar reservas
    const filteredReservas = allReservas
        .filter(reserva => {
            const matchesSearch = 
                (reserva.nombreCliente && reserva.nombreCliente.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (reserva.pasajeros && Array.isArray(reserva.pasajeros) &&
                 reserva.pasajeros.some(p => typeof p === 'string' && p.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                (reserva.origen && reserva.origen.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (reserva.destino && reserva.destino.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesFilter = filterEstado === 'Todos' || reserva.estado === filterEstado;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'Fecha') {
                comparison = new Date(a.fecha) - new Date(b.fecha);
            } else if (sortBy === 'Origen') {
                comparison = (a.origen || '').localeCompare(b.origen || '');
            } else if (sortBy === 'Nombre') {
                comparison = (a.nombreCliente || '').localeCompare(b.nombreCliente || '');
            }
            return sortOrder === 'Ascendente' ? comparison : -comparison;
        });

    // Calcular estadísticas
    const stats = {
        total: allReservas.length,
        pendientes: allReservas.filter(r => r.estado === 'Pendiente').length,
        completadas: allReservas.filter(r => r.estado === 'Completada').length,
        canceladas: allReservas.filter(r => r.estado === 'Cancelada').length
    };

    const handleOpenProfile = (reserva) => {
        setSelectedReserva(reserva);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedReserva(null);
    };

    const handleDeleteClick = (reserva) => {
        setReservaToDelete(reserva);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            if (reservaToDelete.id) {
                const response = await reservaService.deleteReserva(reservaToDelete.id);
                if (response.success) {
                    setAllReservas(prev => prev.filter(r => r.id !== reservaToDelete.id));
                    setError(null);
                } else {
                    setError(response.message || 'Error al eliminar la reserva');
                }
            }
            setIsDeleteModalOpen(false);
            setReservaToDelete(null);
        } catch (err) {
            console.error('Error al eliminar reserva:', err);
            setError('Error al eliminar la reserva');
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setReservaToDelete(null);
    };

    const handleAddReserva = async (newReserva) => {
        try {
            setError(null);
            const response = await reservaService.createReserva(newReserva);
            if (response.success && response.data) {
                const reservaCreada = {
                    ...newReserva,
                    id: response.data?.id || Date.now(),
                    ...response.data
                };
                setAllReservas(prev => [...prev, reservaCreada]);
                setIsAddModalOpen(false);
            } else {
                setError(response.message || 'Error al crear la reserva');
            }
        } catch (err) {
            console.error('Error al crear reserva:', err);
            setError('Error al crear la reserva');
        }
    };

    const handleEditClick = (reserva) => {
        setReservaToEdit(reserva);
        setIsEditModalOpen(true);
    };

    const handleEditConfirm = async (updatedData) => {
        try {
            setError(null);
            if (reservaToEdit.id) {
                const response = await reservaService.updateReserva(reservaToEdit.id, updatedData);
                if (response.success) {
                    setAllReservas(prev => prev.map(r => 
                        r.id === reservaToEdit.id 
                            ? { ...r, ...updatedData }
                            : r
                    ));
                } else {
                    setError(response.message || 'Error al actualizar la reserva');
                }
            }
            setIsEditModalOpen(false);
            setReservaToEdit(null);
        } catch (err) {
            console.error('Error al actualizar reserva:', err);
            setError('Error al actualizar la reserva');
        }
    };

    const {
        currentPage,
        totalPages,
        currentData: currentReservas,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(filteredReservas, 5);

    if (loading) {
        return (
            <section className='flex items-center justify-center h-96'>
                <div className='text-center'>
                    <md-icon className="text-4xl text-primary animate-spin">settings</md-icon>
                    <p className='text-secondary mt-2'>Cargando reservas...</p>
                </div>
            </section>
        );
    }

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className='list-enter'>
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Reservas</h1>
                            <div className='flex gap-2'>
                                <div>
                                    <md-filled-button 
                                        className="btn-search-minimal px-6 py-2"
                                        onClick={() => {
                                            const query = prompt('Buscar reserva:');
                                            if (query !== null) setSearchQuery(query);
                                        }}
                                    >
                                        <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                                        Buscar
                                    </md-filled-button>
                                </div>
                                <div>
                                    <md-filled-button 
                                        className="btn-add px-5"
                                        onClick={() => setIsAddModalOpen(true)}
                                    >
                                        <md-icon slot="icon" className="text-sm text-on-primary">add</md-icon>
                                        Hacer reserva
                                    </md-filled-button>
                                </div>
                            </div>
                        </div>

                        <div className='flex mt-4 gap-2'>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Totales</span>
                                    <h2 className='h4 text-primary font-bold'>{stats.total}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Pendientes</span>
                                    <h2 className='h4 text-primary font-bold'>{stats.pendientes}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Completadas</span>
                                    <h2 className='h4 text-primary font-bold'>{stats.completadas}</h2>
                                </div>
                            </div>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Canceladas</span>
                                    <h2 className='h4 text-primary font-bold'>{stats.canceladas}</h2>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 mt-3'>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select 
                                    name="Estado" 
                                    className='select-filter'
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                >
                                    <option value="Todos">Estado: Todos</option>
                                    <option value="Pendiente">Estado: Pendiente</option>
                                    <option value="Completada">Estado: Completada</option>
                                    <option value="Cancelada">Estado: Cancelada</option>
                                </select>
                            </div>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select 
                                    name="Ordenar" 
                                    className='select-filter'
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="Fecha">Ordenar por: Fecha</option>
                                    <option value="Origen">Ordenar por: Origen</option>
                                    <option value="Nombre">Ordenar por: Nombre</option>
                                </select>
                            </div>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select 
                                    name="Orden" 
                                    className='select-filter'
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="Ascendente">Orden: Ascendente</option>
                                    <option value="Descendente">Orden: Descendente</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className='mt-4 p-4 rounded-lg flex items-center gap-3 bg-red-100 border border-red-400 text-red-800'>
                                <md-icon className="text-xl">error</md-icon>
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>{error}</p>
                                    <p className='text-xs mt-1 opacity-75'>Por favor, verifica la conexión con el servidor</p>
                                </div>
                                <button
                                    onClick={() => cargarReservas()}
                                    className='px-3 py-2 bg-red-600 text-white text-xs font-medium rounded hover:opacity-90'
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        <div className='flex justify-between items-center mt-6 mb-4'>
                            <span className='text-sm text-secondary'>
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 5, totalItems)} de {totalItems} reservas
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentReservas.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {currentReservas.map((reserva, index) => (
                                        <div
                                            key={reserva.id || index}
                                            className='bg-fill border border-outline rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer'
                                            onClick={() => handleOpenProfile(reserva)}
                                        >
                                            {/* Encabezado de la card */}
                                            <div className='flex items-start justify-between mb-3'>
                                                <div className='flex-1'>
                                                    <p className='text-xs text-secondary mb-1'>{reserva.fecha} • {reserva.hora}</p>
                                                    <h3 className='text-sm font-semibold text-primary'>{reserva.nombreCliente}</h3>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ml-2 ${
                                                    reserva.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 
                                                    reserva.estado === 'Activo' ? 'bg-green-100 text-green-700' : 
                                                    reserva.estado === 'Completada' ? 'bg-blue-100 text-blue-700' : 
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    <md-icon className="text-xs">circle</md-icon>
                                                    {reserva.estado}
                                                </span>
                                            </div>

                                            {/* Ruta */}
                                            <div className='mb-3 p-2 bg-fill border border-outline rounded'>
                                                <div className='flex items-center gap-2'>
                                                    <md-icon className="text-sm text-primary">place</md-icon>
                                                    <div className='flex-1'>
                                                        <p className='text-xs text-secondary'>Origen</p>
                                                        <p className='text-sm font-medium text-primary'>{reserva.origen}</p>
                                                    </div>
                                                </div>
                                                <div className='flex justify-center my-2'>
                                                    <md-icon className="text-sm text-outline">arrow_downward</md-icon>
                                                </div>
                                                <div className='flex items-center gap-2'>
                                                    <md-icon className="text-sm text-primary">location_on</md-icon>
                                                    <div className='flex-1'>
                                                        <p className='text-xs text-secondary'>Destino</p>
                                                        <p className='text-sm font-medium text-primary'>{reserva.destino}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Pasajeros */}
                                            <div className='mb-3'>
                                                <p className='text-xs text-secondary font-medium mb-2'>Pasajeros ({reserva.pasajeros?.length || 0})</p>
                                                <div className='space-y-1'>
                                                    {reserva.pasajeros?.slice(0, 2).map((p, i) => (
                                                        <p key={i} className='text-xs text-primary'>
                                                            • {p.nombre}
                                                        </p>
                                                    ))}
                                                    {reserva.pasajeros?.length > 2 && (
                                                        <p className='text-xs text-secondary italic'>+{reserva.pasajeros.length - 2} más</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Conductor y Precio */}
                                            <div className='border-t border-outline pt-3 mb-3'>
                                                {reserva.nombreConductor ? (
                                                    <div className='mb-2'>
                                                        <p className='text-xs text-secondary'>Conductor</p>
                                                        <div className='flex items-center gap-2'>
                                                            <md-icon className="text-sm text-primary">person</md-icon>
                                                            <span className='text-sm font-medium text-primary'>{reserva.nombreConductor}</span>
                                                            <span className='text-xs text-secondary bg-outline px-2 py-1 rounded'>{reserva.placaVehiculo}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className='text-xs text-secondary italic mb-2'>Sin conductor asignado</p>
                                                )}
                                                <div>
                                                    <p className='text-xs text-secondary'>Precio</p>
                                                    <p className='text-lg font-bold text-primary'>${reserva.precio?.toLocaleString() || '0'}</p>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className='flex gap-2 pt-3 border-t border-outline'>
                                                <button
                                                    className='flex-1 px-3 py-2 bg-primary text-white text-xs font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-1'
                                                    onClick={(e) => { e.stopPropagation(); handleEditClick(reserva); }}
                                                >
                                                    <md-icon className="text-sm">edit</md-icon>
                                                    Editar
                                                </button>
                                                <button
                                                    className='px-3 py-2 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors flex items-center justify-center'
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(reserva); }}
                                                >
                                                    <md-icon className="text-sm">delete</md-icon>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-center py-12'>
                                    <md-icon className="text-6xl text-outline mb-4 opacity-50">calendar_today</md-icon>
                                    <p className='text-secondary font-medium'>No hay reservas disponibles</p>
                                    <p className='text-xs text-outline mt-1'>Las reservas que crees aparecerán aquí</p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className='mt-4 px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:opacity-90'
                                    >
                                        Crear primera reserva
                                    </button>
                                </div>
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
                <ReservasProfile
                    reserva={selectedReserva}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="reserva"
                itemName={reservaToDelete?.origen && reservaToDelete?.destino 
                    ? `${reservaToDelete.origen} - ${reservaToDelete.destino}` 
                    : 'la reserva'}
            />

            <AddReservaModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onConfirm={handleAddReserva}
            />

            <EditReservaModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onConfirm={handleEditConfirm}
                reserva={reservaToEdit}
            />
        </section>
    );
};

export default Reservas;