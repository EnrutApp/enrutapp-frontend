import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import contratosService from './api/contratosService';
import { ROUTES } from '../../routes';

const ContratosPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it => {
      const placa = (it?.placa || it?.vehiculo?.placa || '').toLowerCase();
      const titular = (it?.titularNombre || '').toLowerCase();
      const doc = (it?.titularDocumento || '').toLowerCase();
      const origen = (it?.origen || '').toLowerCase();
      const destino = (it?.destino || '').toLowerCase();
      return (
        placa.includes(q) ||
        titular.includes(q) ||
        doc.includes(q) ||
        origen.includes(q) ||
        destino.includes(q)
      );
    });
  }, [items, searchQuery]);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await contratosService.list();
      const data = Array.isArray(resp) ? resp : resp?.data || [];
      setItems(data);
    } catch (e) {
      console.error('Error cargando contratos:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDownload = async contrato => {
    try {
      const blob = await contratosService.downloadPdf(contrato.idContrato);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contrato.idContrato}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error descargando PDF:', e);
      alert('No se pudo descargar el PDF del contrato');
    }
  };

  const handleView = (e, contrato) => {
    if (e) e.stopPropagation();
    navigate(
      ROUTES.ADMIN.CONTRATOS_DETALLE.replace(':idContrato', contrato.idContrato)
    );
  };

  const getPlaca = it => it?.placa || it?.vehiculo?.placa || '-';
  const getFecha = it =>
    it?.fechaContrato
      ? new Date(it.fechaContrato).toLocaleDateString('es-ES')
      : '-';

  return (
    <section>
      <div className="list-enter">
        <div className="flex justify-between items-center">
          <h1 className="h4 font-medium">Contratos</h1>
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
                      Buscar contrato
                    </span>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Placa, titular, documento, origen o destino..."
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
                onClick={() => navigate(ROUTES.ADMIN.CONTRATOS_NUEVO)}
              >
                <md-icon slot="icon" className="text-sm text-on-primary">
                  assignment_add
                </md-icon>
                Agregar un contrato
              </md-filled-button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          {loading ? (
            <div
              className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
              style={{ height: 'calc(88vh - 0px)' }}
            >
              <div
                className="flex flex-col items-center gap-3"
                style={{ width: '200px' }}
              >
                <md-icon className="text-secondary mb-4">description</md-icon>
                <span className="text-secondary">Cargando contratos...</span>
                <md-linear-progress indeterminate></md-linear-progress>
              </div>
            </div>
          ) : (
            <div className="content-box-outline-2-small p-3">
              {filteredItems.length === 0 ? (
                <div
                  className="flex items-center justify-center w-full list-enter text-center"
                  style={{ height: 'calc(80vh - 0px)' }}
                >
                  <div
                    className="flex flex-col items-center justify-center"
                    style={{ width: '340px' }}
                  >
                    <md-icon className="text-secondary mb-4">files</md-icon>
                    <p className="text-secondary">
                      {searchQuery
                        ? 'No se encontraron contratos que coincidan con la búsqueda'
                        : 'No hay contratos'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 mt-1">
                    <div className="flex gap-1 bg-fill border border-border rounded-full p-1">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-2 py-1 rounded-full transition-all ${viewMode === 'list'
                          ? 'bg-primary text-on-primary'
                          : 'text-secondary hover:text-primary'
                          }`}
                        title="Vista de lista"
                      >
                        <md-icon className="text-sm">view_list</md-icon>
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-2 py-1 rounded-full transition-all ${viewMode === 'grid'
                          ? 'bg-primary text-on-primary'
                          : 'text-secondary hover:text-primary'
                          }`}
                        title="Vista de tarjetas"
                      >
                        <md-icon className="text-sm">grid_view</md-icon>
                      </button>
                    </div>
                    <span className="text-sm text-secondary">
                      {filteredItems.length} contrato{filteredItems.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                        : 'flex flex-col gap-3'
                    }
                  >
                    {filteredItems.map(it => (
                      <div
                        key={it.idContrato}
                        className="content-box-outline-4-small cursor-pointer"
                        onClick={() =>
                          navigate(
                            ROUTES.ADMIN.CONTRATOS_DETALLE.replace(
                              ':idContrato',
                              it.idContrato
                            )
                          )
                        }
                      >
                        {viewMode === 'grid' ? (
                          <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between gap-2 pb-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-lg bg-fill flex items-center justify-center shrink-0">
                                  <md-icon className="text-sm text-primary">
                                    description
                                  </md-icon>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-h5 font-bold text-primary truncate">
                                    {getPlaca(it)}
                                  </h3>
                                  <span className="text-xs text-secondary truncate">
                                    {it.titularNombre || 'Sin titular'}
                                  </span>
                                </div>
                              </div>
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
                                    {getFecha(it)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-fill flex items-center justify-center">
                                  <md-icon className="text-sm text-primary">
                                    alt_route
                                  </md-icon>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] text-secondary">
                                    Ruta
                                  </span>
                                  <span className="text-xs font-semibold text-primary truncate">
                                    {(it.origen || '-') + ' → ' + (it.destino || '-')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-fill flex items-center justify-center">
                                  <md-icon className="text-sm text-primary">
                                    badge
                                  </md-icon>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] text-secondary">
                                    Documento
                                  </span>
                                  <span className="text-xs font-semibold text-primary truncate">
                                    {it.titularDocumento || '-'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-auto">
                              <div className="relative group flex-1">
                                <button
                                  className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 w-full justify-center"
                                  onClick={e => handleView(e, it)}
                                >
                                  <md-icon className="text-sm">visibility</md-icon>
                                </button>
                                <div className="tooltip-smart absolute left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                  <div className="bg-background border border-border rounded-lg shadow-2xl p-2 whitespace-nowrap">
                                    <p className="text-xs text-primary">Ver</p>
                                  </div>
                                </div>
                              </div>

                              <div className="relative group flex-1">
                                <button
                                  className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 w-full justify-center"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDownload(it);
                                  }}
                                >
                                  <md-icon className="text-sm">download</md-icon>
                                </button>
                                <div className="tooltip-smart absolute left-1/2 transform -translate-x-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                  <div className="bg-background border border-border rounded-lg shadow-2xl p-2 whitespace-nowrap">
                                    <p className="text-xs text-primary">Descargar</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-16 h-16 rounded-lg bg-surface shrink-0 flex items-center justify-center">
                                <md-icon className="text-primary">description</md-icon>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-h5 font-bold text-primary truncate">
                                    {getPlaca(it)}
                                  </h3>
                                  <span className="text-body2 text-secondary truncate border-l border-border pl-2">
                                    {it.titularNombre || 'Sin titular'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex items-center gap-1 text-xs text-secondary bg-fill px-2 py-1 rounded-md">
                                    <md-icon className="text-sm">calendar_today</md-icon>
                                    <span>{getFecha(it)}</span>
                                  </div>

                                  <div className="hidden md:flex items-center gap-1 text-xs text-secondary bg-fill px-2 py-1 rounded-md min-w-0">
                                    <md-icon className="text-sm">alt_route</md-icon>
                                    <span className="truncate max-w-[320px]">
                                      {(it.origen || '-') + ' → ' + (it.destino || '-')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 items-center ml-4">
                              <button
                                className="btn btn-primary btn-lg font-medium flex items-center gap-1"
                                onClick={e => handleView(e, it)}
                              >
                                <md-icon className="text-sm">visibility</md-icon>
                                Ver
                              </button>
                              <button
                                className="btn btn-secondary btn-lg font-medium flex items-center gap-1"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDownload(it);
                                }}
                              >
                                <md-icon className="text-sm">download</md-icon>
                                Descargar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContratosPage;
