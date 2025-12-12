import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import ReservasProfile from './pages/ReservasProfile';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import { useState } from 'react';
import Avvvatars from 'avvvatars-react';
import resolveAssetUrl from '../../shared/utils/url';

const ReservasPage = () => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [reservaToSwitch, setReservaToSwitch] = useState(null);
  const allReservas = [
    {
      pasajero: 'Diomedes Diaz',
      origen: 'Medellín',
      destino: 'Quibdó',
      estado: 'Pendiente',
      fecha: '20 de Mayo',
      hora: '4:00 AM',
      vehiculo: 'Alaskan',
    },
    {
      pasajero: 'Diomedes Diaz',
      origen: 'Medellín',
      destino: 'Quibdó',
      estado: 'Pendiente',
      fecha: '20 de Mayo',
      hora: '4:00 AM',
      vehiculo: 'Alaskan',
    },
    {
      pasajero: 'Diomedes Diaz',
      origen: 'Medellín',
      destino: 'Quibdó',
      estado: 'Pendiente',
      fecha: '20 de Mayo',
      hora: '4:00 AM',
      vehiculo: 'Alaskan',
    },
    {
      pasajero: 'Diomedes Diaz',
      origen: 'Medellín',
      destino: 'Quibdó',
      estado: 'Pendiente',
      fecha: '20 de Mayo',
      hora: '4:00 AM',
      vehiculo: 'Alaskan',
    },
  ];

  const handleOpenProfile = reserva => {
    setSelectedReserva(reserva);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedReserva(null);
  };

  const handleDeleteClick = reserva => {
    setReservaToDelete(reserva);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    setReservaToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setReservaToDelete(null);
  };

  const handleSwitchClick = reserva => {
    setReservaToSwitch(reserva);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = () => {
    setIsSwitchModalOpen(false);
    setReservaToSwitch(null);
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setReservaToSwitch(null);
  };

  const {
    currentPage,
    totalPages,
    currentData: currentReservas,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(allReservas, 3);

  return (
    <section>
      {!isProfileOpen ? (
        <>
          <div className="list-enter">
            <div className="flex justify-between items-center">
              <h1 className="h4 font-medium">Reservas</h1>
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
                    Hacer reserva
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
                  <span className="subtitle2 font-light">Pendientes</span>
                  <h2 className="h4 text-primary font-bold">1</h2>
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
                  <h2 className="h4 text-primary font-bold">0</h2>
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
                    {Math.min(startIndex + 3, totalItems)} de {totalItems}{' '}
                    reservas
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
              {viewMode === 'list' ? (
                currentReservas.map((reserva, index) => (
                  <div
                    key={index}
                    className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors ${
                      index > 0 ? 'mt-2' : ''
                    } ${reserva.estado !== 'Completado' ? 'opacity-60' : ''}`}
                    onClick={() => handleOpenProfile(reserva)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-16 h-16 shrink-0">
                          <Avvvatars
                            value={reserva.pasajero}
                            size={64}
                            radius={10}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h1 className="h4 font-bold text-primary truncate">
                            {reserva.pasajero}
                          </h1>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-body2 text-secondary truncate">
                              {reserva.fecha}, {reserva.hora} |{' '}
                              {reserva.vehiculo}
                            </span>
                            <div className="flex gap-1 items-center">
                              <span className="text-xs text-secondary">
                                {reserva.origen} → {reserva.destino}
                              </span>
                              <button
                                className={`btn font-medium btn-sm flex items-center ml-2 ${
                                  reserva.estado === 'Pendiente'
                                    ? 'btn-yellow'
                                    : reserva.estado === 'Completado'
                                      ? 'btn-green'
                                      : 'btn-secondary'
                                }`}
                              >
                                {reserva.estado}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center ml-4">
                        <button
                          className={`btn btn-secondary btn-lg font-medium flex items-center ${
                            reserva.estado === 'Completado' ? 'hidden' : ''
                          }`}
                          onClick={e => {
                            e.stopPropagation();
                            handleSwitchClick(reserva);
                          }}
                        >
                          <md-icon className="text-sm">check</md-icon>
                        </button>
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
                            handleDeleteClick(reserva);
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
                  {currentReservas.map((reserva, index) => (
                    <div
                      key={index}
                      className={`content-box-outline-4-small cursor-pointer hover:shadow-md transition-shadow relative ${
                        reserva.estado !== 'Completado' ? 'opacity-60' : ''
                      }`}
                      onClick={() => handleOpenProfile(reserva)}
                    >
                      <div className="flex items-start justify-between gap-2 pb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="relative w-12 h-12 shrink-0">
                            <Avvvatars
                              value={reserva.pasajero}
                              size={48}
                              radius={10}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-h5 font-bold text-primary truncate">
                              {reserva.pasajero}
                            </h3>
                            <div className="flex items-center gap-1 text-body2">
                              <span className="text-secondary truncate text-xs">
                                {reserva.vehiculo}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`btn font-medium btn-sm flex items-center shrink-0 ${
                            reserva.estado === 'Completado'
                              ? 'btn-green'
                              : 'btn-yellow'
                          }`}
                        >
                          {reserva.estado}
                        </span>
                      </div>
                      <div className="mt-3 mb-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <md-icon className="text-sm">location_on</md-icon>
                          <span className="truncate">
                            {reserva.origen} → {reserva.destino}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary">
                          <md-icon className="text-sm">event</md-icon>
                          <span className="truncate">
                            {reserva.fecha} - {reserva.hora}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative group flex-1">
                          <button
                            className={`btn btn-sm-2 font-medium flex items-center gap-1 w-full justify-center ${
                              reserva.estado === 'Completado'
                                ? 'btn-outline'
                                : 'btn-secondary'
                            }`}
                            onClick={e => {
                              e.stopPropagation();
                              handleSwitchClick(reserva);
                            }}
                          >
                            <md-icon className="text-sm">
                              {reserva.estado === 'Completado'
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
                              handleDeleteClick(reserva);
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
        <ReservasProfile
          reserva={selectedReserva}
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="reserva"
        itemName={reservaToDelete?.pasajero}
      />

      <SwitchModal
        isOpen={isSwitchModalOpen}
        onClose={handleSwitchCancel}
        onConfirm={handleSwitchConfirm}
        itemType="reserva"
        isCurrentlyActive={reservaToSwitch?.estado === 'Completado'}
      />
    </section>
  );
};

export default ReservasPage;
