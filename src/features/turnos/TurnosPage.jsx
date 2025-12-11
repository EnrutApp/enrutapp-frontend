import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddTurnoModal from './components/addTurnoModal/AddTurnoModal';
import EditTurnoModal from './components/editTurnoModal/EditTurnoModal';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import TurnosProfile from './pages/TurnosProfile';
import { useState, useEffect } from 'react';
import Avvvatars from 'avvvatars-react';
import resolveAssetUrl from '../../shared/utils/url';
import { turnoService } from './api/turnoService';

const styles = `
  @keyframes checkboxAppear {
    0% {
      opacity: 0;
      transform: scale(0.5) rotate(-90deg);
    }
    50% {
      transform: scale(1.1) rotate(5deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }
  
  @keyframes checkboxDisappear {
    0% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    100% {
      opacity: 0;
      transform: scale(0.5) rotate(90deg);
    }
  }
`;

const TurnosPage = () => {
  const [allTurnos, setAllTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [turnoToDelete, setTurnoToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [turnoToSwitch, setTurnoToSwitch] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [turnoToEdit, setTurnoToEdit] = useState(null);

  const [selectedTurnos, setSelectedTurnos] = useState([]);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const loadTurnos = async () => {
    setLoading(true);
    try {
      const response = await turnoService.getTurnos();

      const data = Array.isArray(response) ? response : response.data || [];

      const mappedTurnos = data.map(turno => ({
        id: turno.idTurno,
        idTurno: turno.idTurno,
        fecha: new Date(turno.fecha).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
        }),
        fechaRaw: turno.fecha,
        hora: turno.hora,
        vehiculo: turno.vehiculo
          ? `${turno.vehiculo.placa} - ${turno.vehiculo.linea}`
          : 'Sin vehículo',
        idVehiculo: turno.idVehiculo,
        conductor: turno.conductor?.usuario
          ? `${turno.conductor.usuario.nombre} ${turno.conductor.usuario.apellido || ''}`
          : 'Sin conductor',
        idConductor: turno.idConductor,
        status: turno.estado === 'Programado' ? 'Activo' : 'Inactivo',
        estado: turno.estado,
        usuarioConductor: turno.conductor?.usuario,
      }));

      setAllTurnos(mappedTurnos);
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurnos();
  }, []);

  const handleOpenProfile = turno => {
    setSelectedTurno(turno);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedTurno(null);
  };

  const handleDeleteClick = turno => {
    setTurnoToDelete(turno);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!turnoToDelete) return;
    try {
      await turnoService.deleteTurno(turnoToDelete.idTurno);
      await loadTurnos();
      setIsDeleteModalOpen(false);
      setTurnoToDelete(null);
    } catch (error) {
      console.error('Error al eliminar turno:', error);
      alert('Error al eliminar el turno');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTurnoToDelete(null);
  };

  const handleSwitchClick = turno => {
    setTurnoToSwitch(turno);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    if (!turnoToSwitch) return;
    try {
      const newStatus =
        turnoToSwitch.estado === 'Programado' ? 'Cancelado' : 'Programado';
      await turnoService.updateTurno(turnoToSwitch.idTurno, {
        estado: newStatus,
      });
      await loadTurnos();
      setIsSwitchModalOpen(false);
      setTurnoToSwitch(null);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del turno');
    }
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setTurnoToSwitch(null);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddTurno = async data => {
    try {
      await turnoService.createTurno(data);
      await loadTurnos();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error al crear turno:', error);
      throw error;
    }
  };

  const handleEditClick = (e, turno) => {
    e.stopPropagation();
    setTurnoToEdit(turno);
    setIsEditModalOpen(true);
  };

  const handleUpdateTurno = async (id, data) => {
    try {
      await turnoService.updateTurno(id, data);
      await loadTurnos();
      setIsEditModalOpen(false);
      setTurnoToEdit(null);
    } catch (error) {
      console.error('Error al actualizar turno:', error);
      throw error;
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedTurnos([]);
  };

  const handleSelectAll = () => {
    const currentPageIds = currentTurnos.map(t => t.id);
    const allCurrentSelected = currentPageIds.every(id =>
      selectedTurnos.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedTurnos(prev =>
        prev.filter(id => !currentPageIds.includes(id))
      );
    } else {
      setSelectedTurnos(prev => {
        const newSelection = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSelectTurno = turnoId => {
    setSelectedTurnos(prev => {
      if (prev.includes(turnoId)) {
        return prev.filter(id => id !== turnoId);
      } else {
        return [...prev, turnoId];
      }
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedTurnos.length === 0) return;
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    setIsDeleteMultipleModalOpen(false);
    console.log('Eliminar turnos:', selectedTurnos);
    setSelectedTurnos([]);
    setIsSelectionMode(false);
  };

  const handleCancelSelection = () => {
    setSelectedTurnos([]);
    setIsSelectionMode(false);
  };

  const filteredTurnos = allTurnos.filter(turno => {
    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activos' && turno.status === 'Activo') ||
      (statusFilter === 'Inactivos' && turno.status === 'Inactivo');

    const matchesSearch =
      searchQuery === '' ||
      turno.conductor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turno.vehiculo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turno.fecha?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      turno.hora?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const sortedTurnos = filteredTurnos.sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const {
    currentPage,
    totalPages,
    currentData: currentTurnos,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(sortedTurnos, viewMode === 'grid' ? 8 : 4);

  return (
    <section>
      <style>{styles}</style>
      {!isProfileOpen ? (
        <>
          <div className="list-enter">
            <div className="flex justify-between items-center">
              <h1 className="h4 font-medium">Turnos</h1>
              <div className="flex gap-2">
                <div className="relative">
                  <md-filled-button
                    className="btn-search-minimal px-6 py-2"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <md-icon slot="icon" className="text-sm text-secondary">
                      search
                    </md-icon>
                    Buscar
                  </md-filled-button>

                  {isSearchOpen && (
                    <div
                      className="absolute top-full right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl p-4 z-50"
                      style={{ minWidth: '300px' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-medium text-primary">
                          Buscar turno
                        </span>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Conductor, vehículo, fecha u hora..."
                        className="w-full px-3 py-2 bg-fill border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchOpen(false);
                          }}
                          className="mt-4 text-xs text-secondary hover:underline"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <md-filled-button
                    className="btn-add px-5"
                    onClick={handleAddClick}
                  >
                    <md-icon slot="icon" className="text-sm text-on-primary">
                      add
                    </md-icon>
                    Asignar un turnos
                  </md-filled-button>
                </div>
              </div>
            </div>

            <div className="flex mt-4 gap-2">
              <div className="content-box-outline-3-small">
                <div className="flex flex-col">
                  <span className="subtitle2 font-light">Totales</span>
                  <h2 className="h4 text-primary font-bold">
                    {allTurnos.length}
                  </h2>
                </div>
              </div>
              <div className="content-box-outline-3-small">
                <div className="flex flex-col">
                  <span className="subtitle2 font-light">Programados</span>
                  <h2 className="h4 text-primary font-bold">
                    {allTurnos.filter(t => t.status === 'Activo').length}
                  </h2>
                </div>
              </div>
              <div className="content-box-outline-3-small">
                <div className="flex flex-col">
                  <span className="subtitle2 font-light">Completados</span>
                  <h2 className="h4 text-primary font-bold">0</h2>
                </div>
              </div>
              <div className="content-box-outline-3-small">
                <div className="flex flex-col">
                  <span className="subtitle2 font-light">Cancelados</span>
                  <h2 className="h4 text-primary font-bold">
                    {allTurnos.filter(t => t.status === 'Inactivo').length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2 mt-3">
              <div className="flex gap-2">
                <div className="select-wrapper">
                  <md-icon className="text-sm">arrow_drop_down</md-icon>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="select-filter"
                  >
                    <option value="Todos">Estado: Todos</option>
                    <option value="Activos">Estado: Activos</option>
                    <option value="Inactivos">Estado: Inactivos</option>
                  </select>
                </div>
                <div className="select-wrapper">
                  <md-icon className="text-sm">arrow_drop_down</md-icon>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="select-filter"
                  >
                    <option value="fecha">Ordenar por: Fecha</option>
                    <option value="conductor">Ordenar por: Conductor</option>
                    <option value="vehiculo">Ordenar por: Vehículo</option>
                  </select>
                </div>
                <div className="select-wrapper">
                  <md-icon className="text-sm">arrow_drop_down</md-icon>
                  <select
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    className="select-filter"
                  >
                    <option value="asc">Orden: Ascendente</option>
                    <option value="desc">Orden: Descendente</option>
                  </select>
                </div>
              </div>

              {currentTurnos.length > 0 && !isSelectionMode && (
                <button
                  onClick={handleToggleSelectionMode}
                  className="select-wrapper select-filter px-5 cursor-pointer flex items-center gap-2"
                >
                  <span className="text-subtitle1 text-secondary">
                    Seleccionar
                  </span>
                </button>
              )}

              {isSelectionMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="select-wrapper select-filter cursor-pointer flex items-center gap-2"
                  >
                    <md-checkbox
                      checked={
                        currentTurnos.length > 0 &&
                        currentTurnos.every(t => selectedTurnos.includes(t.id))
                      }
                      touch-target="wrapper"
                    />
                    <span className="text-subtitle1 text-secondary">
                      Seleccionar todo
                    </span>
                  </button>
                  <button
                    onClick={handleDeleteMultiple}
                    className="select-btn-with-icon"
                    disabled={selectedTurnos.length === 0}
                  >
                    <md-icon>delete</md-icon>
                    <span>Eliminar seleccionados</span>
                  </button>
                  <button
                    onClick={handleCancelSelection}
                    className="select-wrapper select-filter cursor-pointer flex items-center"
                  >
                    <span className="text-subtitle1 text-secondary">
                      Cancelar
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-4 mb-4">
              <div className="flex gap-3">
                <div className="flex gap-1 bg-fill border border-border rounded-full p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2 py-1 rounded-full transition-all ${
                      viewMode === 'list'
                        ? 'bg-primary text-on-primary'
                        : 'text-secondary hover:text-primary'
                    }`}
                    title="Vista de lista"
                  >
                    <md-icon className="text-sm">view_list</md-icon>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2 py-1 rounded-full transition-all ${
                      viewMode === 'grid'
                        ? 'bg-primary text-on-primary'
                        : 'text-secondary hover:text-primary'
                    }`}
                    title="Vista de tarjetas"
                  >
                    <md-icon className="text-sm">grid_view</md-icon>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {selectedTurnos.length > 0 ? (
                    <span className="text-sm text-secondary">
                      {selectedTurnos.length} Seleccionados
                    </span>
                  ) : (
                    !loading && (
                      <span className="text-sm text-secondary">
                        {`Mostrando ${
                          totalItems > 0 ? startIndex + 1 : 0
                        }-${Math.min(
                          startIndex + (viewMode === 'grid' ? 8 : 4),
                          totalItems
                        )} de ${totalItems} turnos`}
                      </span>
                    )
                  )}
                </div>
              </div>
              {showPagination && (
                <span className="text-xs text-secondary">
                  Página {currentPage} de {totalPages}
                </span>
              )}
            </div>

            <div className="mt-3">
              {currentTurnos.length === 0 ? (
                <div className="empty-state">
                  <md-icon className="text-secondary mb-4">schedule</md-icon>
                  <p className="text-secondary">
                    {searchQuery || statusFilter !== 'Todos'
                      ? 'No se encontraron turnos que coincidan con los filtros'
                      : 'No hay turnos registrados'}
                  </p>
                  <p className="empty-state-subtext">
                    {searchQuery || statusFilter !== 'Todos'
                      ? 'Intenta ajustar tus filtros de búsqueda'
                      : 'Comienza agregando un nuevo turno'}
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'flex flex-col gap-3'
                  }
                >
                  {currentTurnos.map((turno, index) => (
                    <div
                      key={index}
                      className={`content-box-outline-4-small cursor-pointer relative ${
                        turno.status !== 'Activo' ? 'opacity-60' : ''
                      } ${
                        selectedTurnos.includes(turno.id) ? 'card-selected' : ''
                      }`}
                      onClick={() => handleOpenProfile(turno)}
                    >
                      {isSelectionMode && (
                        <div
                          className="absolute top-3 left-3 z-10"
                          style={{
                            animation:
                              'checkboxAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transformOrigin: 'center',
                          }}
                        >
                          <md-checkbox
                            checked={selectedTurnos.includes(turno.id)}
                            onClick={e => {
                              e.stopPropagation();
                              handleSelectTurno(turno.id);
                            }}
                            touch-target="wrapper"
                          />
                        </div>
                      )}

                      {viewMode === 'grid' ? (
                        <div className="flex flex-col h-full">
                          <div className="flex items-start justify-between gap-2 pb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="relative w-12 h-12 shrink-0">
                                <Avvvatars
                                  value={turno.conductor}
                                  size={48}
                                  radius={10}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-h5 font-bold text-primary truncate">
                                  {turno.conductor}
                                </h3>
                                <div className="flex items-center gap-1 text-body2">
                                  <span className="text-secondary truncate text-xs">
                                    {turno.vehiculo}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span
                              className={`btn font-medium btn-sm flex items-center shrink-0 ${
                                turno.status === 'Activo'
                                  ? 'btn-green'
                                  : 'btn-red'
                              }`}
                            >
                              {turno.status === 'Activo'
                                ? 'Activo'
                                : 'Inactivo'}
                            </span>
                          </div>

                          <div className="flex-1 space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-fill flex items-center justify-center">
                                <md-icon className="text-sm text-primary">
                                  calendar_today
                                </md-icon>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-secondary">
                                  Fecha
                                </span>
                                <span className="text-xs font-semibold text-primary truncate">
                                  {turno.fecha}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-fill flex items-center justify-center">
                                <md-icon className="text-sm text-primary">
                                  schedule
                                </md-icon>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-secondary">
                                  Hora
                                </span>
                                <span className="text-xs font-semibold text-primary">
                                  {turno.hora}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-auto">
                            <div className="relative group flex-1">
                              <button
                                className={`btn btn-sm-2 font-medium flex items-center gap-1 w-full justify-center ${
                                  turno.status === 'Activo'
                                    ? 'btn-outline'
                                    : 'btn-secondary'
                                }`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSwitchClick(turno);
                                }}
                              >
                                <md-icon className="text-sm">
                                  {turno.status === 'Activo'
                                    ? 'block'
                                    : 'check'}
                                </md-icon>
                              </button>
                              <div className="tooltip-smart absolute left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                <div className="bg-background border border-border rounded-lg shadow-2xl p-2 whitespace-nowrap">
                                  <p className="text-xs text-primary">
                                    {turno.status === 'Activo'
                                      ? 'Deshabilitar'
                                      : 'Habilitar'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="relative group flex-1">
                              <button
                                className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 w-full justify-center"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleEditClick(e, turno);
                                }}
                              >
                                <md-icon className="text-sm">edit</md-icon>
                              </button>
                              <div className="tooltip-smart absolute left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                <div className="bg-background border border-border rounded-lg shadow-2xl p-2 whitespace-nowrap">
                                  <p className="text-xs text-primary">Editar</p>
                                </div>
                              </div>
                            </div>

                            <div className="relative group flex-1">
                              <button
                                className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 w-full justify-center"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteClick(turno);
                                }}
                              >
                                <md-icon className="text-sm">delete</md-icon>
                              </button>
                              <div className="tooltip-smart absolute left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                <div className="bg-background border border-border rounded-lg shadow-2xl p-2 whitespace-nowrap">
                                  <p className="text-xs text-primary">
                                    Eliminar
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-16 h-16 rounded-lg bg-fill flex items-center justify-center shrink-0">
                              <md-icon className="text-3xl text-primary">
                                schedule
                              </md-icon>
                            </div>
                            <div>
                              <h1 className="h4 font-bold">
                                {turno.conductor}
                              </h1>
                              <div className="flex gap-2 mt-1 items-center text-body2 text-secondary">
                                <span>{turno.vehiculo}</span>
                                <span>•</span>
                                <span>{turno.fecha}</span>
                                <span>•</span>
                                <span>{turno.hora}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 items-center">
                            <span
                              className={`btn font-medium btn-lg flex items-center mr-2 ${
                                turno.status === 'Activo'
                                  ? 'btn-green'
                                  : 'btn-red'
                              }`}
                            >
                              {turno.status === 'Activo'
                                ? 'Activo'
                                : 'Inactivo'}
                            </span>

                            <button
                              className={`btn btn-lg font-medium flex items-center gap-1 ${turno.status === 'Activo' ? 'btn-outline' : 'btn-secondary'}`}
                              onClick={e => {
                                e.stopPropagation();
                                handleSwitchClick(turno);
                              }}
                            >
                              {turno.status === 'Activo'
                                ? 'Deshabilitar'
                                : 'Habilitar'}
                            </button>
                            <button
                              className="btn btn-primary btn-lg font-medium flex items-center gap-1"
                              onClick={e => {
                                e.stopPropagation();
                                handleEditClick(e, turno);
                              }}
                            >
                              <md-icon className="text-sm">edit</md-icon>
                              Editar
                            </button>
                            <button
                              className="btn btn-secondary btn-lg font-medium flex items-center gap-1"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteClick(turno);
                              }}
                            >
                              <md-icon className="text-sm">delete</md-icon>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
        <TurnosProfile
          vehicle={selectedTurno}
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="turno"
        itemName={
          turnoToDelete
            ? `${turnoToDelete.fecha} - ${turnoToDelete.hora}`
            : null
        }
      />

      <SwitchModal
        isOpen={isSwitchModalOpen}
        onClose={handleSwitchCancel}
        onConfirm={handleSwitchConfirm}
        itemType="turno"
        isCurrentlyActive={turnoToSwitch?.status === 'Activo'}
      />

      <AddTurnoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmitTurno={handleAddTurno}
      />

      <EditTurnoModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTurnoToEdit(null);
        }}
        turno={turnoToEdit}
        onUpdateTurno={handleUpdateTurno}
      />

      <DeleteModal
        isOpen={isDeleteMultipleModalOpen}
        onClose={() => setIsDeleteMultipleModalOpen(false)}
        onConfirm={handleDeleteMultipleConfirm}
        itemType="turno"
        isPlural={true}
        count={selectedTurnos.length}
      />
    </section>
  );
};

export default TurnosPage;
