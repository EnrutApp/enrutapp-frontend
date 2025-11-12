import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/checkbox/checkbox.js';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import { useEffect, useState } from 'react';
import apiClient from '../../shared/services/apiService';
import RutaProfilePage from './pages/RutaProfilePage';
import AddRutaModal from './components/addRutaModal/AddRutaModal';

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

const RutasPage = () => {
  const [rutas, setRutas] = useState([]);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rutaToDelete, setRutaToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [rutaToSwitch, setRutaToSwitch] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rutaToEdit, setRutaToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedRutas, setSelectedRutas] = useState([]);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const fetchRutas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/rutas');
      const data = response?.data?.rutas || response?.data || response || [];
      setRutas(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        error?.message ||
        error?.response?.data?.message ||
        'Error al cargar rutas'
      );
      setRutas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutas();
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

  const handleOpenProfile = async ruta => {
    try {
      const rutaCompleta = await apiClient.get(`/rutas/${ruta.idRuta}`);
      setSelectedRuta(rutaCompleta?.data || rutaCompleta || ruta);
      setIsProfileOpen(true);
    } catch (error) {

      setSelectedRuta(ruta);
      setIsProfileOpen(true);
    }
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedRuta(null);
  };

  const handleDeleteClick = ruta => {
    setRutaToDelete(ruta);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/rutas/${rutaToDelete.idRuta}`);
      setIsDeleteModalOpen(false);
      setRutaToDelete(null);
      fetchRutas();
    } catch (error) {

    }
  };

  const handleToggleEstado = (ruta, e) => {
    e.stopPropagation();
    setRutaToSwitch(ruta);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    try {
      const nuevoEstado =
        rutaToSwitch.estado === 'Activa' ? 'Inactiva' : 'Activa';
      await apiClient.patch(`/rutas/${rutaToSwitch.idRuta}`, {
        estado: nuevoEstado,
      });
      setIsSwitchModalOpen(false);
      setRutaToSwitch(null);
      fetchRutas();
    } catch (error) {

      setIsSwitchModalOpen(false);
      setRutaToSwitch(null);
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedRutas([]);
  };

  const handleSelectAll = () => {
    const currentPageIds = currentRutas.map(r => r.idRuta);
    const allCurrentSelected = currentPageIds.every(id =>
      selectedRutas.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedRutas(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedRutas(prev => {
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

  const handleSelectRuta = rutaId => {
    setSelectedRutas(prev => {
      if (prev.includes(rutaId)) {
        return prev.filter(id => id !== rutaId);
      } else {
        return [...prev, rutaId];
      }
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedRutas.length === 0) return;
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    setIsDeleteMultipleModalOpen(false);

    const deletePromises = selectedRutas.map(async rutaId => {
      try {
        await apiClient.delete(`/rutas/${rutaId}`);
        return { success: true, id: rutaId };
      } catch (err) {

        return { success: false, id: rutaId, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    if (failedCount === 0) {
      alert(`Se eliminaron ${successCount} rutas exitosamente`);
    } else {
      alert(`Se eliminaron ${successCount} rutas. ${failedCount} fallaron`);
    }

    setSelectedRutas([]);
    setIsSelectionMode(false);
    await fetchRutas();
  };

  const handleCancelSelection = () => {
    setSelectedRutas([]);
    setIsSelectionMode(false);
  };

  const filteredRutas = (Array.isArray(rutas) ? rutas : []).filter(ruta => {
    const origen = ruta.origen?.ubicacion?.nombreUbicacion?.toLowerCase() || '';
    const destino =
      ruta.destino?.ubicacion?.nombreUbicacion?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    const matchesSearch = origen.includes(search) || destino.includes(search);

    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activas' && ruta.estado === 'Activa') ||
      (statusFilter === 'Inactivas' && ruta.estado === 'Inactiva');

    return matchesSearch && matchesStatus;
  });

  const sortedRutas = filteredRutas.sort((a, b) => {
    let aValue = '';
    let bValue = '';

    if (sortBy === 'nombre') {
      aValue = (a.origen?.ubicacion?.nombreUbicacion || '').toLowerCase();
      bValue = (b.origen?.ubicacion?.nombreUbicacion || '').toLowerCase();
    } else if (sortBy === 'precio') {
      aValue = Number(a.precioBase) || 0;
      bValue = Number(b.precioBase) || 0;
    } else {
      aValue = (a[sortBy] || '').toString().toLowerCase();
      bValue = (b[sortBy] || '').toString().toLowerCase();
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
    currentData: currentRutas,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(sortedRutas, 4);

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
          <p className="text-primary mb-4">Error al cargar rutas: {error}</p>
          <button onClick={fetchRutas} className="btn btn-primary">
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
                <h1 className="h4 font-medium">Rutas</h1>
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
                            Buscar ruta
                          </span>
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          placeholder="Origen o destino..."
                          className="w-full px-3 py-2 bg-fill border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:border-primary"
                          autoFocus
                        />
                        {searchTerm && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
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
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    <md-icon slot="icon" className="text-sm text-on-primary">
                      add
                    </md-icon>
                    Agregar ruta
                  </md-filled-button>
                </div>
              </div>

              <div className="flex mt-4 gap-2">
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Totales</span>
                    <h2 className="h4 text-primary font-bold">
                      {rutas.length}
                    </h2>
                  </div>
                </div>
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Activas</span>
                    <h2 className="h4 text-primary font-bold">
                      {rutas.filter(r => r.estado === 'Activa').length}
                    </h2>
                  </div>
                </div>
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Inactivas</span>
                    <h2 className="h4 text-primary font-bold">
                      {rutas.filter(r => r.estado === 'Inactiva').length}
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
                      <option value="precio">Ordenar por: Precio</option>
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

                {currentRutas.length > 0 && !isSelectionMode && (
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
                          currentRutas.length > 0 &&
                          currentRutas.every(r =>
                            selectedRutas.includes(r.idRuta)
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
                      disabled={selectedRutas.length === 0}
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
                  {selectedRutas.length > 0 ? (
                    <>
                      <span className="text-sm text-secondary">
                        {selectedRutas.length} Seleccionados
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-secondary">
                      {loading
                        ? 'Cargando rutas...'
                        : `Mostrando ${totalItems > 0 ? startIndex + 1 : 0}-${Math.min(startIndex + 4, totalItems)} de ${totalItems} rutas`}
                    </span>
                  )}
                </div>
                {showPagination && (
                  <span className="text-xs text-secondary">
                    Página {currentPage} de {totalPages}
                  </span>
                )}
              </div>

              <div className="mt-3">
                {currentRutas.length === 0 ? (
                  <div
                    className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                    style={{ height: 'calc(60vh - 0px)' }}
                  >
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{ width: '340px' }}
                    >
                      <md-icon className="text-secondary mb-4">route</md-icon>
                      <p className="text-secondary">
                        {searchTerm || statusFilter !== 'Todos'
                          ? 'No se encontraron rutas que coincidan con los filtros'
                          : 'No hay rutas registradas'}
                      </p>
                    </div>
                  </div>
                ) : (
                  currentRutas.map(ruta => (
                    <div
                      key={ruta.idRuta}
                      className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3 ${ruta.estado !== 'Activa' ? 'opacity-60' : ''
                        }`}
                      onClick={() => handleOpenProfile(ruta)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {isSelectionMode && (
                            <div
                              style={{
                                animation:
                                  'checkboxAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                transformOrigin: 'center',
                              }}
                            >
                              <md-checkbox
                                checked={selectedRutas.includes(ruta.idRuta)}
                                onChange={e => {
                                  e.stopPropagation();
                                  handleSelectRuta(ruta.idRuta);
                                }}
                                onClick={e => e.stopPropagation()}
                                touch-target="wrapper"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 relative">
                              <h1 className="h4 font-bold truncate max-w-[200px]">
                                {ruta.origen?.ubicacion?.nombreUbicacion ||
                                  'Sin origen'}
                              </h1>
                              <md-icon className="text-xl text-secondary flex-shrink-0">
                                arrow_right
                              </md-icon>
                              {ruta.paradas && ruta.paradas.length > 0 ? (
                                <>
                                  {ruta.paradas
                                    .sort(
                                      (a, b) => (a.orden || 0) - (b.orden || 0)
                                    )
                                    .slice(0, 2)
                                    .map((parada, index) => (
                                      <div
                                        key={parada.idParada || index}
                                        className="flex items-center gap-2 flex-shrink-0"
                                      >
                                        <span className="h4 font-bold truncate max-w-[150px]">
                                          {parada.ubicacion?.nombreUbicacion ||
                                            'Sin nombre'}
                                        </span>
                                        <md-icon className="text-xl text-secondary">
                                          arrow_right
                                        </md-icon>
                                      </div>
                                    ))}
                                  {ruta.paradas.length > 2 && (
                                    <div className="flex items-center gap-2 flex-shrink-0 relative group">
                                      <span className="btn btn-secondary btn-sm font-medium cursor-help">
                                        +{ruta.paradas.length - 2} más
                                      </span>
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                        <div className="bg-background border border-border rounded-lg shadow-2xl p-3 w-max max-w-xs">
                                          <p className="text-xs font-medium text-secondary mb-2">
                                            Paradas restantes:
                                          </p>
                                          <div className="flex flex-col gap-1">
                                            {ruta.paradas
                                              .sort(
                                                (a, b) =>
                                                  (a.orden || 0) -
                                                  (b.orden || 0)
                                              )
                                              .slice(2)
                                              .map((parada, index) => (
                                                <div
                                                  key={parada.idParada || index}
                                                  className="flex items-center gap-2"
                                                >
                                                  <span className="text-xs font-medium text-secondary bg-primary/20 px-2 py-1 rounded">
                                                    {parada.orden || index + 3}
                                                  </span>
                                                  <span className="text-xs text-primary">
                                                    {parada.ubicacion
                                                      ?.nombreUbicacion ||
                                                      'Sin nombre'}
                                                  </span>
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                          <div className="w-2 h-2 bg-surface border-b border-r border-border transform rotate-45"></div>
                                        </div>
                                      </div>
                                      <md-icon className="text-xl text-secondary">
                                        arrow_right
                                      </md-icon>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <></>
                              )}
                              <h1 className="h4 font-bold truncate max-w-[200px] flex-shrink-0">
                                {ruta.destino?.ubicacion?.nombreUbicacion ||
                                  'Sin destino'}
                              </h1>
                            </div>
                            <div className="flex gap-2 mt-2 items-center">
                              <span
                                className={`btn font-medium btn-lg flex items-center ${ruta.estado === 'Activa' ? 'btn-green' : 'btn-red'}`}
                              >
                                {ruta.estado}
                              </span>
                              <span className="btn btn-primary font-medium btn-lg flex items-center">
                                $
                                {Number(ruta.precioBase)?.toLocaleString(
                                  'es-CO'
                                ) || '0'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center flex-shrink-0">
                          <button
                            className={`btn btn-lg font-medium flex items-center gap-1 ${ruta.estado === 'Activa' ? 'btn-outline' : 'btn-secondary'}`}
                            onClick={e => handleToggleEstado(ruta, e)}
                          >
                            {ruta.estado === 'Activa'
                              ? 'Deshabilitar'
                              : 'Habilitar'}
                          </button>

                          <button
                            className="btn btn-primary btn-lg font-medium flex items-center gap-1"
                            onClick={async e => {
                              e.stopPropagation();
                              try {
                                const rutaCompleta = await apiClient.get(
                                  `/rutas/${ruta.idRuta}`
                                );
                                setRutaToEdit(
                                  rutaCompleta?.data || rutaCompleta || ruta
                                );
                                setIsAddModalOpen(true);
                              } catch (error) {

                                setRutaToEdit(ruta);
                                setIsAddModalOpen(true);
                              }
                            }}
                          >
                            <md-icon className="text-sm">edit</md-icon>
                            Editar
                          </button>

                          <button
                            className="btn btn-secondary btn-lg font-medium flex items-center gap-1"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteClick(ruta);
                            }}
                          >
                            <md-icon className="text-sm">delete</md-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {showPagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showPagination={showPagination}
              />
            )}
          </>
        ) : (
          <RutaProfilePage
            ruta={selectedRuta}
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
            onDeleted={fetchRutas}
            onEdit={async ruta => {
              try {
                const rutaCompleta = await apiClient.get(
                  `/rutas/${ruta.idRuta}`
                );
                setRutaToEdit(rutaCompleta?.data || rutaCompleta || ruta);
                setIsAddModalOpen(true);
              } catch (error) {

                setRutaToEdit(ruta);
                setIsAddModalOpen(true);
              }
            }}
            onAdd={() => {
              handleCloseProfile();
              setRutaToEdit(null);
              setIsAddModalOpen(true);
            }}
          />
        )}

        <AddRutaModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setRutaToEdit(null);
          }}
          onConfirm={() => {
            fetchRutas();
            setRutaToEdit(null);
          }}
          itemData={rutaToEdit}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemType="ruta"
          itemName={`${rutaToDelete?.origen?.ubicacion?.nombreUbicacion || ''} - ${rutaToDelete?.destino?.ubicacion?.nombreUbicacion || ''}`}
        />

        <DeleteModal
          isOpen={isDeleteMultipleModalOpen}
          onClose={() => setIsDeleteMultipleModalOpen(false)}
          onConfirm={handleDeleteMultipleConfirm}
          itemType="rutas"
          isPlural={true}
        />

        <SwitchModal
          isOpen={isSwitchModalOpen}
          onClose={() => setIsSwitchModalOpen(false)}
          onConfirm={handleSwitchConfirm}
          itemType="ruta"
          isCurrentlyActive={rutaToSwitch?.estado === 'Activa'}
        />
      </section>
    </>
  );
};

export default RutasPage;
