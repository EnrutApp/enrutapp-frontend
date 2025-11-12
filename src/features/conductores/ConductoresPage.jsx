import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import ConductorProfile from './pages/ConductoresProfile';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import { useState } from 'react';

const ConductoresPage = () => {
  const [selectedConductor, setSelectedConductor] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [conductorToDelete, setConductorToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [conductorToSwitch, setConductorToSwitch] = useState(null);
  const allConductores = [
    {
      nombre: 'Diomedes Diaz',
      estado: 'Activo',
      licencia: '123456789',
      telefono: '+57 300 123 4567',
      correo: 'diomedes@email.com',
      direccion: 'Calle 123 #45-67, Valledupar',
    },
    {
      nombre: 'Diomedes Diaz',
      estado: 'Activo',
      licencia: '123456789',
      telefono: '+57 300 123 4567',
      correo: 'diomedes@email.com',
      direccion: 'Calle 123 #45-67, Valledupar',
    },
    {
      nombre: 'Diomedes Diaz',
      estado: 'Activo',
      licencia: '123456789',
      telefono: '+57 300 123 4567',
      correo: 'diomedes@email.com',
      direccion: 'Calle 123 #45-67, Valledupar',
    },
    {
      nombre: 'Diomedes Diaz',
      estado: 'Activo',
      licencia: '123456789',
      telefono: '+57 300 123 4567',
      correo: 'diomedes@email.com',
      direccion: 'Calle 123 #45-67, Valledupar',
    },
    {
      nombre: 'Diomedes Diaz',
      estado: 'Activo',
      licencia: '123456789',
      telefono: '+57 300 123 4567',
      correo: 'diomedes@email.com',
      direccion: 'Calle 123 #45-67, Valledupar',
    },
    {
      nombre: 'Diomedes Diaz',
      estado: 'Activo',
      licencia: '123456789',
      telefono: '+57 300 123 4567',
      correo: 'diomedes@email.com',
      direccion: 'Calle 123 #45-67, Valledupar',
    },
  ];

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

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    setConductorToDelete(null);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setConductorToDelete(null);
  };

  const handleSwitchClick = conductor => {
    setConductorToSwitch(conductor);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = () => {
    setIsSwitchModalOpen(false);
    setConductorToSwitch(null);
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setConductorToSwitch(null);
  };

  const {
    currentPage,
    totalPages,
    currentData: currentCondutores,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(allConductores, 4);

  return (
    <section>
      {!isProfileOpen ? (
        <>
          <div className="list-enter">
            <div className="flex justify-between items-center">
              <h1 className="h4 font-medium">Conductores</h1>
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
                    {allConductores.filter(c => c.estado === 'Activo').length}
                  </h2>
                </div>
              </div>
              <div className="content-box-outline-3-small">
                <div className="flex flex-col">
                  <span className="subtitle2 font-light">Inactivos</span>
                  <h2 className="h4 text-primary font-bold">
                    {allConductores.filter(c => c.estado === 'Inactivo').length}
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

            <div className="flex justify-between items-center mt-6 mb-4">
              <span className="text-sm text-secondary">
                Mostrando {startIndex + 1}-
                {Math.min(startIndex + 4, totalItems)} de {totalItems}{' '}
                conductores
              </span>
              {showPagination && (
                <span className="text-xs text-secondary">
                  Página {currentPage} de {totalPages}
                </span>
              )}
            </div>

            <div className="mt-3">
              {currentCondutores.map((conductor, index) => (
                <div
                  key={index}
                  className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3 ${conductor.estado === 'Inactivo' ? 'opacity-60' : ''}`}
                  onClick={() => handleOpenProfile(conductor)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="h4">{conductor.nombre}</h1>
                      <div className="flex gap-1">
                        <button
                          className={`btn btn-lg font-medium flex items-center ${conductor.estado === 'Activo' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                          {conductor.estado}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <md-switch
                        icons
                        show-only-selected-icon
                        selected={conductor.estado === 'Activo'}
                        onClick={e => {
                          e.stopPropagation();
                          handleSwitchClick(conductor);
                        }}
                      ></md-switch>
                      <button
                        className="btn btn-secondary btn-lg font-medium flex items-center"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteClick(conductor);
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
        <ConductorProfile
          conductor={selectedConductor}
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
        />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="conductor"
        itemName={conductorToDelete?.nombre}
      />

      <SwitchModal
        isOpen={isSwitchModalOpen}
        onClose={handleSwitchCancel}
        onConfirm={handleSwitchConfirm}
        itemType="conductor"
        itemName={conductorToSwitch?.nombre}
        isCurrentlyActive={conductorToSwitch?.estado === 'Activo'}
      />
    </section>
  );
};

export default ConductoresPage;
