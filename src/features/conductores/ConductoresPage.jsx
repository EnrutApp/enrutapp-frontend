import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/linear-progress.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import ConductorProfile from './pages/ConductorProfile';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddConductorModalNew from './components/addConductorModal/AddConductorModalNew';
import EditConductorModal from './components/editConductorModal/EditConductorModal';
import conductorService from './api/conductorService';
import userService from '../usuarios/api/userService';
import { useState, useEffect } from 'react';
import Avvvatars from 'avvvatars-react';
import resolveAssetUrl from '../../shared/utils/url';

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

const ConductoresPage = () => {
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [conductorToDelete, setConductorToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [conductorToSwitch, setConductorToSwitch] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [conductorToEdit, setConductorToEdit] = useState(null);
  const [allConductores, setAllConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [selectedConductores, setSelectedConductores] = useState([]);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    loadConductores();
  }, []);

  useEffect(() => {
    const handleClickOutside = event => {
      if (isSearchOpen && !event.target.closest('.relative')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const loadConductores = async () => {
    try {
      setLoading(true);
      const response = await conductorService.getConductores();
      setAllConductores(response.data || []);
    } catch (error) {
      console.error('Error al cargar conductores:', error);
      setAllConductores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = conductor => {
    setSelectedConductor(conductor);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedConductor(null);
  };

  const handleDeleteClick = conductor => {
    setConductorToDelete(conductor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(conductorToDelete.idUsuario);
      await loadConductores();
      setIsDeleteModalOpen(false);
      setConductorToDelete(null);
    } catch (error) {
      console.error('Error al eliminar conductor:', error);
      alert('Error al eliminar el conductor: ' + error.message);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setConductorToDelete(null);
  };

  const handleSwitchClick = conductor => {
    setConductorToSwitch(conductor);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    try {
      const response = await userService.cambiarEstado(
        conductorToSwitch.idUsuario,
        !conductorToSwitch.estado
      );

      if (response.success === false) {
        alert(response.message || 'No se pudo cambiar el estado del conductor');
        setIsSwitchModalOpen(false);
        return;
      }

      await loadConductores();
      setIsSwitchModalOpen(false);
      setConductorToSwitch(null);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del conductor');
      setIsSwitchModalOpen(false);
    }
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setConductorToSwitch(null);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddConductor = async data => {
    try {
      await conductorService.createConductor(data);
      await loadConductores();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error al agregar conductor:', error);
      throw error;
    }
  };

  const handleEditClick = (e, conductor) => {
    e.stopPropagation();
    setConductorToEdit(conductor);
    setIsEditModalOpen(true);
  };

  const handleUpdateConductor = async (id, data) => {
    try {
      if (id) {
        await conductorService.updateConductor(id, data);
      } else {
        if (conductorToEdit && conductorToEdit.idUsuario) {
          await conductorService.createConductor({
            idUsuario: conductorToEdit.idUsuario,
            ...data,
          });
        } else {
          throw new Error(
            'No se pudo identificar el usuario para crear el conductor'
          );
        }
      }
      await loadConductores();
      setIsEditModalOpen(false);
      setConductorToEdit(null);
    } catch (error) {
      console.error('Error al actualizar conductor:', error);
      throw error;
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedConductores([]);
  };

  const handleSelectAll = () => {
    const currentPageIds = currentCondutores.map(c => c.idConductor);
    const allCurrentSelected = currentPageIds.every(id =>
      selectedConductores.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedConductores(prev =>
        prev.filter(id => !currentPageIds.includes(id))
      );
    } else {
      setSelectedConductores(prev => {
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

  const handleSelectConductor = conductorId => {
    setSelectedConductores(prev => {
      if (prev.includes(conductorId)) {
        return prev.filter(id => id !== conductorId);
      } else {
        return [...prev, conductorId];
      }
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedConductores.length === 0) return;
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    setIsDeleteMultipleModalOpen(false);

    const deletePromises = selectedConductores.map(async conductorId => {
      try {
        const conductor = allConductores.find(
          c => c.idConductor === conductorId
        );
        if (!conductor) {
          return {
            success: false,
            id: conductorId,
            error: 'Conductor no encontrado',
          };
        }

        await userService.deleteUser(conductor.idUsuario);
        return { success: true, id: conductorId };
      } catch (err) {
        return { success: false, id: conductorId, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    if (failedCount === 0) {
      alert(`Se eliminaron ${successCount} conductores exitosamente`);
    } else {
      alert(
        `Se eliminaron ${successCount} conductores. ${failedCount} fallaron`
      );
    }

    setSelectedConductores([]);
    setIsSelectionMode(false);
    await loadConductores();
  };

  const handleCancelSelection = () => {
    setSelectedConductores([]);
    setIsSelectionMode(false);
  };

  const filteredConductores = allConductores.filter(conductor => {
    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activos' && conductor.estado) ||
      (statusFilter === 'Inactivos' && !conductor.estado);

    const matchesSearch =
      searchQuery === '' ||
      conductor.usuario?.nombre
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conductor.usuario?.numDocumento
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conductor.numeroLicencia
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conductor.categoriaLicencia?.nombreCategoria
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const sortedConductores = filteredConductores.sort((a, b) => {
    let aValue, bValue;

    if (sortBy === 'nombre') {
      aValue = a.usuario?.nombre || '';
      bValue = b.usuario?.nombre || '';
    } else if (sortBy === 'documento') {
      aValue = a.usuario?.numDocumento || '';
      bValue = b.usuario?.numDocumento || '';
    } else if (sortBy === 'licencia') {
      aValue = a.numeroLicencia || '';
      bValue = b.numeroLicencia || '';
    } else {
      aValue = a[sortBy] || '';
      bValue = b[sortBy] || '';
    }

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
    currentData: currentCondutores,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(sortedConductores, viewMode === 'grid' ? 8 : 4);

  return (
    <>
      <style>{styles}</style>
      <section>
        {!isProfileOpen ? (
          <>
            <div className="list-enter">
              <div className="flex justify-between items-center">
                <h1 className="h4 font-medium">Conductores</h1>
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
                            Buscar conductor
                          </span>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Nombre, documento, licencia..."
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
                        person_add
                      </md-icon>
                      Agregar conductores
                    </md-filled-button>
                  </div>
                </div>
              </div>
              <div className="flex mt-4 gap-2">
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Totales</span>
                    <h2 className="h4 text-primary font-bold">{totalItems}</h2>
                  </div>
                </div>
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Activos</span>
                    <h2 className="h4 text-primary font-bold">
                      {allConductores.filter(c => c.estado === true).length}
                    </h2>
                  </div>
                </div>
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Inactivos</span>
                    <h2 className="h4 text-primary font-bold">
                      {allConductores.filter(c => c.estado === false).length}
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
                      <option value="nombre">Ordenar por: Nombre</option>
                      <option value="documento">Ordenar por: Documento</option>
                      <option value="licencia">Ordenar por: Licencia</option>
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

                {currentCondutores.length > 0 && !isSelectionMode && (
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
                          currentCondutores.length > 0 &&
                          currentCondutores.every(c =>
                            selectedConductores.includes(c.idConductor)
                          )
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
                      disabled={selectedConductores.length === 0}
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
                    {selectedConductores.length > 0 ? (
                      <span className="text-sm text-secondary">
                        {selectedConductores.length} Seleccionados
                      </span>
                    ) : (
                      !loading && (
                        <span className="text-sm text-secondary">
                          {`Mostrando ${
                            totalItems > 0 ? startIndex + 1 : 0
                          }-${Math.min(
                            startIndex + (viewMode === 'grid' ? 8 : 4),
                            totalItems
                          )} de ${totalItems} conductores`}
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
                {loading ? (
                  <div
                    className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                    style={{ height: 'calc(60vh - 0px)' }}
                  >
                    <div
                      className="flex flex-col items-center gap-3"
                      style={{ width: '200px' }}
                    >
                      <md-icon className="text-secondary mb-4">person</md-icon>
                      <span className="text-secondary">
                        Cargando conductores...
                      </span>
                      <md-linear-progress indeterminate></md-linear-progress>
                    </div>
                  </div>
                ) : currentCondutores.length === 0 ? (
                  <div
                    className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                    style={{ height: 'calc(60vh - 0px)' }}
                  >
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{ width: '340px' }}
                    >
                      <md-icon className="text-secondary mb-4">
                        person_off
                      </md-icon>
                      <p className="text-secondary">
                        {searchQuery || statusFilter !== 'Todos'
                          ? 'No se encontraron conductores que coincidan con los filtros'
                          : 'No hay conductores registrados'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                        : 'flex flex-col gap-3'
                    }
                  >
                    {currentCondutores.map((conductor, index) => {
                      const fechaVencimiento =
                        conductor.fechaVencimientoLicencia
                          ? new Date(conductor.fechaVencimientoLicencia)
                          : null;
                      const hoy = new Date();
                      hoy.setHours(0, 0, 0, 0);
                      const diasRestantes = fechaVencimiento
                        ? Math.ceil(
                            (fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)
                          )
                        : null;
                      const licenciaVencida =
                        diasRestantes !== null && diasRestantes < 0;
                      const licenciaProximaAVencer =
                        diasRestantes !== null &&
                        diasRestantes >= 0 &&
                        diasRestantes <= 30;

                      const informacionIncompleta =
                        !conductor.numeroLicencia ||
                        !conductor.idCategoriaLicencia ||
                        !conductor.fechaVencimientoLicencia;

                      return (
                        <div
                          key={conductor.idConductor || index}
                          className={`content-box-outline-4-small ${!conductor.estado ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow relative`}
                          onClick={e => {
                            if (
                              e.target.closest('md-switch') ||
                              e.target.closest('button')
                            )
                              return;
                            handleOpenProfile(conductor);
                          }}
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
                                checked={selectedConductores.includes(
                                  conductor.idConductor
                                )}
                                onChange={e => {
                                  e.stopPropagation();
                                  handleSelectConductor(conductor.idConductor);
                                }}
                                onClick={e => e.stopPropagation()}
                                touch-target="wrapper"
                              />
                            </div>
                          )}

                          {viewMode === 'grid' ? (
                            <div className="flex flex-col h-full">
                              <div
                                className="flex items-start justify-between gap-2 pb-3 cursor-pointer flex-1"
                                onClick={e => {
                                  if (
                                    !e.target.closest('button') &&
                                    !e.target.closest('md-checkbox') &&
                                    !e.target.closest('.action-buttons')
                                  ) {
                                    handleOpenProfile(conductor);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="flex items-center justify-center w-12 h-12 shrink-0">
                                    {conductor.usuario?.foto ? (
                                      <img
                                        src={resolveAssetUrl(
                                          conductor.usuario.foto
                                        )}
                                        alt="Foto de perfil"
                                        className="rounded-lg w-12 h-12 object-cover shadow-lg"
                                      />
                                    ) : (
                                      <Avvvatars
                                        value={
                                          conductor.usuario?.nombre ||
                                          'Conductor'
                                        }
                                        size={48}
                                        radius={8}
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-h5 font-bold text-primary truncate group-hover:text-primary/80 transition-colors">
                                      {conductor.usuario?.nombre ||
                                        'Sin nombre'}
                                    </h3>
                                    <div className="flex items-center gap-1 text-body2">
                                      <span className="text-secondary truncate text-xs">
                                        {conductor.usuario?.numDocumento ||
                                          'Sin documento'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`btn font-medium btn-sm flex items-center shrink-0 ${
                                    conductor.estado ? 'btn-green' : 'btn-red'
                                  }`}
                                >
                                  {conductor.estado ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>

                              <div
                                className="flex-1 space-y-2 mb-3 cursor-pointer"
                                onClick={e => {
                                  if (
                                    !e.target.closest('button') &&
                                    !e.target.closest('md-checkbox') &&
                                    !e.target.closest('.action-buttons')
                                  ) {
                                    handleOpenProfile(conductor);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center shrink-0">
                                    <md-icon className="text-base text-primary">
                                      drive_eta
                                    </md-icon>
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs text-secondary">
                                      Licencia
                                    </span>
                                    <span className="text-sm font-semibold text-primary truncate">
                                      {conductor.numeroLicencia || 'N/A'}
                                    </span>
                                  </div>
                                </div>

                                {conductor.categoriaLicencia
                                  ?.nombreCategoria && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    <span className="btn btn-outline btn-sm font-medium flex items-center text-xs px-2 py-1">
                                      {
                                        conductor.categoriaLicencia
                                          .nombreCategoria
                                      }
                                    </span>
                                    {licenciaVencida && (
                                      <span className="btn btn-sm font-medium flex items-center bg-red-100 text-red-700 border border-red-300 text-xs px-2 py-1">
                                        <md-icon className="text-xs">
                                          error
                                        </md-icon>
                                        Vencida
                                      </span>
                                    )}
                                    {licenciaProximaAVencer && (
                                      <span className="btn btn-sm font-medium flex items-center btn-yellow text-xs px-2 py-1">
                                        <md-icon className="text-xs">
                                          warning
                                        </md-icon>
                                        Próx. Vencer
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 mt-auto action-buttons">
                                <button
                                  className={`btn btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95 ${
                                    conductor.estado
                                      ? 'btn-outline'
                                      : 'btn-secondary'
                                  }`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSwitchClick(conductor);
                                  }}
                                  title={
                                    conductor.estado
                                      ? 'Deshabilitar conductor'
                                      : 'Habilitar conductor'
                                  }
                                >
                                  <md-icon className="text-sm">
                                    {conductor.estado ? 'block' : 'check'}
                                  </md-icon>
                                </button>

                                <button
                                  className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95"
                                  onClick={e => handleEditClick(e, conductor)}
                                  title="Editar conductor"
                                >
                                  <md-icon className="text-sm">edit</md-icon>
                                </button>

                                <button
                                  className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95 hover:bg-red-500/20 hover:text-red-500"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteClick(conductor);
                                  }}
                                  title="Eliminar conductor"
                                >
                                  <md-icon className="text-sm">delete</md-icon>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-16 h-16">
                                  {conductor.usuario?.foto ? (
                                    <img
                                      src={resolveAssetUrl(
                                        conductor.usuario.foto
                                      )}
                                      alt={
                                        conductor.usuario?.nombre || 'Conductor'
                                      }
                                      className="rounded-lg w-16 h-16 object-cover shadow-2xl"
                                      onError={e => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Avvvatars
                                      value={
                                        conductor.usuario?.nombre || 'Conductor'
                                      }
                                      size={64}
                                      radius={11}
                                    />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="leading-tight">
                                    <h1 className="h4 font-bold">
                                      {conductor.usuario?.nombre ||
                                        'Sin nombre'}
                                    </h1>
                                    <div className="flex gap-2 text-secondary">
                                      <span>
                                        {conductor.usuario?.correo ||
                                          'Sin email'}
                                      </span>
                                      <span>|</span>
                                      <span>
                                        {conductor.usuario?.numDocumento ||
                                          'Sin documento'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 mt-2">
                                    <button
                                      className={`btn font-medium btn-lg flex items-center ${conductor.estado ? 'btn-green' : 'btn-red'}`}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      {conductor.estado ? 'Activo' : 'Inactivo'}
                                    </button>

                                    {conductor.categoriaLicencia
                                      ?.nombreCategoria && (
                                      <button className="btn btn-outline btn-lg font-medium flex items-center">
                                        <md-icon className="text-sm">
                                          badge
                                        </md-icon>
                                        {
                                          conductor.categoriaLicencia
                                            .nombreCategoria
                                        }
                                      </button>
                                    )}

                                    {informacionIncompleta && (
                                      <button className="btn btn-lg font-medium flex items-center btn-red">
                                        <md-icon className="text-sm">
                                          warning
                                        </md-icon>
                                        <span>Información Incompleta</span>
                                      </button>
                                    )}

                                    {!informacionIncompleta &&
                                      licenciaVencida && (
                                        <button className="btn btn-lg font-medium flex items-center bg-red-100 text-red-700 border border-red-300">
                                          <md-icon className="text-sm">
                                            error
                                          </md-icon>
                                          <span>Licencia Vencida</span>
                                        </button>
                                      )}

                                    {!informacionIncompleta &&
                                      licenciaProximaAVencer && (
                                        <button className="btn btn-lg font-medium flex items-center btn-yellow">
                                          <md-icon className="text-sm">
                                            warning
                                          </md-icon>
                                          <span>Próxima a Vencer</span>
                                        </button>
                                      )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  className={`btn btn-lg font-medium flex items-center gap-1 ${conductor.estado ? 'btn-outline' : 'btn-secondary'}`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSwitchClick(conductor);
                                  }}
                                >
                                  {conductor.estado
                                    ? 'Deshabilitar'
                                    : 'Habilitar'}
                                </button>

                                <button
                                  className="btn btn-primary btn-lg font-medium flex items-center gap-1"
                                  onClick={e => handleEditClick(e, conductor)}
                                >
                                  <md-icon className="text-sm">edit</md-icon>
                                  Editar
                                </button>

                                <button
                                  className="btn btn-secondary btn-lg font-medium flex items-center gap-1"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteClick(conductor);
                                  }}
                                >
                                  <md-icon className="text-sm">delete</md-icon>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
          <ConductorProfile
            conductor={selectedConductor}
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
            onConductorUpdated={loadConductores}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="conductor"
          itemName={conductorToDelete?.nombre}
        />

        <DeleteModal
          isOpen={isDeleteMultipleModalOpen}
          onClose={() => setIsDeleteMultipleModalOpen(false)}
          onConfirm={handleDeleteMultipleConfirm}
          itemType="conductores"
          isPlural={true}
        />

        <SwitchModal
          isOpen={isSwitchModalOpen}
          onClose={handleSwitchCancel}
          onConfirm={handleSwitchConfirm}
          itemType="conductor"
          itemName={
            conductorToSwitch
              ? conductorToSwitch.usuario?.nombre || 'Sin nombre'
              : ''
          }
          isCurrentlyActive={conductorToSwitch?.estado === true}
        />

        <AddConductorModalNew
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadConductores}
        />

        <EditConductorModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setConductorToEdit(null);
          }}
          conductor={conductorToEdit}
          onUpdateConductor={handleUpdateConductor}
        />
      </section>
    </>
  );
};

export default ConductoresPage;
