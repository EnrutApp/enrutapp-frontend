import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/checkbox/checkbox.js';
import UbicacionProfile from './pages/UbicacionProfile';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import ForceDeleteUbicacionModal from './components/forceDeleteUbicacionModal/ForceDeleteUbicacionModal';
import InfoRutasActivasModal from './components/infoRutasActivasModal/InfoRutasActivasModal';
import UbicacionAdd from './components/ubicacionAddModal/UbicacionAdd';
import ubicacionesService from './api/ubicacionesService';
import { useEffect, useMemo, useState } from 'react';

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

const UbicacionesPage = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [allUbicaciones, setAllUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedUbicacion, setSelectedUbicacion] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ubicacionToDelete, setUbicacionToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [ubicacionToSwitch, setUbicacionToSwitch] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isForceDeleteModalOpen, setIsForceDeleteModalOpen] = useState(false);
  const [rutasInfo, setRutasInfo] = useState(null);
  const [isInfoRutasModalOpen, setIsInfoRutasModalOpen] = useState(false);
  const [rutasInfoDeshabilitar, setRutasInfoDeshabilitar] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list');

  const [selectedUbicaciones, setSelectedUbicaciones] = useState([]);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const fetchUbicaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ubicacionesService.getAll();
      const data = Array.isArray(res) ? res : res.data || [];

      const allMapped = data.map(u => ({
        id: u.id,
        nombre: u.nombre,
        direccion: u.direccion,
        activo: u.estado,
        latitud: u.latitud,
        longitud: u.longitud,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));

      setAllUbicaciones(allMapped);

      setUbicaciones(allMapped);
    } catch (err) {
      
      setError(
        err?.message ||
        err?.response?.data?.message ||
        'Error al cargar ubicaciones'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
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

  const totalCount = useMemo(() => allUbicaciones.length, [allUbicaciones]);
  const activeCount = useMemo(
    () => allUbicaciones.filter(u => u.activo).length,
    [allUbicaciones]
  );
  const inactiveCount = useMemo(
    () => allUbicaciones.filter(u => !u.activo).length,
    [allUbicaciones]
  );

  const filteredAndSortedUbicaciones = useMemo(() => {
    let filtered = [...allUbicaciones];

    if (searchQuery) {
      filtered = filtered.filter(
        u =>
          u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.direccion.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'Todos') {
      if (statusFilter === 'Activas') {
        filtered = filtered.filter(u => u.activo);
      } else if (statusFilter === 'Inactivas') {
        filtered = filtered.filter(u => !u.activo);
      }
    }

    filtered.sort((a, b) => {
      let aValue, bValue;
      if (sortBy === 'nombre') {
        aValue = a.nombre.toLowerCase();
        bValue = b.nombre.toLowerCase();
      } else {
        aValue = (a[sortBy] || '').toString().toLowerCase();
        bValue = (b[sortBy] || '').toString().toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [allUbicaciones, searchQuery, statusFilter, sortBy, sortOrder]);

  const {
    currentPage,
    totalPages,
    currentData: currentUbicaciones,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(filteredAndSortedUbicaciones, viewMode === 'grid' ? 8 : 4);

  const handleOpenProfile = ubicacion => {
    setSelectedUbicacion(ubicacion);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedUbicacion(null);
  };

  const handleDeleteClick = async ubicacion => {
    setUbicacionToDelete(ubicacion);

    try {
      const rutasInfo = await ubicacionesService.getRutasActivas(ubicacion.id);

      if (rutasInfo?.tieneRutasActivas && rutasInfo?.rutasActivas?.length > 0) {
        setRutasInfo({
          totalRutas: rutasInfo.totalRutasActivas,
          rutas: rutasInfo.rutasActivas,
        });
        setIsForceDeleteModalOpen(true);
      } else {
        setIsDeleteModalOpen(true);
      }
    } catch (err) {
      
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ubicacionToDelete) return;

    setIsDeleteModalOpen(false);

    try {
      const response = await ubicacionesService.remove(ubicacionToDelete.id);

      setUbicacionToDelete(null);

      if (response?.data?.message) {
        alert(response.data.message);
      } else if (response?.message) {
        alert(response.message);
      }

      await fetchUbicaciones();
    } catch (err) {
      

      let errorMessage = 'Error al eliminar ubicación';
      const errorData = err?.data || err?.response?.data || err;

      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
      setUbicacionToDelete(null);
    }
  };

  const handleForceDeleteConfirm = async () => {
    if (!ubicacionToDelete) return;
    try {
      const response = await ubicacionesService.forceDelete(
        ubicacionToDelete.id
      );

      setIsForceDeleteModalOpen(false);
      setUbicacionToDelete(null);
      setRutasInfo(null);

      if (response?.data?.message) {
        alert(response.data.message);
      } else if (response?.message) {
        alert(response.message);
      }

      await fetchUbicaciones();
    } catch (err) {
      

      let errorMessage = 'Error al eliminar ubicación';

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
      setIsForceDeleteModalOpen(false);
      setUbicacionToDelete(null);
      setRutasInfo(null);
    }
  };

  const handleForceDeleteCancel = () => {
    setIsForceDeleteModalOpen(false);
    setUbicacionToDelete(null);
    setRutasInfo(null);
  };

  const handleSwitchClick = async ubicacion => {
    setUbicacionToSwitch(ubicacion);

    if (ubicacion.activo) {
      try {
        const rutasInfo = await ubicacionesService.getRutasActivas(
          ubicacion.id
        );

        if (
          rutasInfo?.tieneRutasActivas &&
          rutasInfo?.rutasActivas?.length > 0
        ) {
          setRutasInfoDeshabilitar({
            totalRutas: rutasInfo.totalRutasActivas,
            rutas: rutasInfo.rutasActivas,
          });
          setIsInfoRutasModalOpen(true);
          return;
        }
      } catch (err) {
        
      }
    }
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    if (!ubicacionToSwitch) return;

    setIsSwitchModalOpen(false);

    try {
      await ubicacionesService.update(ubicacionToSwitch.id, {
        estado: !ubicacionToSwitch.activo,
      });

      setUbicacionToSwitch(null);
      await fetchUbicaciones();
    } catch (err) {
      

      const errorData = err?.data || err?.response?.data || err;
      let errorMessage = 'Error al cambiar estado';
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
      setUbicacionToSwitch(null);
    }
  };

  const handleAddSuccess = () => fetchUbicaciones();

  const handleOpenEdit = ubicacion => {
    setSelectedUbicacion(ubicacion);
    setIsEditOpen(true);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedUbicaciones([]);
  };

  const handleSelectAll = () => {
    const currentPageIds = currentUbicaciones.map(u => u.id);
    const allCurrentSelected = currentPageIds.every(id =>
      selectedUbicaciones.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedUbicaciones(prev =>
        prev.filter(id => !currentPageIds.includes(id))
      );
    } else {
      setSelectedUbicaciones(prev => {
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

  const handleSelectUbicacion = ubicacionId => {
    setSelectedUbicaciones(prev => {
      if (prev.includes(ubicacionId)) {
        return prev.filter(id => id !== ubicacionId);
      } else {
        return [...prev, ubicacionId];
      }
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedUbicaciones.length === 0) return;
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    setIsDeleteMultipleModalOpen(false);

    const deletePromises = selectedUbicaciones.map(async ubicacionId => {
      try {
        await ubicacionesService.remove(ubicacionId);
        return { success: true, id: ubicacionId };
      } catch (err) {
        
        return { success: false, id: ubicacionId, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    if (failedCount === 0) {
      alert(`Se eliminaron ${successCount} ubicaciones exitosamente`);
    } else {
      alert(
        `Se eliminaron ${successCount} ubicaciones. ${failedCount} fallaron (pueden tener rutas activas)`
      );
    }

    setSelectedUbicaciones([]);
    setIsSelectionMode(false);
    await fetchUbicaciones();
  };

  const handleCancelSelection = () => {
    setSelectedUbicaciones([]);
    setIsSelectionMode(false);
  };

  useEffect(() => {
    setSelectedUbicaciones([]);
    setIsSelectionMode(false);
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center w-full content-box-outline-2-small list-enter"
        style={{ height: 'calc(100vh - 0px)' }}
      >
        <div
          className="flex flex-col items-center justify-center"
          style={{ width: '340px' }}
        >
          <md-icon className="text-red mb-4">warning</md-icon>
          <p className="text-primary mb-4">
            Error al cargar ubicaciones: {error}
          </p>
          <button onClick={fetchUbicaciones} className="btn btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <section>
        {!isProfileOpen ? (
          <>
            <div className="list-enter">
              <div className="flex justify-between items-center">
                <h1 className="h4 font-medium">Ubicaciones</h1>
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
                            Buscar ubicación
                          </span>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Nombre o dirección..."
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
                  <md-filled-button
                    className="btn-add px-5"
                    onClick={() => setIsAddOpen(true)}
                  >
                    <md-icon slot="icon" className="text-sm text-on-primary">
                      add
                    </md-icon>
                    Agregar una ubicación
                  </md-filled-button>
                </div>
              </div>

              <div className="flex mt-4 gap-2">
                <div className="content-box-outline-3-small">
                  <span className="subtitle2 font-light">Totales</span>
                  <h2 className="h4 text-primary font-bold">{totalCount}</h2>
                </div>
                <div className="content-box-outline-3-small">
                  <span className="subtitle2 font-light">Activas</span>
                  <h2 className="h4 text-primary font-bold">{activeCount}</h2>
                </div>
                <div className="content-box-outline-3-small">
                  <span className="subtitle2 font-light">Inactivas</span>
                  <h2 className="h4 text-primary font-bold">{inactiveCount}</h2>
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
                      <option value="Activas">Estado: Activas</option>
                      <option value="Inactivas">Estado: Inactivas</option>
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
                      <option value="direccion">Ordenar por: Dirección</option>
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

                {currentUbicaciones.length > 0 && !isSelectionMode && (
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
                          currentUbicaciones.length > 0 &&
                          currentUbicaciones.every(u =>
                            selectedUbicaciones.includes(u.id)
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

              <div className="flex justify-between items-center mt-6 mb-4">
                <div className="flex items-center gap-3">
                  {selectedUbicaciones.length > 0 ? (
                    <>
                      <span className="text-sm text-secondary">
                        {selectedUbicaciones.length} Seleccionados
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-secondary">
                      {loading
                        ? 'Cargando ubicaciones...'
                        : `Mostrando ${totalItems > 0 ? startIndex + 1 : 0}-${Math.min(startIndex + (viewMode === 'grid' ? 8 : 4), totalItems)} de ${totalItems} ubicaciones`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {showPagination && (
                    <span className="text-xs text-secondary">
                      Página {currentPage} de {totalPages}
                    </span>
                  )}

                  <div className="flex bg-fill rounded-lg p-1 border border-border ml-2">
                    <button
                      className={`p-1 rounded-md transition-all ${viewMode === 'list'
                          ? 'bg-background text-primary shadow-sm'
                          : 'text-secondary hover:text-primary'
                        }`}
                      onClick={() => setViewMode('list')}
                    >
                      <md-icon className="text-xl">view_list</md-icon>
                    </button>
                    <button
                      className={`p-1 rounded-md transition-all ${viewMode === 'grid'
                          ? 'bg-background text-primary shadow-sm'
                          : 'text-secondary hover:text-primary'
                        }`}
                      onClick={() => setViewMode('grid')}
                    >
                      <md-icon className="text-xl">grid_view</md-icon>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                {loading ? (
                  <p className="text-secondary">Cargando ubicaciones...</p>
                ) : currentUbicaciones.length > 0 ? (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                    {currentUbicaciones.map((ubicacion, index) => (
                      <div
                        key={ubicacion.id || index}
                        className={`content-box-outline-4-small cursor-pointer relative ${ubicacion.activo ? '' : 'opacity-60'}`}
                        onClick={() => handleOpenProfile(ubicacion)}
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
                              checked={selectedUbicaciones.includes(
                                ubicacion.id
                              )}
                              onChange={e => {
                                e.stopPropagation();
                                handleSelectUbicacion(ubicacion.id);
                              }}
                              onClick={e => e.stopPropagation()}
                              touch-target="wrapper"
                            />
                          </div>
                        )}

                        {viewMode === 'grid' ? (
                          <div className="flex flex-col gap-3">
                            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center">
                              <md-icon style={{ fontSize: '48px' }} className="text-secondary">location_on</md-icon>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-2 pb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-h5 font-bold text-primary truncate mb-1">
                                    {ubicacion.nombre}
                                  </h3>
                                  <div className="flex items-center gap-2 text-body2">
                                    <md-icon className="text-xs text-secondary">place</md-icon>
                                    <span className="text-secondary truncate">
                                      {ubicacion.direccion}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`btn font-medium btn-sm flex items-center ${ubicacion.activo ? 'btn-green' : 'btn-red'
                                    }`}
                                >
                                  {ubicacion.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <div className="relative group flex-1">
                                <button
                                  className={`btn btn-sm-2 font-medium flex items-center gap-1 w-full justify-center ${ubicacion.activo ? 'btn-outline' : 'btn-secondary'
                                    }`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSwitchClick(ubicacion);
                                  }}
                                >
                                  <md-icon className="text-sm">
                                    {ubicacion.activo ? 'block' : 'check'}
                                  </md-icon>
                                </button>
                                <div className="tooltip-smart absolute left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                  <div className="bg-background border border-border rounded-lg shadow-2xl p-2 whitespace-nowrap">
                                    <p className="text-xs text-primary">
                                      {ubicacion.activo ? 'Deshabilitar' : 'Habilitar'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="relative group flex-1">
                                <button
                                  className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 w-full justify-center"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleOpenEdit(ubicacion);
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
                                    handleDeleteClick(ubicacion);
                                  }}
                                >
                                  <md-icon className="text-sm">delete</md-icon>
                                </button>
                                <div className="tooltip-smart absolute left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                  <div className="bg-background border border-border rounded-lg shadow-2xl p-2 whitespace-nowrap">
                                    <p className="text-xs text-primary">Eliminar</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-1">
                              <div>
                                <h1 className="h4 font-bold">{ubicacion.nombre}</h1>
                                <div className="flex gap-2 mt-2 items-center">
                                  <span
                                    className={`btn font-medium btn-lg flex items-center ${ubicacion.activo ? 'btn-green' : 'btn-red'}`}
                                  >
                                    {ubicacion.activo ? 'Activo' : 'Inactivo'}
                                  </span>
                                  <span
                                    className="truncate max-w-57 btn-primary btn-lg"
                                    title={ubicacion.direccion}
                                  >
                                    {ubicacion.direccion}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center">
                              <button
                                className={`btn btn-lg font-medium flex items-center gap-1 ${ubicacion.activo ? 'btn-outline' : 'btn-secondary'}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSwitchClick(ubicacion);
                                }}
                              >
                                {ubicacion.activo ? 'Deshabilitar' : 'Habilitar'}
                              </button>
                              <button
                                className="btn btn-primary btn-lg font-medium flex items-center gap-1"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleOpenEdit(ubicacion);
                                }}
                              >
                                <md-icon className="text-sm">edit</md-icon>
                                Editar
                              </button>
                              <button
                                className="btn btn-secondary btn-lg font-medium flex items-center gap-1"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteClick(ubicacion);
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
                ) : (
                  <div
                    className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                    style={{ height: 'calc(60vh - 0px)' }}
                  >
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{ width: '340px' }}
                    >
                      <md-icon className="text-secondary mb-4">
                        location_on
                      </md-icon>
                      <p className="text-secondary">
                        {searchQuery || statusFilter !== 'Todos'
                          ? 'No se encontraron ubicaciones que coincidan con los filtros'
                          : 'No hay ubicaciones registradas'}
                      </p>
                    </div>
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
          <UbicacionProfile
            ubicacion={selectedUbicacion}
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
            onAdd={() => setIsAddOpen(true)}
            onEdit={u => {
              setIsEditOpen(true);
              setSelectedUbicacion(u);
            }}
            onDelete={u => {
              handleDeleteClick(u);
              handleCloseProfile();
            }}
            onRefresh={fetchUbicaciones}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemType="ubicación"
          itemName={ubicacionToDelete?.nombre}
        />

        <DeleteModal
          isOpen={isDeleteMultipleModalOpen}
          onClose={() => setIsDeleteMultipleModalOpen(false)}
          onConfirm={handleDeleteMultipleConfirm}
          itemType="ubicaciones"
          isPlural={true}
          itemName={`${selectedUbicaciones.length} ubicaciones seleccionadas`}
        />

        <ForceDeleteUbicacionModal
          isOpen={isForceDeleteModalOpen}
          onClose={handleForceDeleteCancel}
          onConfirm={handleForceDeleteConfirm}
          ubicacionNombre={ubicacionToDelete?.nombre}
          rutasInfo={rutasInfo}
        />

        <InfoRutasActivasModal
          isOpen={isInfoRutasModalOpen}
          onClose={() => {
            setIsInfoRutasModalOpen(false);
            setRutasInfoDeshabilitar(null);
          }}
          ubicacionNombre={ubicacionToSwitch?.nombre}
          rutasInfo={rutasInfoDeshabilitar}
        />

        <SwitchModal
          isOpen={isSwitchModalOpen}
          onClose={() => setIsSwitchModalOpen(false)}
          onConfirm={handleSwitchConfirm}
          itemType="ubicación"
          itemName={ubicacionToSwitch?.nombre}
          isCurrentlyActive={ubicacionToSwitch?.activo}
        />

        <UbicacionAdd
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onConfirm={handleAddSuccess}
        />

        <UbicacionAdd
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
          }}
          onConfirm={fetchUbicaciones}
          itemData={selectedUbicacion}
        />
      </section>
    </>
  );
};

export default UbicacionesPage;
