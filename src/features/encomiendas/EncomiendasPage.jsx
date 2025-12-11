import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/linear-progress.js';
import '@material/web/switch/switch.js';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import { useState } from 'react';
import EncomiendaProfile from './pages/EncomiendasProfile';
import Avvvatars from 'avvvatars-react';

const EncomiendasPage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedEncomienda, setSelectedEncomienda] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [encomiendaToDelete, setEncomiendaToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [encomiendaToSwitch, setEncomiendaToSwitch] = useState(null);
  const loading = false;
  const searchTerm = '';
  const statusFilter = 'Todos';
  const allEncomiendas = [
    {
      codigo: 'ENC-001',
      destinatario: 'Diomedes Diaz',
      estado: 'Entregada',
      origen: 'Medellín',
      destino: 'Quibdó',
      peso: '5kg',
    },
    {
      codigo: 'ENC-001',
      destinatario: 'Diomedes Diaz',
      estado: 'Entregada',
      origen: 'Medellín',
      destino: 'Quibdó',
      peso: '5kg',
    },
    {
      codigo: 'ENC-001',
      destinatario: 'Diomedes Diaz',
      estado: 'Entregada',
      origen: 'Medellín',
      destino: 'Quibdó',
      peso: '5kg',
    },
    {
      codigo: 'ENC-001',
      destinatario: 'Diomedes Diaz',
      estado: 'Entregada',
      origen: 'Medellín',
      destino: 'Quibdó',
      peso: '5kg',
    },
    {
      codigo: 'ENC-001',
      destinatario: 'Diomedes Diaz',
      estado: 'Entregada',
      origen: 'Medellín',
      destino: 'Quibdó',
      peso: '5kg',
    },
  ];

  const handleOpenProfile = encomienda => {
    setSelectedEncomienda(encomienda);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedEncomienda(null);
  };

  const handleDeleteClick = encomienda => {
    setEncomiendaToDelete(encomienda);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    setEncomiendaToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setEncomiendaToDelete(null);
  };

  const handleSwitchClick = encomienda => {
    setEncomiendaToSwitch(encomienda);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = () => {
    setIsSwitchModalOpen(false);
    setEncomiendaToSwitch(null);
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setEncomiendaToSwitch(null);
  };

  const {
    currentPage,
    totalPages,
    currentData: currentEncomiendas,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(allEncomiendas, 4);

  return (
    <section>
      {!isProfileOpen ? (
        <>
          <div className="list-enter">
            <div className="flex justify-between items-center">
              <h1 className="h4 font-medium">Encomiendas</h1>
              <div className="flex gap-2">
                <div>
                  <md-filled-button className="btn-search-minimal px-6 py-2">
                    <md-icon slot="icon" className="text-sm text-secondary">
                      search
                    </md-icon>
                    Buscar
                  </md-filled-button>
                </div>
                <div>
                  <md-filled-button className="btn-add px-5">
                    <md-icon slot="icon" className="text-sm text-on-primary">
                      add
                    </md-icon>
                    Asignar encomienda
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
                  <span className="subtitle2 font-light">Entregado</span>
                  <h2 className="h4 text-primary font-bold">
                    {
                      allEncomiendas.filter(e => e.estado === 'Entregada')
                        .length
                    }
                  </h2>
                </div>
              </div>
              <div className="content-box-outline-3-small">
                <div className="flex flex-col">
                  <span className="subtitle2 font-light">En transito</span>
                  <h2 className="h4 text-primary font-bold">
                    {
                      allEncomiendas.filter(e => e.estado === 'En transito')
                        .length
                    }
                  </h2>
                </div>
              </div>
              <div className="content-box-outline-3-small">
                <div className="flex flex-col">
                  <span className="subtitle2 font-light">Por enviar</span>
                  <h2 className="h4 text-primary font-bold">
                    {
                      allEncomiendas.filter(e => e.estado === 'Por enviar')
                        .length
                    }
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <div className="select-wrapper">
                <md-icon className="text-sm">arrow_drop_down</md-icon>
                <select name="Estado" id="" className="select-filter">
                  <option value="Todos">Estado: Todos</option>
                  <option value="Activos">Estado: Activos</option>
                  <option value="Inactivos">Estado: Inactivos</option>
                </select>
              </div>
              <div className="select-wrapper">
                <md-icon className="text-sm">arrow_drop_down</md-icon>
                <select name="Estado" id="" className="select-filter">
                  <option value="Nombre">Ordenar por: Nombre</option>
                  <option value="Apellido">Ordenar por: Apellido</option>
                </select>
              </div>
              <div className="select-wrapper">
                <md-icon className="text-sm">arrow_drop_down</md-icon>
                <select name="Estado" id="" className="select-filter">
                  <option value="Ascendente">Orden: Ascendente</option>
                  <option value="Descendente">Orden: Descendente</option>
                </select>
              </div>
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
                  <span className="text-sm text-secondary">
                    Mostrando {startIndex + 1}-
                    {Math.min(startIndex + 4, totalItems)} de {totalItems}{' '}
                    encomiendas
                  </span>
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
                      local_shipping
                    </md-icon>
                    <span className="text-secondary">
                      Cargando encomiendas...
                    </span>
                    <md-linear-progress indeterminate></md-linear-progress>
                  </div>
                </div>
              ) : currentEncomiendas.length === 0 ? (
                <div
                  className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                  style={{ height: 'calc(60vh - 0px)' }}
                >
                  <div
                    className="flex flex-col items-center justify-center"
                    style={{ width: '340px' }}
                  >
                    <md-icon className="text-secondary mb-4">
                      local_shipping
                    </md-icon>
                    <p className="text-secondary">
                      {searchTerm || statusFilter !== 'Todos'
                        ? 'No se encontraron encomiendas que coincidan con los filtros'
                        : 'No hay encomiendas registradas'}
                    </p>
                  </div>
                </div>
              ) : viewMode === 'list' ? (
                currentEncomiendas.map((encomienda, index) => (
                  <div
                    key={index}
                    className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3 ${
                      encomienda.estado !== 'Entregada' ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleOpenProfile(encomienda)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-16 h-16 shrink-0">
                          <Avvvatars
                            value={encomienda.destinatario}
                            size={64}
                            radius={10}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h1 className="h4 font-bold text-primary truncate">
                            {encomienda.destinatario}
                          </h1>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-body2 text-secondary truncate">
                              20 de Mayo, 4:00AM | Alaskan
                            </span>
                            <div className="flex gap-1 items-center">
                              <span className="text-xs text-secondary">
                                {encomienda.origen} → {encomienda.destino}
                              </span>
                              <span className="text-xs text-secondary ml-2 border-l pl-2 border-border">
                                {encomienda.peso}
                              </span>
                              <button className="btn btn-green font-medium btn-sm flex items-center ml-2">
                                <md-icon slot="edit" className="text-sm">
                                  check
                                </md-icon>
                                {encomienda.estado}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center ml-4">
                        <md-switch
                          icons
                          show-only-selected-icon
                          selected={encomienda.estado === 'Entregada'}
                          onClick={e => {
                            e.stopPropagation();
                            handleSwitchClick(encomienda);
                          }}
                        ></md-switch>
                        <button
                          className="btn btn-primary btn-lg font-medium flex items-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <md-icon className="text-sm">edit</md-icon>
                          Editar
                        </button>
                        <button
                          className="btn btn-secondary btn-lg font-medium flex items-center"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteClick(encomienda);
                          }}
                        >
                          <md-icon className="text-sm">delete</md-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentEncomiendas.map((encomienda, index) => (
                    <div
                      key={index}
                      className={`content-box-outline-4-small cursor-pointer hover:shadow-md transition-shadow relative ${
                        encomienda.estado !== 'Entregada' ? 'opacity-60' : ''
                      }`}
                      onClick={() => handleOpenProfile(encomienda)}
                    >
                      <div className="flex items-start justify-between gap-2 pb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="relative w-12 h-12 shrink-0">
                            <Avvvatars
                              value={encomienda.destinatario}
                              size={48}
                              radius={10}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-h5 font-bold text-primary truncate">
                              {encomienda.destinatario}
                            </h3>
                            <div className="flex items-center gap-1 text-body2">
                              <span className="text-secondary truncate text-xs">
                                {encomienda.origen} - {encomienda.destino}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`btn font-medium btn-sm flex items-center shrink-0 ${
                            encomienda.estado === 'Entregada'
                              ? 'btn-green'
                              : 'btn-yellow'
                          }`}
                        >
                          {encomienda.estado}
                        </span>
                      </div>

                      <div className="mt-3 mb-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <md-icon className="text-sm">location_on</md-icon>
                          <span className="truncate">
                            {encomienda.origen} → {encomienda.destino}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <md-icon className="text-sm">scale</md-icon>
                          <span className="truncate">{encomienda.peso}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <md-icon className="text-sm">directions_car</md-icon>
                          <span className="truncate">Alaskan</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="relative group flex-1">
                          <button
                            className={`btn btn-sm-2 font-medium flex items-center gap-1 w-full justify-center ${
                              encomienda.estado === 'Entregada'
                                ? 'btn-outline'
                                : 'btn-secondary'
                            }`}
                            onClick={e => {
                              e.stopPropagation();
                              handleSwitchClick(encomienda);
                            }}
                          >
                            <md-icon className="text-sm">
                              {encomienda.estado === 'Entregada'
                                ? 'block'
                                : 'check'}
                            </md-icon>
                          </button>
                        </div>
                        <div className="relative group flex-1">
                          <button
                            className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 w-full justify-center"
                            onClick={e => e.stopPropagation()}
                          >
                            <md-icon className="text-sm">edit</md-icon>
                          </button>
                        </div>
                        <div className="relative group flex-1">
                          <button
                            className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 w-full justify-center"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteClick(encomienda);
                            }}
                          >
                            <md-icon className="text-sm">delete</md-icon>
                          </button>
                        </div>
                      </div>
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
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="encomienda"
        itemName={encomiendaToDelete?.codigo}
      />

      <SwitchModal
        isOpen={isSwitchModalOpen}
        onClose={handleSwitchCancel}
        onConfirm={handleSwitchConfirm}
        itemType="encomienda"
        isCurrentlyActive={encomiendaToSwitch?.estado === 'Entregada'}
      />
    </section>
  );
};

export default EncomiendasPage;
