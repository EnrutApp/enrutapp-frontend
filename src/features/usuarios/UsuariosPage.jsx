import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import UserProfile from './pages/UsuarioProfilePage';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddUserModal from './components/addUserModal/AddUserModal';
import EditUserModal from './components/editUserModal/EditUserModal';
import { useState, useEffect } from 'react';
import userService from './api/userService';
import useApi from '../../shared/hooks/useApi';
import Avvvatars from 'avvvatars-react';

// Estilos para animación de checkbox
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

  // Estados para selección múltiple
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
    setUserToEdit(user);
    setIsEditModalOpen(true);
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

  // Funciones para selección múltiple
  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedUsers([]);
  };

  const handleSelectAll = () => {
    // Excluir usuarios con rol "Administrador"
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

  const {
    currentPage,
    totalPages,
    currentData: currentUsers,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(sortedUsers, 4);

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

              <div className="flex justify-between items-center mt-6 mb-4">
                <div className="flex items-center gap-3">
                  {selectedUsers.length > 0 ? (
                    <span className="text-sm text-secondary">
                      {selectedUsers.length} Seleccionados
                    </span>
                  ) : (
                    <span className="text-sm text-secondary">
                      {isLoading
                        ? 'Cargando usuarios...'
                        : `Mostrando ${startIndex + 1}-${Math.min(startIndex + 6, totalItems)} de ${totalItems} usuarios`}
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
                                checked={selectedUsers.includes(user.idUsuario)}
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
                              src={
                                user.foto.startsWith('http')
                                  ? user.foto
                                  : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${user.foto}`
                              }
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
                          <div className="flex gap-2 mt-2 items-center">
                            <span
                              className={`btn font-medium btn-lg flex items-center ${user.estado ? 'btn-green' : 'btn-red'}`}
                            >
                              {user.estado ? 'Activo' : 'Inactivo'}
                            </span>
                            <button className="btn btn-outline btn-lg font-medium flex items-center">
                              <md-icon className="text-sm">person</md-icon>
                              {user.rol?.nombreRol || 'Sin rol'}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center flex-shrink-0">
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

                {currentUsers.length === 0 && (
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
                )}
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showPagination={showPagination}
            />
            <AddUserModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onConfirm={() => {
                fetchUsers();
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
      </section>
    </>
  );
};

export default UsuariosPage;
