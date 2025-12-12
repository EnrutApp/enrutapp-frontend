import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/linear-progress.js';
import RolProfile from './pages/RolProfilePage';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import DeleteWithDependenciesModal from '../../shared/components/modal/deleteModal/DeleteWithDependenciesModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddRoleModal from './components/addRoleModal/AddRoleModal';
import EditRoleModal from './components/editRoleModal/EditRoleModal';
import ManagePermissionsModal from './components/managePermissionsModal/ManagePermissionsModal';
import roleService from './api/roleService';
import { useEffect, useMemo, useState } from 'react';

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

const RolesPage = () => {
  const PROTECTED_ROLES = ['Administrador', 'Conductor', 'Cliente', 'Usuario'];
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedRole, setSelectedRole] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [
    isDeleteWithDependenciesModalOpen,
    setIsDeleteWithDependenciesModalOpen,
  ] = useState(false);
  const [dependenciesList, setDependenciesList] = useState([]);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [roleToSwitch, setRoleToSwitch] = useState(null);

  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [roleToManagePermissions, setRoleToManagePermissions] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] =
    useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await roleService.getRoles();
      if (res.success) {
        const raw = Array.isArray(res.data) ? res.data : [];
        const mapped = raw.map(r => ({
          ...r,
          roleName: r.nombreRol,
          status: r.estado ? 'Activo' : 'Inactivo',
          description: r.descripcion,
          activo: r.estado,
        }));
        setRoles(mapped);
      } else {
        setError(res.error || 'Error al cargar roles');
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
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

  const activeCount = useMemo(
    () => roles.filter(r => r.activo !== false).length,
    [roles]
  );
  const inactiveCount = useMemo(
    () => roles.filter(r => r.activo === false).length,
    [roles]
  );

  const filteredAndSortedRoles = useMemo(() => {
    let filtered = [...roles];

    if (searchQuery) {
      filtered = filtered.filter(
        r =>
          (r.nombreRol || r.roleName || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (r.descripcion || r.description || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'Todos') {
      if (statusFilter === 'Activos') {
        filtered = filtered.filter(r => r.activo !== false);
      } else if (statusFilter === 'Inactivos') {
        filtered = filtered.filter(r => r.activo === false);
      }
    }

    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';

      if (sortBy === 'nombre') {
        aValue = (a.nombreRol || a.roleName || '').toLowerCase();
        bValue = (b.nombreRol || b.roleName || '').toLowerCase();
      } else {
        aValue = (a[sortBy] || '').toString().toLowerCase();
        bValue = (b[sortBy] || '').toString().toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [roles, searchQuery, statusFilter, sortBy, sortOrder]);

  const {
    currentPage,
    totalPages,
    currentData: currentRoles,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(filteredAndSortedRoles, 4);

  const handleOpenProfile = role => {
    if (role.roleName && !role.nombreRol) {
      role = { ...role, nombreRol: role.roleName };
    }
    setSelectedRole(role);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteClick = role => {
    if (PROTECTED_ROLES.includes(role.nombreRol)) return;
    setRoleToDelete(role);

    if (role.usuarios && role.usuarios.length > 0) {
      setDependenciesList(role.usuarios.map(u => u.nombre || u.correo));
      setIsDeleteWithDependenciesModalOpen(true);
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteWithDependenciesConfirm = async () => {
    if (!roleToDelete) return;
    try {
      await roleService.deleteRole(roleToDelete.idRol, true);
      await fetchRoles();
    } catch (err) {
      alert(err?.response?.data?.error || 'Error al eliminar rol');
    } finally {
      setIsDeleteWithDependenciesModalOpen(false);
      setRoleToDelete(null);
      setDependenciesList([]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    try {
      await roleService.deleteRole(roleToDelete.idRol);
      await fetchRoles();
    } catch (err) {
      alert(err?.response?.data?.error || 'Error al eliminar rol');
    } finally {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleDeleteRole = async (role, cascade = false) => {
    if (!role) return;
    try {
      await roleService.deleteRole(role.idRol, cascade);
      await fetchRoles();
      if (selectedRole?.idRol === role.idRol) {
        handleCloseProfile();
      }
    } catch (err) {
      alert(err?.response?.data?.error || 'Error al eliminar rol');
      throw err;
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  const handleSwitchClick = role => {
    setRoleToSwitch(role);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    if (!roleToSwitch) return;
    try {
      await roleService.updateRole(roleToSwitch.idRol, {
        activo: roleToSwitch.activo === false,
      });
      await fetchRoles();
    } catch (err) {
      alert(err?.response?.data?.error || 'Error al cambiar estado');
    } finally {
      setIsSwitchModalOpen(false);
      setRoleToSwitch(null);
    }
  };

  const handleSwitchCancel = () => {
    setIsSwitchModalOpen(false);
    setRoleToSwitch(null);
  };

  const handleAddSuccess = () => {
    fetchRoles();
  };

  const handleOpenEdit = role => {
    setSelectedRole(role);
    setIsEditOpen(true);
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedRoles([]);
  };

  const handleSelectAll = () => {
    const currentPageIds = currentRoles
      .filter(r => !PROTECTED_ROLES.includes(r.nombreRol))
      .map(r => r.idRol);

    const allCurrentSelected = currentPageIds.every(id =>
      selectedRoles.includes(id)
    );

    if (allCurrentSelected) {
      setSelectedRoles(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedRoles(prev => {
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

  const handleSelectRole = roleId => {
    const role = roles.find(r => r.idRol === roleId);
    if (role && PROTECTED_ROLES.includes(role.nombreRol)) return;

    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedRoles.length === 0) return;
    setIsDeleteMultipleModalOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    setIsDeleteMultipleModalOpen(false);

    const deletePromises = selectedRoles.map(async roleId => {
      const role = roles.find(r => r.idRol === roleId);
      if (role && PROTECTED_ROLES.includes(role.nombreRol)) {
        return { success: false, id: roleId, error: 'Rol protegido' };
      }
      try {
        await roleService.deleteRole(roleId);
        return { success: true, id: roleId };
      } catch (err) {
        return { success: false, id: roleId, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    if (failedCount === 0) {
      alert(`Se eliminaron ${successCount} roles exitosamente`);
    } else {
      alert(`Se eliminaron ${successCount} roles. ${failedCount} fallaron`);
    }

    setSelectedRoles([]);
    setIsSelectionMode(false);
    await fetchRoles();
  };

  const handleCancelSelection = () => {
    setSelectedRoles([]);
    setIsSelectionMode(false);
  };

  useEffect(() => {
    setSelectedRoles([]);
    setIsSelectionMode(false);
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

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
          <p className="text-primary mb-4">Error al cargar roles: {error}</p>
          <button onClick={fetchRoles} className="btn btn-primary">
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
            <div>
              <div className="flex justify-between items-center">
                <h1 className="h4 font-medium">Roles</h1>

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
                            Buscar rol
                          </span>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Nombre o descripción..."
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
                      onClick={() => setIsAddOpen(true)}
                    >
                      <md-icon slot="icon" className="text-sm text-on-primary">
                        add
                      </md-icon>
                      Agregar un rol
                    </md-filled-button>
                  </div>
                </div>
              </div>

              <div className="flex mt-4 gap-2">
                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Totales</span>
                    <h2 className="h4 text-primary font-bold">
                      {roles.length}
                    </h2>
                  </div>
                </div>

                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Activos</span>
                    <h2 className="h4 text-primary font-bold">{activeCount}</h2>
                  </div>
                </div>

                <div className="content-box-outline-3-small">
                  <div className="flex flex-col">
                    <span className="subtitle2 font-light">Inactivos</span>
                    <h2 className="h4 text-primary font-bold">
                      {inactiveCount}
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
                      <option value="descripcion">
                        Ordenar por: Descripción
                      </option>
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

                {currentRoles.length > 0 && !isSelectionMode && (
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
                          currentRoles.length > 0 &&
                          currentRoles.every(r =>
                            selectedRoles.includes(r.idRol)
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
                    {selectedRoles.length > 0 ? (
                      <span className="text-sm text-secondary">
                        {selectedRoles.length} Seleccionados
                      </span>
                    ) : (
                      !loading && (
                        <span className="text-sm text-secondary">
                          {`Mostrando ${
                            totalItems > 0 ? startIndex + 1 : 0
                          }-${Math.min(
                            startIndex + (viewMode === 'grid' ? 8 : 4),
                            totalItems
                          )} de ${totalItems} roles`}
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
                {loading ? (
                  <div
                    className="flex items-center justify-center w-full list-enter text-center content-box-outline-2-small"
                    style={{ height: 'calc(60vh - 0px)' }}
                  >
                    <div
                      className="flex flex-col items-center gap-3"
                      style={{ width: '200px' }}
                    >
                      <md-icon className="text-secondary mb-4">group</md-icon>
                      <span className="text-secondary">Cargando roles...</span>
                      <md-linear-progress indeterminate></md-linear-progress>
                    </div>
                  </div>
                ) : currentRoles.length === 0 ? (
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
                        {searchQuery || statusFilter !== 'Todos'
                          ? 'No se encontraron roles que coincidan con los filtros'
                          : 'No hay roles registrados'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                        : 'flex flex-col'
                    }
                  >
                    {currentRoles.map((role, index) => (
                      <div
                        key={role.idRol || index}
                        className={`content-box-outline-4-small ${index > 0 && viewMode === 'list' ? 'mt-2' : ''} ${role.activo === false ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow relative`}
                        onClick={e => {
                          if (
                            !e.target.closest('button') &&
                            !e.target.closest('md-checkbox') &&
                            !e.target.closest('.action-buttons')
                          ) {
                            handleOpenProfile(role);
                          }
                        }}
                      >
                        {isSelectionMode &&
                          !PROTECTED_ROLES.includes(role.nombreRol) && (
                            <div
                              className="absolute top-3 left-3 z-10"
                              style={{
                                animation:
                                  'checkboxAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                transformOrigin: 'center',
                              }}
                            >
                              <md-checkbox
                                checked={selectedRoles.includes(role.idRol)}
                                onChange={e => {
                                  e.stopPropagation();
                                  handleSelectRole(role.idRol);
                                }}
                                onClick={e => e.stopPropagation()}
                                touch-target="wrapper"
                              />
                            </div>
                          )}

                        {viewMode === 'grid' ? (
                          <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between gap-2 pb-3 mb-2 border-b border-border">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <md-icon className="text-primary text-xl">
                                    {role.nombreRol === 'Administrador'
                                      ? 'admin_panel_settings'
                                      : role.nombreRol === 'Conductor'
                                        ? 'drive_eta'
                                        : role.nombreRol === 'Cliente'
                                          ? 'person'
                                          : 'verified_user'}
                                  </md-icon>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-bold text-primary truncate">
                                    {role.nombreRol}
                                  </h3>
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                      role.activo !== false
                                        ? 'btn-green'
                                        : 'btn-red'
                                    }`}
                                  >
                                    {role.activo !== false
                                      ? 'Activo'
                                      : 'Inactivo'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex-1 mb-4">
                              <p className="text-sm text-secondary line-clamp-3">
                                {role.descripcion || 'Sin descripción'}
                              </p>
                            </div>

                            <div className="flex gap-2 mt-auto action-buttons">
                              {PROTECTED_ROLES.includes(role.nombreRol) ? (
                                <button className="btn btn-secondary btn-sm-2 flex items-center justify-center flex-1 opacity-50 cursor-not-allowed">
                                  <md-icon className="text-sm">lock</md-icon>
                                </button>
                              ) : (
                                <button
                                  className={`btn btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all ${
                                    role.activo !== false
                                      ? 'btn-outline'
                                      : 'btn-secondary'
                                  }`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSwitchClick(role);
                                  }}
                                  title={
                                    role.activo !== false
                                      ? 'Deshabilitar'
                                      : 'Habilitar'
                                  }
                                >
                                  <md-icon className="text-sm">
                                    {role.activo !== false ? 'block' : 'check'}
                                  </md-icon>
                                </button>
                              )}

                              {!PROTECTED_ROLES.includes(role.nombreRol) && (
                                <button
                                  className="btn btn-primary btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all hover:scale-105"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setRoleToManagePermissions(role);
                                    setIsPermissionsModalOpen(true);
                                  }}
                                  title="Gestionar Permisos"
                                >
                                  <md-icon className="text-sm">vpn_key</md-icon>
                                </button>
                              )}

                              <button
                                className={`btn btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all ${
                                  PROTECTED_ROLES.includes(role.nombreRol)
                                    ? 'btn-secondary opacity-50 cursor-not-allowed'
                                    : 'btn-primary'
                                }`}
                                onClick={e => {
                                  e.stopPropagation();
                                  if (
                                    !PROTECTED_ROLES.includes(role.nombreRol)
                                  ) {
                                    handleOpenEdit(role);
                                  }
                                }}
                                disabled={PROTECTED_ROLES.includes(
                                  role.nombreRol
                                )}
                              >
                                <md-icon className="text-sm">edit</md-icon>
                              </button>

                              <button
                                className={`btn btn-sm-2 font-medium flex items-center gap-1 flex-1 justify-center transition-all ${
                                  PROTECTED_ROLES.includes(role.nombreRol)
                                    ? 'btn-secondary opacity-50 cursor-not-allowed'
                                    : 'btn-secondary hover:bg-red-50 hover:text-red-600'
                                }`}
                                onClick={e => {
                                  e.stopPropagation();
                                  if (
                                    !PROTECTED_ROLES.includes(role.nombreRol)
                                  ) {
                                    handleDeleteClick(role);
                                  }
                                }}
                                disabled={PROTECTED_ROLES.includes(
                                  role.nombreRol
                                )}
                              >
                                <md-icon className="text-sm">delete</md-icon>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center action-buttons">
                            <div className="flex items-center gap-3 flex-1">
                              <div>
                                <h1 className="h4 font-bold">
                                  {role.nombreRol}
                                </h1>
                                <div className="flex gap-2 mt-2 items-center">
                                  <span
                                    className={`btn font-medium btn-lg flex items-center ${
                                      role.activo !== false
                                        ? 'btn-green'
                                        : 'btn-red'
                                    }`}
                                  >
                                    {role.activo !== false
                                      ? 'Activo'
                                      : 'Inactivo'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 items-center shrink-0">
                              {PROTECTED_ROLES.includes(role.nombreRol) ? (
                                <div
                                  className="btn btn-secondary btn-lg font-medium flex items-center gap-1 opacity-50 btn-disabled"
                                  title="No se puede deshabilitar este rol"
                                >
                                  No se puede Deshabilitar
                                </div>
                              ) : (
                                <button
                                  className={`btn btn-lg font-medium flex items-center gap-1 ${
                                    role.activo !== false
                                      ? 'btn-outline'
                                      : 'btn-secondary'
                                  }`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleSwitchClick(role);
                                  }}
                                >
                                  {role.activo !== false
                                    ? 'Deshabilitar'
                                    : 'Habilitar'}
                                </button>
                              )}

                              {!PROTECTED_ROLES.includes(role.nombreRol) && (
                                <button
                                  className="btn btn-primary btn-lg font-medium flex items-center gap-1"
                                  onClick={e => {
                                    e.stopPropagation();
                                    setRoleToManagePermissions(role);
                                    setIsPermissionsModalOpen(true);
                                  }}
                                  title="Gestionar Permisos"
                                >
                                  <md-icon className="text-sm">vpn_key</md-icon>
                                  Permisos
                                </button>
                              )}

                              <button
                                className={`btn btn-lg font-medium flex items-center gap-1 ${
                                  PROTECTED_ROLES.includes(role.nombreRol)
                                    ? 'btn-secondary btn-disabled text-secondary'
                                    : 'btn-primary'
                                }`}
                                onClick={e => {
                                  e.stopPropagation();
                                  if (
                                    !PROTECTED_ROLES.includes(role.nombreRol)
                                  ) {
                                    handleOpenEdit(role);
                                  }
                                }}
                                title={
                                  PROTECTED_ROLES.includes(role.nombreRol)
                                    ? 'No se puede editar un rol del sistema'
                                    : 'Editar rol'
                                }
                              >
                                <md-icon className="text-sm">edit</md-icon>
                                Editar
                              </button>

                              <button
                                className={`btn btn-lg font-medium flex items-center gap-1 ${
                                  PROTECTED_ROLES.includes(role.nombreRol)
                                    ? 'btn-secondary btn-disabled text-secondary'
                                    : 'btn-secondary'
                                }`}
                                onClick={e => {
                                  e.stopPropagation();
                                  if (
                                    !PROTECTED_ROLES.includes(role.nombreRol)
                                  ) {
                                    handleDeleteClick(role);
                                  }
                                }}
                                title={
                                  PROTECTED_ROLES.includes(role.nombreRol)
                                    ? 'No se puede eliminar un rol del sistema'
                                    : 'Eliminar rol'
                                }
                              >
                                <md-icon className="text-sm">delete</md-icon>
                              </button>
                            </div>
                          </div>
                        )}
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
          <RolProfile
            role={selectedRole}
            isOpen={isProfileOpen}
            onClose={handleCloseProfile}
            onAdd={() => {
              setIsAddOpen(true);
            }}
            onEdit={r => {
              setIsEditOpen(true);
              setSelectedRole(r);
            }}
            onDelete={handleDeleteRole}
            onManagePermissions={role => {
              setRoleToManagePermissions(role);
              setIsPermissionsModalOpen(true);
            }}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemType="rol"
          itemName={roleToDelete?.nombreRol}
        />

        <DeleteWithDependenciesModal
          isOpen={isDeleteWithDependenciesModalOpen}
          onClose={() => {
            setIsDeleteWithDependenciesModalOpen(false);
            setRoleToDelete(null);
            setDependenciesList([]);
          }}
          onConfirm={handleDeleteWithDependenciesConfirm}
          itemName={roleToDelete?.nombreRol}
          dependencies={dependenciesList}
        />

        <DeleteModal
          isOpen={isDeleteMultipleModalOpen}
          onClose={() => setIsDeleteMultipleModalOpen(false)}
          onConfirm={handleDeleteMultipleConfirm}
          itemType="roles"
          isPlural={true}
          itemName={`${selectedRoles.length} roles seleccionados`}
        />

        <SwitchModal
          isOpen={isSwitchModalOpen}
          onClose={handleSwitchCancel}
          onConfirm={handleSwitchConfirm}
          itemType="rol"
          itemName={roleToSwitch?.nombreRol}
          isCurrentlyActive={roleToSwitch?.activo !== false}
        />

        <AddRoleModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onConfirm={handleAddSuccess}
        />

        <EditRoleModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
          }}
          onConfirm={fetchRoles}
          itemData={selectedRole}
        />

        <ManagePermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          roleData={roleToManagePermissions}
        />
      </section>
    </>
  );
};

export default RolesPage;
