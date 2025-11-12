import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import ReservasProfile from './pages/ReservasProfile';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import { useState } from 'react';

const ReservasPage = () => {
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

            <div className="flex justify-between items-center mt-6 mb-4">
              <span className="text-sm text-secondary">
                Mostrando {startIndex + 1}-
                {Math.min(startIndex + 3, totalItems)} de {totalItems} reservas
              </span>
              {showPagination && (
                <span className="text-xs text-secondary">
                  Página {currentPage} de {totalPages}
                </span>
              )}
            </div>

            <div className="mt-3">
              {currentReservas.map((reserva, index) => (
                <div
                  key={index}
                  className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors ${index > 0 ? 'mt-2' : ''} ${reserva.estado !== 'Completado' ? 'opacity-60' : ''}`}
                  onClick={() => handleOpenProfile(reserva)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex flex-col">
                        <span>
                          {reserva.fecha}, {reserva.hora} | {reserva.vehiculo}
                        </span>
                        <h1 className="h4">{reserva.pasajero}</h1>
                      </div>
                      <div className="flex gap-1">
                        <button className="btn btn-primary font-medium btn-sm-2 flex items-center">
                          <md-icon slot="edit" className="text-sm">
                            swap_horiz
                          </md-icon>
                        </button>
                        <button className="btn btn-secondary font-medium btn-lg flex items-center">
                          {reserva.origen}
                        </button>
                        <button className="btn btn-secondary font-medium btn-lg flex items-center">
                          {reserva.destino}
                        </button>
                        <button
                          className={`btn font-medium btn-lg flex items-center ${reserva.estado === 'Pendiente' ? 'btn-yellow' : reserva.estado === 'Completado' ? 'btn-green' : 'btn-secondary'}`}
                        >
                          <md-icon slot="edit" className="text-lg">
                            error
                          </md-icon>
                          {reserva.estado}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <md-switch
                        icons
                        show-only-selected-icon
                        selected={reserva.estado === 'Completado'}
                        onClick={e => {
                          e.stopPropagation();
                          handleSwitchClick(reserva);
                        }}
                      ></md-switch>
                      <button
                        className="btn btn-secondary btn-lg font-medium flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteClick(reserva);
                        }}
                      >
                        <md-icon className="text-sm">delete</md-icon>
                      </button>
                      <button
                        className="btn btn-primary btn-lg font-medium flex items-center"
                        onClick={e => e.stopPropagation()}
                      >
                        <md-icon className="text-sm">edit</md-icon>
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
