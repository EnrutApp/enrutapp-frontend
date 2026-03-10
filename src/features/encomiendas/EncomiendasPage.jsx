import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import EncomiendaProfile from './pages/EncomiendasProfile';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import AddEncomiendaModal from './components/AddEncomiendaModal';
import EditEncomiendaModal from './components/EditEncomiendaModal';
import { encomiendasService } from './api/encomiendasService';
import { useEffect, useMemo, useState } from 'react';

const STATS_CONFIG = [
  { label: 'Totales',     key: 'total' },
  { label: 'Entregado',   key: 'entregado' },
  { label: 'En tránsito', key: 'transito' },
  { label: 'Por enviar',  key: 'porEnviar' },
];

const EncomiendaCard = ({ enc, viewMode, onOpenProfile, onDeleteClick, onEditClick }) => {
  const origen      = encomiendasService.getOrigen(enc);
  const destino     = encomiendasService.getDestino(enc);
  const estadoColor = encomiendasService.getEstadoColor(enc.estado);

  if (viewMode === 'grid') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-2 pb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-primary truncate">{enc.remitenteNombre}</h3>
            <div className="flex items-center gap-1 text-xs text-secondary mt-0.5">
              <md-icon className="text-xs">arrow_forward</md-icon>
              <span className="truncate">{enc.destinatarioNombre}</span>
            </div>
          </div>
          <span className={`btn btn-sm flex items-center gap-1 shrink-0 ${estadoColor}`}>
            {enc.estado}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {origen  && <span className="btn btn-secondary btn-sm">{origen}</span>}
          {destino && <span className="btn btn-secondary btn-sm">{destino}</span>}
        </div>
        <div className="flex gap-2 mt-auto pt-3 action-buttons">
          <button
            className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95 hover:bg-red-500/20 hover:text-red-500"
            onClick={e => onDeleteClick(e, enc)}
          >
            <md-icon className="text-sm">delete</md-icon>
          </button>
          <button
            className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95"
            onClick={e => { e.stopPropagation(); onEditClick(enc); }}
          >
            <md-icon className="text-sm">edit</md-icon>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-fill border border-border flex items-center justify-center shrink-0">
          <md-icon className="text-base text-secondary">local_shipping</md-icon>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-sm font-semibold text-primary">{enc.remitenteNombre}</span>
            <md-icon className="text-secondary">arrow_right</md-icon>
            <span className="text-sm font-semibold text-primary">{enc.destinatarioNombre}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-1 items-center">
            {origen  && <span className="btn btn-primary btn-sm">{origen}</span>}
            <md-icon className="text-sm text-secondary">Sync_Alt</md-icon>
            {destino && <span className="btn btn-primary btn-sm">{destino}</span>}
            <span className={`btn btn-sm ${estadoColor}`}>{enc.estado}</span>
            {enc.verificado && (
              <span className="btn btn-sm btn-green flex items-center gap-1">
                <md-icon className="text-xs">verified</md-icon>Verificado
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-center shrink-0">
        <button
          className="btn btn-secondary btn-lg flex items-center"
          onClick={e => onDeleteClick(e, enc)}
        >
          <md-icon className="text-sm">delete</md-icon>
        </button>
        <button
          className="btn btn-primary btn-lg font-medium flex items-center gap-1"
          onClick={e => { e.stopPropagation(); onEditClick(enc); }}
        >
          <md-icon className="text-sm">edit</md-icon>
          Editar
        </button>
      </div>
    </div>
  );
};

const EncomiendasPage = () => {
  const [encomiendas, setEncomiendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedEncomienda, setSelectedEncomienda] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [encomiendaToDelete, setEncomiendaToDelete] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [encomiendaToEdit, setEncomiendaToEdit] = useState(null);

  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('remitenteNombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const cargarEncomiendas = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await encomiendasService.getAll();
      setEncomiendas(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Error al cargar encomiendas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEncomiendas();
  }, []);

  useEffect(() => {
    const handleClickOutside = e => {
      if (isSearchOpen && !e.target.closest('.relative')) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const handleOpenProfile = enc => {
    setSelectedEncomienda(enc);
    setIsProfileOpen(true);
  };
  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedEncomienda(null);
  };

  const handleDeleteClick = (e, enc) => {
    e.stopPropagation();
    setEncomiendaToDelete(enc);
    setIsDeleteModalOpen(true);
  };
  const handleDeleteConfirm = async () => {
    try {
      await encomiendasService.delete(encomiendaToDelete?.idEncomienda);
      await cargarEncomiendas();
      if (isProfileOpen) handleCloseProfile();
    } catch {}
    finally {
      setIsDeleteModalOpen(false);
      setEncomiendaToDelete(null);
    }
  };
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setEncomiendaToDelete(null);
  };

  const handleOpenEdit = enc => {
    setEncomiendaToEdit(enc);
    setIsEditOpen(true);
  };
  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEncomiendaToEdit(null);
  };

  const stats = useMemo(() => ({
    total: encomiendas.length,
    entregado: encomiendas.filter(e => e.estado === 'Entregado').length,
    transito: encomiendas.filter(e => e.estado === 'En tránsito').length,
    porEnviar: encomiendas.filter(e => e.estado === 'Por enviar').length,
  }), [encomiendas]);

  const filtered = useMemo(() => {
    let list = encomiendas.filter(enc => {
      if (statusFilter !== 'Todos' && enc.estado !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          enc.remitenteNombre?.toLowerCase().includes(q) ||
          enc.destinatarioNombre?.toLowerCase().includes(q) ||
          enc.guia?.toLowerCase().includes(q)
        );
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      let av = a[sortBy] || '';
      let bv = b[sortBy] || '';
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      if (sortOrder === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

    return list;
  }, [encomiendas, statusFilter, searchQuery, sortBy, sortOrder]);

  const {
    currentPage, totalPages, currentData: currentEncomiendas,
    showPagination, handlePageChange, startIndex, totalItems,
  } = usePagination(filtered, viewMode === 'grid' ? 8 : 4);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full content-box-outline-2-small list-enter" style={{ height: 'calc(100vh - 0px)' }}>
        <div className="flex flex-col items-center justify-center" style={{ width: '340px' }}>
          <md-icon className="text-red mb-4">warning</md-icon>
          <p className="text-primary mb-4">Error: {error}</p>
          <button onClick={cargarEncomiendas} className="btn btn-primary">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <section>
      {!isProfileOpen ? (
        <>
          <div className="list-enter">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="h4 font-medium">Encomiendas</h1>
              <div className="flex gap-2">
                <div className="relative">
                  <md-filled-button
                    className="btn-search-minimal px-6 py-2"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                    Buscar
                  </md-filled-button>
                  {isSearchOpen && (
                    <div
                      className="absolute top-full right-0 mt-2 bg-background border border-border rounded-2xl shadow-xl p-4 z-50"
                      style={{ minWidth: '300px' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <span className="text-lg font-medium text-primary">Buscar encomienda</span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Remitente, destinatario o guía..."
                        className="w-full px-3 py-2 mt-2 bg-fill border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="mt-3 text-xs text-secondary hover:underline">
                          Limpiar búsqueda
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <md-filled-button className="btn-add px-5" onClick={() => setIsAddOpen(true)}>
                  <md-icon slot="icon" className="text-sm text-on-primary">add</md-icon>
                  Asignar Encomienda
                </md-filled-button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex mt-4 gap-2">
              {STATS_CONFIG.map(s => (
                <div key={s.label} className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">{s.label}</span>
                    <h2 className="h4 text-primary font-bold">{stats[s.key]}</h2>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex justify-between gap-2 mt-3">
              <div className="flex gap-2">
                <div className="select-wrapper">
                  <md-icon className="text-sm">arrow_drop_down</md-icon>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-filter">
                    <option value="Todos">Estado: Todos</option>
                    <option value="Pendiente">Estado: Pendiente</option>
                    <option value="Por enviar">Estado: Por enviar</option>
                    <option value="En tránsito">Estado: En tránsito</option>
                    <option value="Entregado">Estado: Entregado</option>
                  </select>
                </div>
                <div className="select-wrapper">
                  <md-icon className="text-sm">arrow_drop_down</md-icon>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="select-filter">
                    <option value="remitenteNombre">Ordenar por: Nombre</option>
                    <option value="estado">Ordenar por: Estado</option>
                    <option value="createdAt">Ordenar por: Fecha</option>
                  </select>
                </div>
                <div className="select-wrapper">
                  <md-icon className="text-sm">arrow_drop_down</md-icon>
                  <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="select-filter">
                    <option value="asc">Orden: Ascendente</option>
                    <option value="desc">Orden: Descendente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Count info + View toggle */}
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
                  {!loading && (
                    <span className="text-sm text-secondary">
                      {totalItems > 0
                        ? `Mostrando ${startIndex + 1}-${Math.min(
                            startIndex + (viewMode === 'grid' ? 8 : 4),
                            totalItems
                          )} de ${totalItems} encomiendas`
                        : ''}
                    </span>
                  )}
                </div>
              </div>
              {showPagination && (
                <span className="text-xs text-secondary">
                  Página {currentPage} de {totalPages}
                </span>
              )}
            </div>

            {/* List */}
            <div className="mt-3">
              {loading ? (
                <div className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small" style={{ height: 'calc(60vh - 0px)' }}>
                  <div className="flex flex-col items-center gap-3" style={{ width: '200px' }}>
                    <md-icon className="text-secondary mb-4">local_shipping</md-icon>
                    <span className="text-secondary">Cargando encomiendas...</span>
                    <md-linear-progress indeterminate></md-linear-progress>
                  </div>
                </div>
              ) : currentEncomiendas.length === 0 ? (
                <div className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small" style={{ height: 'calc(60vh - 0px)' }}>
                  <div className="flex flex-col items-center justify-center" style={{ width: '340px' }}>
                    <md-icon className="text-secondary mb-4">local_shipping</md-icon>
                    <p className="text-secondary">
                      {searchQuery || statusFilter !== 'Todos'
                        ? 'No se encontraron encomiendas con esos filtros'
                        : 'No hay encomiendas registradas'}
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
                  {currentEncomiendas.map((enc, idx) => (
                    <div
                      key={enc.idEncomienda || idx}
                      className="content-box-outline-4-small cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleOpenProfile(enc)}
                    >
                      <EncomiendaCard
                        enc={enc}
                        viewMode={viewMode}
                        onOpenProfile={handleOpenProfile}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleOpenEdit}
                      />
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
        <EncomiendaProfile
          encomienda={selectedEncomienda}
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
          onDelete={(enc) => { setEncomiendaToDelete(enc); setIsDeleteModalOpen(true); }}
          onRefresh={cargarEncomiendas}
          onAddNew={() => { handleCloseProfile(); setIsAddOpen(true); }}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="encomienda"
        itemName={encomiendaToDelete ? `${encomiendaToDelete.remitenteNombre} → ${encomiendaToDelete.destinatarioNombre}` : ''}
      />

      <AddEncomiendaModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={cargarEncomiendas}
      />

      {isEditOpen && (
        <EditEncomiendaModal
          isOpen={isEditOpen}
          onClose={handleCloseEdit}
          encomienda={encomiendaToEdit}
          onUpdated={() => { handleCloseEdit(); cargarEncomiendas(); }}
        />
      )}
    </section>
  );
};

export default EncomiendasPage;
