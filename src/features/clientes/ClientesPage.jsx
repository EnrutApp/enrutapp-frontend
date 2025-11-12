import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddUserModal from '../usuarios/components/addUserModal/AddUserModal';
import EditUserModal from '../usuarios/components/editUserModal/EditUserModal';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import ClienteProfile from './pages/ClienteProfile';
import { useEffect, useMemo, useState } from 'react';
import userService from '../usuarios/api/userService';
import Avvvatars from 'avvvatars-react';

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

const ClientesPage = () => {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [clienteToSwitch, setClienteToSwitch] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [selectedClientes, setSelectedClientes] = useState([]);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getClientes();
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];

      const mapped = data.map(u => ({
        idUsuario: u.idUsuario,
        name: u.nombre,
        status: u.estado ? 'Activo' : 'Inactivo',
        estado: !!u.estado,
        document: u.numDocumento,
        phone: u.telefono || '',
        email: u.correo,
        address: u.direccion || '',
        city: u.ciudad?.nombreCiudad || '',
        foto: u.foto || null,
        raw: u,
      }));
      setClientes(mapped);
    } catch (e) {
      setError(e?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchClientes();
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

  const filteredClientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return clientes.filter(c => {
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.document || '').toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'Activos' && c.status === 'Activo') ||
        (statusFilter === 'Inactivos' && c.status === 'Inactivo');
      return matchesSearch && matchesStatus;
    });
  }, [clientes, searchTerm, statusFilter]);

  const sortedClientes = useMemo(() => {
    const arr = [...filteredClientes];
    arr.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
    return arr;
  }, [filteredClientes, sortBy, sortOrder]);

  const {
    currentPage,
    totalPages,
    currentData: currentClients,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(sortedClientes, 4);

  const handleOpenProfile = cliente => {
    setSelectedCliente(cliente);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedCliente(null);
  };

  const handleDeleteClick = cliente => {
    setClienteToDelete(cliente);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(clienteToDelete.idUsuario);
      await fetchClientes();
    } catch (err) {
      
      alert('Error al eliminar el cliente: ' + (err?.message || ''));
    } finally {
      setIsDeleteModalOpen(false);
      setClienteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setClienteToDelete(null);
  };

  const handleSwitchClick = cliente => {
    setClienteToSwitch(cliente);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    try {
      const nuevoEstado = !(
        clienteToSwitch?.estado ?? clienteToSwitch?.status === 'Activo'
      );
      const res = await userService.cambiarEstado(
        clienteToSwitch.idUsuario,
        nuevoEstado
      );
      if (res?.success === false) {
        alert(res?.message || 'No se pudo cambiar el estado del cliente');
      }
      await fetchClientes();
    } catch (err) {
      alert('Error al cambiar el estado del cliente');
    } finally {
      setIsSwitchModalOpen(false);
      setClienteToSwitch(null);
    }
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setClienteToSwitch(null);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedClientes([]);
  };

  const handleSelectAll = () => {
    const currentPageIds = currentClients.map(c => c.idUsuario);
    const allCurrentSelected = currentPageIds.every(id =>
      selectedClientes.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedClientes(prev =>
        prev.filter(id => !currentPageIds.includes(id))
      );
    } else {
      setSelectedClientes(prev => {
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

  const handleSelectCliente = clienteId => {
    setSelectedClientes(prev => {
      if (prev.includes(clienteId)) {
        return prev.filter(id => id !== clienteId);
      } else {
        return [...prev, clienteId];
      }
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedClientes.length === 0) return;
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    setIsDeleteMultipleModalOpen(false);

    const deletePromises = selectedClientes.map(async clienteId => {
      try {
        await userService.deleteUser(clienteId);
        return { success: true, id: clienteId };
      } catch (err) {
        
        return { success: false, id: clienteId, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    if (failedCount === 0) {
      alert(`Se eliminaron ${successCount} clientes exitosamente`);
    } else {
      alert(`Se eliminaron ${successCount} clientes. ${failedCount} fallaron`);
    }

    setSelectedClientes([]);
    setIsSelectionMode(false);
    await fetchClientes();
  };

  const handleCancelSelection = () => {
    setSelectedClientes([]);
    setIsSelectionMode(false);
  };

  return (
    <>
      <style>{styles}</style>
      <section>
        {!isProfileOpen ? (
          <>
            <div>
              <div className="flex justify-between items-center">
                <h1 className="h4 font-medium">Clientes</h1>

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
                            Buscar cliente
                          </span>
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          placeholder="Nombre, correo o documento..."
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
                  <div>
                    <md-filled-button
                      className="btn-add px-5"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      <md-icon slot="icon" className="text-sm text-on-primary">
                        person_add
                      </md-icon>
                      Agregar un cliente
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
                      {
                        clientes.filter(client => client.status === 'Activo')
                          .length
                      }
                    </h2>
                  </div>
                </div>

                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Inactivos</span>
                    <h2 className="h4 text-primary font-bold">
                      {
                        clientes.filter(client => client.status === 'Inactivo')
                          .length
                      }
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
                      <option value="name">Ordenar por: Nombre</option>
                      <option value="email">Ordenar por: Email</option>
                      <option value="document">Ordenar por: Documento</option>
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

                {currentClients.length > 0 && !isSelectionMode && (
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
                          currentClients.length > 0 &&
                          currentClients.every(c =>
                            selectedClientes.includes(c.idUsuario)
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
                      disabled={selectedClientes.length === 0}
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
                  {selectedClientes.length > 0 ? (
                    <>
                      <span className="text-sm text-secondary">
                        {selectedClientes.length} Seleccionados
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-secondary">
                      Mostrando {startIndex + 1}-
                      {Math.min(startIndex + 4, totalItems)} de {totalItems}{' '}
                      clientes
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
                {loading && (
                  <div className="content-box-outline-4-small mb-3">
                    <div className="flex items-center gap-2 p-3">
                      <md-circular-progress
                        indeterminate
                      ></md-circular-progress>
                      <span className="text-secondary">Cargando clientes…</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="content-box-outline-4-small mb-3">
                    <div className="p-3 text-red-600">{error}</div>
                  </div>
                )}
                {!loading && !error && currentClients.length === 0 ? (
                  <div
                    className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                    style={{ height: 'calc(60vh - 0px)' }}
                  >
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{ width: '340px' }}
                    >
                      <md-icon className="text-secondary mb-4">person</md-icon>
                      <p className="text-secondary">
                        {searchTerm || statusFilter !== 'Todos'
                          ? 'No se encontraron clientes que coincidan con los filtros'
                          : 'No hay clientes registrados'}
                      </p>
                    </div>
                  </div>
                ) : (
                  !loading &&
                  !error &&
                  currentClients.map((client, index) => (
                    <div
                      key={index}
                      className={`content-box-outline-4-small ${index > 0 ? 'mt-2' : ''} ${client.status === 'Inactivo' ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={e => {
                        if (e.target.closest('md-switch')) return;
                        handleOpenProfile(client);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {isSelectionMode && (
                            <div
                              style={{
                                animation:
                                  'checkboxAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                transformOrigin: 'center',
                              }}
                            >
                              <md-checkbox
                                checked={selectedClientes.includes(
                                  client.idUsuario
                                )}
                                onChange={e => {
                                  e.stopPropagation();
                                  handleSelectCliente(client.idUsuario);
                                }}
                                onClick={e => e.stopPropagation()}
                                touch-target="wrapper"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-center w-16 h-16">
                            {client?.foto ? (
                              <img
                                src={
                                  client.foto.startsWith('http')
                                    ? client.foto
                                    : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${client.foto}`
                                }
                                alt="Foto cliente"
                                className="rounded-lg w-16 h-16 object-cover shadow-2xl"
                              />
                            ) : (
                              <Avvvatars
                                value={client?.name || 'Cliente'}
                                size={64}
                                radius={11}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="leading-tight">
                              <h1 className="h4 font-bold">{client.name}</h1>
                              <div className="flex gap-2 text-secondary">
                                <span>{client.email}</span>
                                <span>|</span>
                                <span>{client.document}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2 items-center">
                              <button
                                className={`btn font-medium btn-lg flex items-center ${client.status === 'Activo' ? 'btn-primary' : 'btn-secondary'}`}
                              >
                                {client.status}
                              </button>
                              <button className="btn btn-outline btn-lg font-medium flex items-center">
                                <md-icon className="text-sm">
                                  location_on
                                </md-icon>
                                {client.city || 'Sin ciudad'}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            className={`btn btn-lg font-medium flex items-center ${client.status === 'Activo' ? 'btn-outline' : 'btn-secondary'}`}
                            onClick={e => {
                              e.stopPropagation();
                              handleSwitchClick(client);
                            }}
                          >
                            {client.status === 'Activo'
                              ? 'Deshabilitar'
                              : 'Habilitar'}
                          </button>
                          <button
                            className="btn btn-secondary btn-lg font-medium flex items-center"
                            onClick={e => {
                              e.stopPropagation();
                              handleDeleteClick(client);
                            }}
                          >
                            <md-icon className="text-sm">delete</md-icon>
                          </button>

                          <button
                            className="btn btn-primary btn-lg font-medium flex items-center"
                            onClick={e => {
                              e.stopPropagation();
                              setClienteToEdit(client);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <md-icon className="text-sm">edit</md-icon>
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
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
          <ClienteProfile
            cliente={selectedCliente}
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="cliente"
          itemName={clienteToDelete?.name}
        />

        <DeleteModal
          isOpen={isDeleteMultipleModalOpen}
          onClose={() => setIsDeleteMultipleModalOpen(false)}
          onConfirm={handleDeleteMultipleConfirm}
          itemType="clientes"
          isPlural={true}
        />

        <SwitchModal
          isOpen={isSwitchModalOpen}
          onClose={handleSwitchCancel}
          onConfirm={handleSwitchConfirm}
          itemType="cliente"
          itemName={clienteToSwitch?.name}
          isCurrentlyActive={clienteToSwitch?.status === 'Activo'}
        />

        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onConfirm={() => {
            fetchClientes();
            setIsAddModalOpen(false);
          }}
          isClientMode={true}
        />

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setClienteToEdit(null);
          }}
          onConfirm={() => {
            fetchClientes();
            setIsEditModalOpen(false);
            setClienteToEdit(null);
          }}
          itemData={clienteToEdit?.raw ? clienteToEdit.raw : clienteToEdit}
          isClientMode={true}
        />
      </section>
    </>
  );
};

export default ClientesPage;
