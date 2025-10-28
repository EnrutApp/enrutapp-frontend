import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import UserProfile from './pages/UsuarioProfilePage';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddModal from '../../shared/components/modal/addModal/AddModal';
import EditModal from '../../shared/components/modal/editModal/EditModal';
import { useState } from 'react';
import userService from '../../shared/services/userService';
import useApi from '../../shared/hooks/useApi';
import Avvvatars from 'avvvatars-react';

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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

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
            const response = await userService.cambiarEstado(userToSwitch.idUsuario, !userToSwitch.estado);
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

    const handleUserUpdated = (updatedUser) => {
        setUsers(users.map(user =>
            user.idUsuario === updatedUser.idUsuario ? updatedUser : user
        ));
    };

    const handleEditClick = (user) => {
        setUserToEdit(user);
        setIsEditModalOpen(true);
    };

    const handleEditConfirm = (updatedUser) => {
        handleUserUpdated(updatedUser);
        setIsEditModalOpen(false);
        setUserToEdit(null);
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
        setUserToEdit(null);
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


    if (error) {
        return (
            <div className="flex items-center justify-center w-full content-box-outline-2-small list-enter" style={{ height: 'calc(100vh - 40px)' }}>
                <div className="flex flex-col items-center justify-center" style={{ width: '340px' }}>
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
                                </div>
                                <div>
                                    <md-filled-button className="btn-add px-5" onClick={() => setIsAddModalOpen(true)}>
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
                                {isLoading ? 'Cargando usuarios...' : `Mostrando ${startIndex + 1}-${Math.min(startIndex + 6, totalItems)} de ${totalItems} usuarios`}
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentUsers.map((user, index) => (
                                <div
                                    key={user.idUsuario}
                                    className={`content-box-outline-4-small ${index > 0 ? 'mt-2' : ''} ${!user.estado ? 'opacity-60' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                                    onClick={(e) => {
                                        // Si el click viene del switch, no abrir el detalle
                                        if (e.target.closest('md-switch')) return;
                                        handleOpenProfile(user);
                                    }}
                                >

                                    <div className="flex justify-between items-center">
                                        <div className='flex justify-center items-center'>
                                            <div className="flex items-center justify-center w-16 h-16 mr-3">
                                                {user?.foto ? (
                                                    <img
                                                        src={user.foto.startsWith('http') ? user.foto : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${user.foto}`}
                                                        alt="Foto de perfil"
                                                        className="rounded-lg w-16 h-16 object-cover shadow-2xl"
                                                    />
                                                ) : (
                                                    <Avvvatars value={user?.nombre || 'Usuario'} size={64} radius={11} />
                                                )}
                                            </div>
                                            <div>
                                                <div className='leading-tight'>
                                                    <h1 className="h4 font-bold">{user.nombre}</h1>
                                                    <div className="flex gap-2 text-secondary">
                                                        <span>{user.correo}</span>
                                                        <span>|</span>
                                                        <span>{user.numDocumento}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-2 items-center">
                                                    <button className={`btn font-medium btn-lg flex items-center ${user.estado ? 'btn-primary' : 'btn-secondary'}`}>
                                                        {user.estado ? 'Activo' : 'Inactivo'}
                                                    </button>
                                                    <button className='btn btn-outline btn-lg font-medium flex items-center'>
                                                        <md-icon className="text-sm">person</md-icon>
                                                        {user.rol?.nombreRol || 'Sin rol'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            {user.rol?.nombreRol?.toLowerCase() === 'administrador' ? (
                                                <div
                                                    className='btn btn-secondary btn-lg font-medium flex items-center opacity-50 cursor-not-allowed'
                                                    title="No se puede deshabilitar un administrador"
                                                >
                                                    Administrador
                                                </div>
                                            ) : (
                                                <button
                                                    className={`btn btn-lg font-medium flex items-center ${user.estado ? 'btn-outline' : 'btn-secondary'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSwitchClick(user);
                                                    }}
                                                >
                                                    {user.estado ? 'Deshabilitar' : 'Habilitar'}
                                                </button>
                                            )}
                                            {user.rol?.nombreRol?.toLowerCase() === 'administrador' ? (
                                                <div
                                                    className='btn btn-secondary btn-lg font-medium flex items-center opacity-50 cursor-not-allowed'
                                                    title="No se puede eliminar un administrador"
                                                >
                                                    <md-icon className="text-sm">delete</md-icon>
                                                </div>
                                            ) : (
                                                <button
                                                    className='btn btn-secondary btn-lg font-medium flex items-center'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(user);
                                                    }}
                                                >
                                                    <md-icon className="text-sm">delete</md-icon>
                                                </button>
                                            )}

                                            <button
                                                className='btn btn-primary btn-lg font-medium flex items-center'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditClick(user);
                                                }}
                                            >
                                                <md-icon className="text-sm">edit</md-icon>
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {currentUsers.length === 0 && (
                                <div className="flex items-center justify-center w-full list-enter text-center" style={{ height: 'calc(60vh - 40px)' }}>
                                    <div className="flex flex-col items-center justify-center" style={{ width: '340px' }}>
                                        <md-icon className="text-secondary mb-4">group</md-icon>
                                        <p className="text-secondary">
                                            {searchTerm || statusFilter !== 'Todos'
                                                ? 'No se encontraron usuarios que coincidan con los filtros'
                                                : 'No hay usuarios registrados'
                                            }
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
                    <AddModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onConfirm={() => {
                            fetchUsers();
                            setIsAddModalOpen(false);
                        }}
                        itemType="usuario"
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

            <EditModal
                isOpen={isEditModalOpen}
                onClose={handleEditCancel}
                onConfirm={handleEditConfirm}
                itemType="usuario"
                itemData={userToEdit}
            />
        </section>
    );
};

export default Usuarios;
