import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/linear-progress.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import VehiculoProfile from './pages/VehiculoProfile';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddVehiculoModal from './components/addVehiculoModal/AddVehiculoModal';
import EditVehiculoModal from './components/editVehiculoModal/EditVehiculoModal';
import { vehiculoService } from './api/vehiculoService';
import { useEffect, useMemo, useState } from 'react';
import { resolveAssetUrl } from '../../shared/utils/url';

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

  .tooltip-smart {
    bottom: 100%;
    margin-bottom: 0.5rem;
  }

  .tooltip-smart-arrow {
    top: 100%;
    margin-top: -1px;
  }

  .tooltip-smart-arrow-triangle {
    transform: rotate(45deg);
  }

  @media (max-height: 600px) {
    .tooltip-smart {
      top: 100%;
      bottom: auto;
      margin-top: 0.5rem;
      margin-bottom: 0;
    }

    .tooltip-smart-arrow {
      bottom: 100%;
      top: auto;
      margin-bottom: -1px;
      margin-top: 0;
    }

    .tooltip-smart-arrow-triangle {
      transform: rotate(45deg);
    }
  }
`;

const VehiculosPage = () => {
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
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('linea');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');

  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cargarVehiculos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vehiculoService.getVehiculos();
      const list = res?.data || res;
      setVehiculos(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err?.message ||
          err?.response?.data?.message ||
          'Error al cargar vehículos'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
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

  const mapToCard = v => {
    const imageUrl = v.fotoUrl ? resolveAssetUrl(v.fotoUrl) : '/alaskan.png';
    return {
      idVehiculo: v.idVehiculo,
      name: v.linea,
      plate: v.placa,
      capacity: v.capacidadPasajeros
        ? `${v.capacidadPasajeros} pasajeros`
        : '-',
      model: v.modelo,
      status: v.estado ? 'Activo' : 'Inactivo',
      image: imageUrl,
      statusIcon: v.estado ? 'check' : 'close',
      raw: v,
    };
  };

  const handleOpenProfile = vehicle => {
    setSelectedVehicle(vehicle);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedVehicle(null);
  };

  const handleDeleteClick = vehicle => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await vehiculoService.deleteVehiculo(
        vehicleToDelete?.raw?.idVehiculo || vehicleToDelete?.idVehiculo
      );
      await cargarVehiculos();
    } catch (err) {
    } finally {
      setIsDeleteModalOpen(false);
      setVehicleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setVehicleToDelete(null);
  };

  const handleSwitchClick = vehicle => {
    setVehicleToSwitch(vehicle);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    try {
      const id =
        vehicleToSwitch?.raw?.idVehiculo || vehicleToSwitch?.idVehiculo;
      const nuevoEstado = !(
        vehicleToSwitch?.raw?.estado ?? vehicleToSwitch?.status === 'Activo'
      );
      await vehiculoService.updateVehiculo(id, { estado: nuevoEstado });
      await cargarVehiculos();
    } catch (err) {
    } finally {
      setIsSwitchModalOpen(false);
      setVehicleToSwitch(null);
    }
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setVehicleToSwitch(null);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedVehicles([]);
  };

  const handleSelectAll = () => {
    const currentPageIds = currentVehiculos.map(v => v.idVehiculo);
    const allCurrentSelected = currentPageIds.every(id =>
      selectedVehicles.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedVehicles(prev =>
        prev.filter(id => !currentPageIds.includes(id))
      );
    } else {
      setSelectedVehicles(prev => {
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

  const handleSelectVehicle = vehicleId => {
    setSelectedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedVehicles.length === 0) return;
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    setIsDeleteMultipleModalOpen(false);

    const deletePromises = selectedVehicles.map(async vehicleId => {
      try {
        await vehiculoService.deleteVehiculo(vehicleId);
        return { success: true, id: vehicleId };
      } catch (err) {
        return { success: false, id: vehicleId, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    if (failedCount === 0) {
      alert(`Se eliminaron ${successCount} vehículos exitosamente`);
    } else {
      alert(`Se eliminaron ${successCount} vehículos. ${failedCount} fallaron`);
    }

    setSelectedVehicles([]);
    setIsSelectionMode(false);
    await cargarVehiculos();
  };

  const handleCancelSelection = () => {
    setSelectedVehicles([]);
    setIsSelectionMode(false);
  };

  const filteredVehiculos = vehiculos.filter(vehicle => {
    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activos' && vehicle.estado) ||
      (statusFilter === 'Inactivos' && !vehicle.estado);

    return matchesStatus;
  });

  const sortedVehiculos = filteredVehiculos.sort((a, b) => {
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

  const cards = useMemo(
    () => sortedVehiculos.map(mapToCard),
    [sortedVehiculos]
  );
  const {
    currentPage,
    totalPages,
    currentData: currentVehicles,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(cards, viewMode === 'grid' ? 8 : 4);

  const handleOpenAdd = () => setIsAddOpen(true);
  const handleCloseAdd = () => setIsAddOpen(false);
  const handleSubmitVehiculo = async (form, file) => {
    await vehiculoService.createVehiculo(
      {
        ...form,
        modelo: Number(form.modelo),
        capacidadPasajeros: Number(form.capacidadPasajeros),
        capacidadCarga: form.capacidadCarga
          ? Number(form.capacidadCarga)
          : undefined,
      },
      file
    );
    await cargarVehiculos();
  };

  const handleOpenEdit = vehicle => {
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
            Error al cargar vehículos: {error}
          </p>
          <button onClick={cargarVehiculos} className="btn btn-primary">
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
                <h1 className="h4 font-medium">Vehículos</h1>
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
                            Buscar vehículo
                          </span>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Línea, placa o modelo..."
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
                      onClick={handleOpenAdd}
                    >
                      <md-icon slot="icon" className="text-sm text-on-primary">
                        add
                      </md-icon>
                      Agregar un vehículo
                    </md-filled-button>
                  </div>
                </div>
              </div>

              <div className="flex mt-4 gap-2">
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Totales</span>
                    <h2 className="h4 text-primary font-bold">
                      {vehiculos.length}
                    </h2>
                  </div>
                </div>
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Activos</span>
                    <h2 className="h4 text-primary font-bold">
                      {vehiculos.filter(vehicle => vehicle.estado).length}
                    </h2>
                  </div>
                </div>
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Inactivos</span>
                    <h2 className="h4 text-primary font-bold">
                      {vehiculos.filter(vehicle => !vehicle.estado).length}
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
                      <option value="linea">Ordenar por: Línea</option>
                      <option value="placa">Ordenar por: Placa</option>
                      <option value="modelo">Ordenar por: Modelo</option>
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

                {currentVehicles.length > 0 && !isSelectionMode && (
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
                          currentVehicles.length > 0 &&
                          currentVehicles.every(v =>
                            selectedVehicles.includes(v.id)
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
                      disabled={selectedVehicles.length === 0}
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
                    {selectedVehicles.length > 0 ? (
                      <span className="text-sm text-secondary">
                        {selectedVehicles.length} Seleccionados
                      </span>
                    ) : (
                      !loading && (
                        <span className="text-sm text-secondary">
                          {`Mostrando ${
                            totalItems > 0 ? startIndex + 1 : 0
                          }-${Math.min(
                            startIndex + (viewMode === 'grid' ? 8 : 4),
                            totalItems
                          )} de ${totalItems} vehículos`}
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
                      <md-icon className="text-secondary mb-4">
                        directions_car
                      </md-icon>
                      <span className="text-secondary">
                        Cargando vehículos...
                      </span>
                      <md-linear-progress indeterminate></md-linear-progress>
                    </div>
                  </div>
                ) : currentVehicles.length === 0 ? (
                  <div
                    className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                    style={{ height: 'calc(60vh - 0px)' }}
                  >
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{ width: '340px' }}
                    >
                      <md-icon className="text-secondary mb-4">
                        directions_car
                      </md-icon>
                      <p className="text-secondary">
                        {searchQuery || statusFilter !== 'Todos'
                          ? 'No se encontraron vehículos que coincidan con los filtros'
                          : 'No hay vehículos registrados'}
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
                    {currentVehicles.map((vehicle, index) => (
                      <div
                        key={index}
                        className={`content-box-outline-4-small cursor-pointer relative ${vehicle.status === 'Inactivo' ? 'opacity-60' : ''}`}
                        onClick={() => handleOpenProfile(vehicle)}
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
                              checked={selectedVehicles.includes(
                                vehicle.idVehiculo
                              )}
                              onChange={e => {
                                e.stopPropagation();
                                handleSelectVehicle(vehicle.idVehiculo);
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
                                  handleOpenProfile(vehicle);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex items-center justify-center w-12 h-12 shrink-0">
                                  {vehicle.image &&
                                  !vehicle.image.includes('alaskan.png') ? (
                                    <img
                                      src={vehicle.image}
                                      alt={vehicle.name}
                                      className="rounded-lg w-12 h-12 object-cover shadow-lg"
                                      onError={e => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML =
                                          '<div class="w-12 h-12 rounded-lg bg-surface flex items-center justify-center shadow-lg border border-border"><span class="material-symbols-outlined text-secondary">directions_car</span></div>';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center shadow-lg border border-border">
                                      <md-icon className="text-secondary">
                                        directions_car
                                      </md-icon>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-h5 font-bold text-primary truncate group-hover:text-primary/80 transition-colors">
                                    {vehicle.name}
                                  </h3>
                                  <div className="flex items-center gap-1 text-body2">
                                    <span className="text-secondary truncate text-xs">
                                      {vehicle.plate}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`btn font-medium btn-sm flex items-center shrink-0 ${
                                  vehicle.status === 'Activo'
                                    ? 'btn-green'
                                    : 'btn-red'
                                }`}
                              >
                                {vehicle.status === 'Activo'
                                  ? 'Activo'
                                  : 'Inactivo'}
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
                                  handleOpenProfile(vehicle);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center shrink-0">
                                  <md-icon className="text-base text-primary">
                                    airline_seat_recline_normal
                                  </md-icon>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-xs text-secondary">
                                    Capacidad
                                  </span>
                                  <span className="text-sm font-semibold text-primary truncate">
                                    {vehicle.capacity}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center shrink-0">
                                  <md-icon className="text-base text-primary">
                                    calendar_today
                                  </md-icon>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-xs text-secondary">
                                    Modelo
                                  </span>
                                  <span className="text-sm font-semibold text-primary truncate">
                                    {vehicle.model}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-auto action-buttons">
                              <button
                                className={`btn btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95 ${
                                  vehicle.status === 'Activo'
                                    ? 'btn-outline'
                                    : 'btn-secondary'
                                }`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSwitchClick(vehicle);
                                }}
                                title={
                                  vehicle.status === 'Activo'
                                    ? 'Deshabilitar vehículo'
                                    : 'Habilitar vehículo'
                                }
                              >
                                <md-icon className="text-sm">
                                  {vehicle.status === 'Activo'
                                    ? 'block'
                                    : 'check'}
                                </md-icon>
                              </button>

                              <button
                                className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleOpenEdit(vehicle);
                                }}
                                title="Editar vehículo"
                              >
                                <md-icon className="text-sm">edit</md-icon>
                              </button>

                              <button
                                className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95 hover:bg-red-500/20 hover:text-red-500"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteClick(vehicle);
                                }}
                                title="Eliminar vehículo"
                              >
                                <md-icon className="text-sm">delete</md-icon>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface border border-border shrink-0">
                                <img
                                  src={vehicle.image}
                                  alt={vehicle.name}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML =
                                      '<div class="w-full h-full flex items-center justify-center bg-fill text-secondary"><md-icon style="font-size: 24px;">broken_image</md-icon></div>';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-h5 font-bold text-primary truncate">
                                    {vehicle.name}
                                  </h3>
                                  <span className="text-body2 text-secondary truncate border-l border-border pl-2">
                                    {vehicle.plate}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`btn font-medium btn-sm flex items-center ${
                                      vehicle.status === 'Activo'
                                        ? 'btn-green'
                                        : 'btn-red'
                                    }`}
                                  >
                                    {vehicle.status === 'Activo'
                                      ? 'Activo'
                                      : 'Inactivo'}
                                  </span>
                                  <div className="flex items-center gap-1 text-xs text-secondary bg-fill px-2 py-1 rounded-md">
                                    <md-icon className="text-sm">
                                      airline_seat_recline_normal
                                    </md-icon>
                                    <span>{vehicle.capacity}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-secondary bg-fill px-2 py-1 rounded-md">
                                    <md-icon className="text-sm">
                                      calendar_today
                                    </md-icon>
                                    <span>{vehicle.model}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 items-center ml-4">
                              <button
                                className={`btn btn-lg font-medium flex items-center gap-1 ${
                                  vehicle.status === 'Activo'
                                    ? 'btn-outline'
                                    : 'btn-secondary'
                                }`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSwitchClick(vehicle);
                                }}
                              >
                                {vehicle.status === 'Activo'
                                  ? 'Deshabilitar'
                                  : 'Habilitar'}
                              </button>

                              <button
                                className="btn btn-primary btn-lg font-medium flex items-center gap-1"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleOpenEdit(vehicle);
                                }}
                              >
                                <md-icon className="text-sm">edit</md-icon>
                                Editar
                              </button>

                              <button
                                className="btn btn-secondary btn-lg font-medium flex items-center gap-1"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteClick(vehicle);
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
          <VehiculoProfile
            vehicle={selectedVehicle}
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
            onEdit={v => {
              setVehicleToEdit(v.raw || v);
              setIsEditOpen(true);
            }}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="vehículo"
          itemName={vehicleToDelete?.name}
        />

        <DeleteModal
          isOpen={isDeleteMultipleModalOpen}
          onClose={() => setIsDeleteMultipleModalOpen(false)}
          onConfirm={handleDeleteMultipleConfirm}
          itemType="vehículos"
          isPlural={true}
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
          onConfirm={() => {}}
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
    </>
  );
};

export default VehiculosPage;
