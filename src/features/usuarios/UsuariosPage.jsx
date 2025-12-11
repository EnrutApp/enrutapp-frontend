import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/linear-progress.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import UserProfile from './pages/UsuarioProfilePage';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddUserModal from './components/addUserModal/AddUserModal';
import EditUserModal from './components/editUserModal/EditUserModal';
import EditConductorModal from '../conductores/components/editConductorModal/EditConductorModal';
import { useState, useEffect } from 'react';
import userService from './api/userService';
import { conductorService } from '../conductores/api/conductorService';
import useApi from '../../shared/hooks/useApi';
import Avvvatars from 'avvvatars-react';
import resolveAssetUrl from '../../shared/utils/url';

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

const UsuariosPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [userToSwitch, setUserToSwitch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [conductores, setConductores] = useState([]);
  const [isEditConductorModalOpen, setIsEditConductorModalOpen] =
    useState(false);
  const [conductorToEdit, setConductorToEdit] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const {
    data: users,
    isLoading,
    error,
    execute: fetchUsers,
    setData: setUsers,
  } = useApi(userService.getUsers, []);

  useEffect(() => {
    const loadConductores = async () => {
      try {
        const response = await conductorService.getConductores();
        setConductores(response.data || response || []);
      } catch (error) {
        console.error('Error al cargar conductores:', error);
        setConductores([]);
      }
    };

    if (users && users.length > 0) {
      loadConductores();
    }
  }, [users]);

  const filteredUsers = users
    ? users.filter(user => {
        const matchesSearch =
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.numDocumento.includes(searchTerm);

        const matchesStatus =
          statusFilter === 'Todos' ||
          (statusFilter === 'Activos' && user.estado) ||
          (statusFilter === 'Inactivos' && !user.estado);

        return matchesSearch && matchesStatus;
      })
    : [];

  const sortedUsers = filteredUsers.sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';

    if (sortBy === 'rol') {
      aValue = a.rol?.nombreRol || '';
      bValue = b.rol?.nombreRol || '';
    }

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

  useEffect(() => {
    const handleClickOutside = event => {
      if (isSearchOpen && !event.target.closest('.relative')) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const handleOpenProfile = user => {
    setSelectedUser(user);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteClick = user => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(userToDelete.idUsuario);
      setUsers(users.filter(user => user.idUsuario !== userToDelete.idUsuario));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      alert('Error al eliminar el usuario: ' + error.message);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleSwitchClick = user => {
    setUserToSwitch(user);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    try {
      const response = await userService.cambiarEstado(
        userToSwitch.idUsuario,
        !userToSwitch.estado
      );
      if (response.success === false) {
        alert(response.message || 'No se pudo cambiar el estado del usuario');
        setIsSwitchModalOpen(false);
        return;
      }
      fetchUsers();
      setIsSwitchModalOpen(false);
    } catch (error) {
      alert('Error al cambiar el estado del usuario');
      setIsSwitchModalOpen(false);
    }
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setUserToSwitch(null);
  };

  const handleUserUpdated = updatedUser => {
    setUsers(
      users.map(user =>
        user.idUsuario === updatedUser.idUsuario ? updatedUser : user
      )
    );
  };

  const handleEditClick = user => {
    if (user.rol?.nombreRol?.toLowerCase() === 'conductor') {
      const conductor = getConductorByUserId(user.idUsuario);
      if (conductor) {
        setConductorToEdit(conductor);
        setIsEditConductorModalOpen(true);
      } else {
        alert('Este conductor aún no tiene información de licencia registrada');
        setUserToEdit(user);
        setIsEditModalOpen(true);
      }
    } else {
      setUserToEdit(user);
      setIsEditModalOpen(true);
    }
  };

  const handleEditConfirm = updatedUser => {
    handleUserUpdated(updatedUser);
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleEditConductorConfirm = async (idConductor, conductorData) => {
    try {
      await conductorService.updateConductor(idConductor, conductorData);

      await fetchUsers();
      const response = await conductorService.getConductores();
      setConductores(response.data || response || []);
      setIsEditConductorModalOpen(false);
      setConductorToEdit(null);
    } catch (error) {
      console.error('Error al actualizar conductor:', error);
      throw error;
    }
  };

  const handleEditConductorCancel = () => {
    setIsEditConductorModalOpen(false);
    setConductorToEdit(null);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedUsers([]);
  };

  const handleSelectAll = () => {
    const currentPageIds = currentUsers
      .filter(u => u.rol?.nombreRol !== 'Administrador')
      .map(u => u.idUsuario);
    const allCurrentSelected = currentPageIds.every(id =>
      selectedUsers.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedUsers(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedUsers(prev => {
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

  const handleSelectUser = userId => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedUsers.length === 0) return;
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    setIsDeleteMultipleModalOpen(false);

    const deletePromises = selectedUsers.map(async userId => {
      try {
        await userService.deleteUser(userId);
        return { success: true, id: userId };
      } catch (err) {
        return { success: false, id: userId, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    if (failedCount === 0) {
      alert(`Se eliminaron ${successCount} usuarios exitosamente`);
    } else {
      alert(`Se eliminaron ${successCount} usuarios. ${failedCount} fallaron`);
    }

    setSelectedUsers([]);
    setIsSelectionMode(false);
    await fetchUsers();
  };

  const handleCancelSelection = () => {
    setSelectedUsers([]);
    setIsSelectionMode(false);
  };

  const getConductorByUserId = userId => {
    return conductores.find(c => c.usuario?.idUsuario === userId);
  };

  const isLicenciaVencida = fechaVencimiento => {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fechaVencimiento);
    return fechaVenc < hoy;
  };

  const isLicenciaProximaAVencer = fechaVencimiento => {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fechaVencimiento);
    const treintaDias = 30 * 24 * 60 * 60 * 1000;
    const diferencia = fechaVenc - hoy;
    return diferencia > 0 && diferencia <= treintaDias;
  };

  const isInformacionIncompleta = conductor => {
    if (!conductor) return true;
    return (
      !conductor.idCategoriaLicencia || !conductor.fechaVencimientoLicencia
    );
  };

  const itemsPerPage = viewMode === 'grid' ? 8 : 4;
  const {
    currentPage,
    totalPages,
    currentData: currentUsers,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(sortedUsers, itemsPerPage);

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
          <p className="text-primary mb-4">Error al cargar usuarios: {error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">
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
                <h1 className="h4 font-medium">Usuarios</h1>

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
                            Buscar usuario
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
                      Agregar usuarios
                    </md-filled-button>
                  </div>
                </div>
              </div>

              <div className="flex mt-4 gap-2">
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Totales</span>
                    <h2 className="h4 text-primary font-bold">
                      {users?.length || 0}
                    </h2>
                  </div>
                </div>

                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Activos</span>
                    <h2 className="h4 text-primary font-bold">
                      {users?.filter(user => user.estado).length || 0}
                    </h2>
                  </div>
                </div>

                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Inactivos</span>
                    <h2 className="h4 text-primary font-bold">
                      {users?.filter(user => !user.estado).length || 0}
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
                      <option value="nombre">Ordenar por: Nombre</option>
                      <option value="correo">Ordenar por: Email</option>
                      <option value="rol">Ordenar por: Rol</option>
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

                {currentUsers.length > 0 && !isSelectionMode && (
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
                          currentUsers.filter(
                            u => u.rol?.nombreRol !== 'Administrador'
                          ).length > 0 &&
                          currentUsers
                            .filter(u => u.rol?.nombreRol !== 'Administrador')
                            .every(u => selectedUsers.includes(u.idUsuario))
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
                    {selectedUsers.length > 0 ? (
                      <span className="text-sm text-secondary">
                        {selectedUsers.length} Seleccionados
                      </span>
                    ) : (
                      !isLoading && (
                        <span className="text-sm text-secondary">
                          {`Mostrando ${startIndex + 1}-${Math.min(startIndex + (viewMode === 'grid' ? 8 : 4), totalItems)} de ${totalItems} usuarios`}
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
                {viewMode === 'list' ? (
                  <>
                    {currentUsers.map((user, index) => (
                      <div
                        key={user.idUsuario}
                        className={`content-box-outline-4-small ${index > 0 ? 'mt-2' : ''} ${!user.estado ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                        onClick={e => {
                          if (e.target.closest('md-switch')) return;
                          handleOpenProfile(user);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 flex-1">
                            {isSelectionMode &&
                              user.rol?.nombreRol !== 'Administrador' && (
                                <div
                                  style={{
                                    animation:
                                      'checkboxAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                    transformOrigin: 'center',
                                  }}
                                >
                                  <md-checkbox
                                    checked={selectedUsers.includes(
                                      user.idUsuario
                                    )}
                                    onChange={e => {
                                      e.stopPropagation();
                                      handleSelectUser(user.idUsuario);
                                    }}
                                    onClick={e => e.stopPropagation()}
                                    touch-target="wrapper"
                                  />
                                </div>
                              )}
                            <div className="flex items-center justify-center w-16 h-16">
                              {user?.foto ? (
                                <img
                                  src={resolveAssetUrl(user.foto)}
                                  alt="Foto de perfil"
                                  className="rounded-lg w-16 h-16 object-cover shadow-2xl"
                                />
                              ) : (
                                <Avvvatars
                                  value={user?.nombre || 'Usuario'}
                                  size={64}
                                  radius={11}
                                />
                              )}
                            </div>
                            <div>
                              <div className="leading-tight">
                                <h1 className="h4 font-bold">{user.nombre}</h1>
                                <div className="flex gap-2 text-secondary">
                                  <span>{user.correo}</span>
                                  <span>|</span>
                                  <span>{user.numDocumento}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2 items-center flex-wrap">
                                <span
                                  className={`btn font-medium btn-lg flex items-center ${user.estado ? 'btn-green' : 'btn-red'}`}
                                >
                                  {user.estado ? 'Activo' : 'Inactivo'}
                                </span>
                                <button className="btn btn-outline btn-lg font-medium flex items-center">
                                  <md-icon className="text-sm">person</md-icon>
                                  {user.rol?.nombreRol || 'Sin rol'}
                                </button>

                                {user.rol?.nombreRol?.toLowerCase() ===
                                  'conductor' &&
                                  (() => {
                                    const conductor = getConductorByUserId(
                                      user.idUsuario
                                    );
                                    const informacionIncompleta =
                                      isInformacionIncompleta(conductor);
                                    const licenciaVencida =
                                      conductor &&
                                      !informacionIncompleta &&
                                      isLicenciaVencida(
                                        conductor.fechaVencimientoLicencia
                                      );
                                    const licenciaProximaAVencer =
                                      conductor &&
                                      !informacionIncompleta &&
                                      isLicenciaProximaAVencer(
                                        conductor.fechaVencimientoLicencia
                                      );

                                    return (
                                      <>
                                        {conductor?.categoriaLicencia
                                          ?.nombreCategoria && (
                                          <button className="btn btn-outline btn-lg font-medium flex items-center">
                                            <md-icon className="text-sm">
                                              badge
                                            </md-icon>
                                            {
                                              conductor.categoriaLicencia
                                                .nombreCategoria
                                            }
                                          </button>
                                        )}

                                        {informacionIncompleta && (
                                          <button className="btn btn-lg font-medium flex items-center btn-red">
                                            <md-icon className="text-sm">
                                              warning
                                            </md-icon>
                                            <span>Información Incompleta</span>
                                          </button>
                                        )}

                                        {!informacionIncompleta &&
                                          licenciaVencida && (
                                            <button className="btn btn-lg font-medium flex items-center bg-red-100 text-red-700 border border-red-300">
                                              <md-icon className="text-sm">
                                                error
                                              </md-icon>
                                              <span>Licencia Vencida</span>
                                            </button>
                                          )}

                                        {!informacionIncompleta &&
                                          licenciaProximaAVencer && (
                                            <button className="btn btn-lg font-medium flex items-center btn-yellow">
                                              <md-icon className="text-sm">
                                                warning
                                              </md-icon>
                                              <span>Próxima a Vencer</span>
                                            </button>
                                          )}
                                      </>
                                    );
                                  })()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            {user.rol?.nombreRol?.toLowerCase() ===
                            'administrador' ? (
                              <div
                                className="btn btn-secondary btn-lg font-medium flex items-center gap-1 opacity-50 btn-disabled"
                                title="No se puede deshabilitar un administrador"
                              >
                                No se puede deshabilitar
                              </div>
                            ) : (
                              <button
                                className={`btn btn-lg font-medium flex items-center gap-1 ${user.estado ? 'btn-outline' : 'btn-secondary'}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSwitchClick(user);
                                }}
                              >
                                {user.estado ? 'Deshabilitar' : 'Habilitar'}
                              </button>
                            )}

                            <button
                              className="btn btn-primary btn-lg font-medium flex items-center gap-1"
                              onClick={e => {
                                e.stopPropagation();
                                handleEditClick(user);
                              }}
                            >
                              <md-icon className="text-sm">edit</md-icon>
                              Editar
                            </button>

                            {user.rol?.nombreRol?.toLowerCase() ===
                            'administrador' ? (
                              <div
                                className="btn btn-secondary btn-lg font-medium flex items-center gap-1 opacity-50 btn-disabled"
                                title="No se puede eliminar un administrador"
                              >
                                <md-icon className="text-sm">delete</md-icon>
                              </div>
                            ) : (
                              <button
                                className="btn btn-secondary btn-lg font-medium flex items-center gap-1"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteClick(user);
                                }}
                              >
                                <md-icon className="text-sm">delete</md-icon>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pb-[17px]">
                    {currentUsers.map((user, index) => {
                      const isConductor =
                        user.rol?.nombreRol?.toLowerCase() === 'conductor';
                      const conductor = isConductor
                        ? getConductorByUserId(user.idUsuario)
                        : null;
                      const informacionIncompleta = isConductor
                        ? isInformacionIncompleta(conductor)
                        : false;
                      const licenciaVencida =
                        conductor &&
                        !informacionIncompleta &&
                        isLicenciaVencida(conductor.fechaVencimientoLicencia);
                      const licenciaProximaAVencer =
                        conductor &&
                        !informacionIncompleta &&
                        isLicenciaProximaAVencer(
                          conductor.fechaVencimientoLicencia
                        );

                      return (
                        <div
                          key={user.idUsuario}
                          className={`content-box-outline-4-small relative group ${
                            !user.estado ? 'opacity-60' : ''
                          } hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
                        >
                          {isSelectionMode &&
                            user.rol?.nombreRol !== 'Administrador' && (
                              <div
                                className="absolute top-3 left-3 z-10"
                                style={{
                                  animation:
                                    'checkboxAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                  transformOrigin: 'center',
                                }}
                              >
                                <md-checkbox
                                  checked={selectedUsers.includes(
                                    user.idUsuario
                                  )}
                                  onChange={e => {
                                    e.stopPropagation();
                                    handleSelectUser(user.idUsuario);
                                  }}
                                  onClick={e => e.stopPropagation()}
                                  touch-target="wrapper"
                                />
                              </div>
                            )}

                          <div className="flex flex-col h-full">
                            <div
                              className="flex items-start justify-between gap-2 pb-3 cursor-pointer flex-1"
                              onClick={e => {
                                if (
                                  !e.target.closest('button') &&
                                  !e.target.closest('md-checkbox') &&
                                  !e.target.closest('.action-buttons')
                                ) {
                                  handleOpenProfile(user);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex items-center justify-center w-12 h-12 shrink-0">
                                  {user?.foto ? (
                                    <img
                                      src={resolveAssetUrl(user.foto)}
                                      alt="Foto de perfil"
                                      className="rounded-lg w-12 h-12 object-cover shadow-lg"
                                    />
                                  ) : (
                                    <Avvvatars
                                      value={user?.nombre || 'Usuario'}
                                      size={48}
                                      radius={8}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-h5 font-bold text-primary truncate group-hover:text-primary/80 transition-colors">
                                    {user.nombre}
                                  </h3>
                                  <div className="flex items-center gap-1 text-body2">
                                    <span className="text-secondary truncate text-xs">
                                      {user.correo}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`btn font-medium btn-sm flex items-center shrink-0 ${
                                  user.estado ? 'btn-green' : 'btn-red'
                                }`}
                              >
                                {user.estado ? 'Activo' : 'Inactivo'}
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
                                  handleOpenProfile(user);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center shrink-0">
                                  <md-icon className="text-base text-primary">
                                    badge
                                  </md-icon>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-xs text-secondary">
                                    Documento
                                  </span>
                                  <span className="text-sm font-semibold text-primary truncate">
                                    {user.numDocumento}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center shrink-0">
                                  <md-icon className="text-base text-primary">
                                    person
                                  </md-icon>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-xs text-secondary">
                                    Rol
                                  </span>
                                  <span className="text-sm font-semibold text-primary truncate">
                                    {user.rol?.nombreRol || 'Sin rol'}
                                  </span>
                                </div>
                              </div>

                              {isConductor && conductor && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {conductor?.categoriaLicencia
                                    ?.nombreCategoria && (
                                    <span className="btn btn-outline btn-sm font-medium flex items-center text-xs px-2 py-1">
                                      <md-icon className="text-xs">
                                        drive_eta
                                      </md-icon>
                                      {
                                        conductor.categoriaLicencia
                                          .nombreCategoria
                                      }
                                    </span>
                                  )}
                                  {informacionIncompleta && (
                                    <span className="btn btn-sm font-medium flex items-center btn-red text-xs px-2 py-1">
                                      <md-icon className="text-xs">
                                        warning
                                      </md-icon>
                                      Incompleto
                                    </span>
                                  )}
                                  {!informacionIncompleta &&
                                    licenciaVencida && (
                                      <span className="btn btn-sm font-medium flex items-center bg-red-100 text-red-700 border border-red-300 text-xs px-2 py-1">
                                        <md-icon className="text-xs">
                                          error
                                        </md-icon>
                                        Vencida
                                      </span>
                                    )}
                                  {!informacionIncompleta &&
                                    licenciaProximaAVencer && (
                                      <span className="btn btn-sm font-medium flex items-center btn-yellow text-xs px-2 py-1">
                                        <md-icon className="text-xs">
                                          warning
                                        </md-icon>
                                        Próx. Vencer
                                      </span>
                                    )}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 mt-auto action-buttons">
                              {user.rol?.nombreRol?.toLowerCase() ===
                              'administrador' ? (
                                <div
                                  className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 flex-1 opacity-50 btn-disabled justify-center"
                                  title="No se puede deshabilitar un administrador"
                                >
                                  <md-icon className="text-sm">block</md-icon>
                                </div>
                              ) : (
                                <button
                                  className={`btn btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95 ${
                                    user.estado
                                      ? 'btn-outline'
                                      : 'btn-secondary'
                                  }`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSwitchClick(user);
                                  }}
                                  title={
                                    user.estado
                                      ? 'Deshabilitar usuario'
                                      : 'Habilitar usuario'
                                  }
                                >
                                  <md-icon className="text-sm">
                                    {user.estado ? 'block' : 'check'}
                                  </md-icon>
                                </button>
                              )}

                              <button
                                className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleEditClick(user);
                                }}
                                title="Editar usuario"
                              >
                                <md-icon className="text-sm">edit</md-icon>
                              </button>

                              {user.rol?.nombreRol?.toLowerCase() ===
                              'administrador' ? (
                                <div
                                  className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 flex-1 opacity-50 btn-disabled justify-center"
                                  title="No se puede eliminar un administrador"
                                >
                                  <md-icon className="text-sm">delete</md-icon>
                                </div>
                              ) : (
                                <button
                                  className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105 active:scale-95 hover:bg-red-500/20 hover:text-red-500"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteClick(user);
                                  }}
                                  title="Eliminar usuario"
                                >
                                  <md-icon className="text-sm">delete</md-icon>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isLoading ? (
                  <div
                    className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                    style={{ height: 'calc(60vh - 0px)' }}
                  >
                    <div
                      className="flex flex-col items-center gap-3"
                      style={{ width: '200px' }}
                    >
                      <md-icon className="text-secondary mb-4">group</md-icon>
                      <span className="text-secondary">
                        Cargando usuarios...
                      </span>
                      <md-linear-progress indeterminate></md-linear-progress>
                    </div>
                  </div>
                ) : (
                  currentUsers.length === 0 && (
                    <div
                      className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                      style={{ height: 'calc(60vh - 0px)' }}
                    >
                      <div
                        className="flex flex-col items-center justify-center"
                        style={{ width: '340px' }}
                      >
                        <md-icon className="text-secondary mb-4">group</md-icon>
                        <p className="text-secondary">
                          {searchTerm || statusFilter !== 'Todos'
                            ? 'No se encontraron usuarios que coincidan con los filtros'
                            : 'No hay usuarios registrados'}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showPagination={showPagination}
              className={viewMode === 'grid' ? 'mt-2' : 'mt-6'}
            />
            <AddUserModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onConfirm={async () => {
                await fetchUsers();

                try {
                  const response = await conductorService.getConductores();
                  setConductores(response.data || response || []);
                } catch (error) {
                  console.error('Error al recargar conductores:', error);
                }
                setIsAddModalOpen(false);
              }}
            />
          </>
        ) : (
          <UserProfile
            user={selectedUser}
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
            onUserUpdated={handleUserUpdated}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="usuario"
          itemName={userToDelete?.nombre}
        />

        <DeleteModal
          isOpen={isDeleteMultipleModalOpen}
          onClose={() => setIsDeleteMultipleModalOpen(false)}
          onConfirm={handleDeleteMultipleConfirm}
          itemType="usuarios"
          isPlural={true}
          itemName={`${selectedUsers.length} usuarios seleccionados`}
        />

        <SwitchModal
          isOpen={isSwitchModalOpen}
          onClose={handleSwitchCancel}
          onConfirm={handleSwitchConfirm}
          itemType="usuario"
          itemName={userToSwitch?.nombre}
          isCurrentlyActive={userToSwitch?.estado}
        />

        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={handleEditCancel}
          onConfirm={handleEditConfirm}
          itemData={userToEdit}
        />

        <EditConductorModal
          isOpen={isEditConductorModalOpen}
          onClose={handleEditConductorCancel}
          conductor={conductorToEdit}
          onUpdateConductor={handleEditConductorConfirm}
        />
      </section>
    </>
  );
};

export default UsuariosPage;
