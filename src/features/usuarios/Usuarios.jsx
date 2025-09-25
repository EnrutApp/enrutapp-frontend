import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import UserProfile from './pages/UserProfile';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import { useState, useEffect } from 'react';
import userService from '../../shared/services/userService';
import useApi from '../../shared/hooks/useApi';

const Usuarios = () => {
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

    const {
        data: users,
        isLoading,
        error,
        execute: fetchUsers,
        setData: setUsers
    } = useApi(userService.getUsers, []);

    const filteredUsers = users ? users.filter(user => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.numDocumento.includes(searchTerm);

        const matchesStatus = statusFilter === 'Todos' ||
            (statusFilter === 'Activos' && user.estado) ||
            (statusFilter === 'Inactivos' && !user.estado);

        return matchesSearch && matchesStatus;
    }) : [];

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

    const handleOpenProfile = (user) => {
        setSelectedUser(user);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteClick = (user) => {
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
            console.error('Error deleting user:', error);
            alert('Error al eliminar el usuario: ' + error.message);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleSwitchClick = (user) => {
        setUserToSwitch(user);
        setIsSwitchModalOpen(true);
    };

    const handleSwitchConfirm = async () => {
        try {
            await userService.updateUser(userToSwitch.idUsuario, {
                estado: !userToSwitch.estado
            });

            setUsers(users.map(user =>
                user.idUsuario === userToSwitch.idUsuario
                    ? { ...user, estado: !user.estado }
                    : user
            ));

            setIsSwitchModalOpen(false);
            setUserToSwitch(null);
        } catch (error) {
            console.error('Error updating user status:', error);
            alert('Error al cambiar el estado del usuario: ' + error.message);
        }
    };

    const handleSwitchCancel = () => {
        setIsSwitchModalOpen(false);
        setUserToSwitch(null);
    };

    const handleUserUpdated = (updatedUser) => {
        setUsers(users.map(user =>
            user.idUsuario === updatedUser.idUsuario ? updatedUser : user
        ));
    };

    const {
        currentPage,
        totalPages,
        currentData: currentUsers,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(sortedUsers, 4);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3 text-secondary">Cargando usuarios...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <md-icon className="text-6xl text-red-500 mb-4">error</md-icon>
                    <p className="text-red-600 mb-4">Error al cargar usuarios: {error}</p>
                    <md-filled-button onClick={fetchUsers} className="btn btn-primary">
                        Reintentar
                    </md-filled-button>
                </div>
            </div>
        );
    }

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className="list-enter">
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Usuarios</h1>

                            <div className='flex gap-2'>
                                <div>
                                    <md-filled-button className="btn-search-minimal px-6 py-2">
                                        <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                                        Buscar
                                    </md-filled-button>
                                    {/* <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Buscar usuarios..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="input pl-10 pr-4 py-2 border border-border rounded-lg focus:border-primary transition-colors"
                                        />
                                        <md-icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">
                                            search
                                        </md-icon>
                                    </div> */}
                                </div>
                                <div>
                                    <md-filled-button className="btn-add px-5">
                                        <md-icon slot="icon" className="text-sm text-on-primary">person_add</md-icon>
                                        Agregar usuarios
                                    </md-filled-button>
                                </div>
                            </div>
                        </div>

                        <div className='flex mt-4 gap-2'>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Totales</span>
                                    <h2 className='h4 text-primary font-bold'>{users?.length || 0}</h2>
                                </div>
                            </div>

                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Activos</span>
                                    <h2 className='h4 text-primary font-bold'>
                                        {users?.filter(user => user.estado).length || 0}
                                    </h2>
                                </div>
                            </div>

                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-primary font-bold'>
                                        {users?.filter(user => !user.estado).length || 0}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 mt-3'>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className='select-filter'
                                >
                                    <option value="Todos">Estado: Todos</option>
                                    <option value="Activos">Estado: Activos</option>
                                    <option value="Inactivos">Estado: Inactivos</option>
                                </select>
                            </div>

                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className='select-filter'
                                >
                                    <option value="nombre">Ordenar por: Nombre</option>
                                    <option value="correo">Ordenar por: Email</option>
                                    <option value="rol">Ordenar por: Rol</option>
                                </select>
                            </div>

                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className='select-filter'
                                >
                                    <option value="asc">Orden: Ascendente</option>
                                    <option value="desc">Orden: Descendente</option>
                                </select>
                            </div>
                        </div>

                        <div className='flex justify-between items-center mt-6 mb-4'>
                            <span className='text-sm text-secondary'>
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 6, totalItems)} de {totalItems} usuarios
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        {/* <div className='mt-3'>
                            {currentUsers.map((user, index) => (
                                <div
                                    key={user.idUsuario}
                                    className={`content-box-outline-4-small ${index > 0 ? 'mt-2' : ''} ${!user.estado ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                                    onClick={() => handleOpenProfile(user)}
                                >
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <h1 className='h4'>{user.nombre}</h1>
                                            <div className='flex gap-2 mt-1'>
                                                <span className='text-sm text-secondary'>{user.correo}</span>
                                                <span className='text-sm text-secondary'>{user.numDocumento}</span>
                                            </div>
                                            <div className='flex gap-1 mt-2'>
                                                <button className={`btn font-medium btn-lg flex items-center ${user.estado ? 'btn-primary' : 'btn-secondary'}`}>
                                                    {user.estado ? 'Activo' : 'Inactivo'}
                                                </button>
                                                <button className='btn btn-outline btn-lg font-medium flex items-center'>
                                                    {user.rol?.nombreRol || 'Sin rol'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <md-switch
                                                icons
                                                show-only-selected-icon
                                                selected={user.estado}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSwitchClick(user);
                                                }}
                                            ></md-switch>
                                            <button
                                                className='btn btn-secondary btn-lg font-medium flex items-center'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(user);
                                                }}
                                            >
                                                <md-icon className="text-sm">delete</md-icon>
                                            </button>

                                            <button className='btn btn-primary btn-lg font-medium flex items-center'>
                                                <md-icon className="text-sm">edit</md-icon>
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {currentUsers.length === 0 && (
                                <div className="text-center py-8">
                                    <md-icon className="text-6xl text-secondary mb-4">group</md-icon>
                                    <p className="text-secondary">
                                        {searchTerm || statusFilter !== 'Todos'
                                            ? 'No se encontraron usuarios que coincidan con los filtros'
                                            : 'No hay usuarios registrados'
                                        }
                                    </p>
                                </div>
                            )}
                        </div> */}

                        <table class="table-fixed">
                            <thead>
                                <tr>
                                    <th>Song</th>
                                    <th>Artist</th>
                                    <th>Year</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>The Sliding Mr. Bones (Next Stop, Pottersville)</td>
                                    <td>Malcolm Lockyer</td>
                                    <td>1961</td>
                                </tr>
                                <tr>
                                    <td>Witchy Woman</td>
                                    <td>The Eagles</td>
                                    <td>1972</td>
                                </tr>
                                <tr>
                                    <td>Shining Star</td>
                                    <td>Earth, Wind, and Fire</td>
                                    <td>1975</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        showPagination={showPagination}
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

            <SwitchModal
                isOpen={isSwitchModalOpen}
                onClose={handleSwitchCancel}
                onConfirm={handleSwitchConfirm}
                itemType="usuario"
                itemName={userToSwitch?.nombre}
                isCurrentlyActive={userToSwitch?.estado}
            />
        </section>
    );
};

export default Usuarios;
