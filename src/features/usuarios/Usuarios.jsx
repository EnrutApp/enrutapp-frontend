import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import UserProfile from './pages/UserProfile';
import { useState } from 'react';

const Usuarios = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const allUsers = [
        {
            name: 'Edson Mena',
            status: 'Activo',
            id: 102345467,
            role: 'Administrador',
            city: 'Medellin',
            tel: 301321111,
            adress: 'Cra 24 #11-12'
        },
        {
            name: 'Lucelly Renteria',
            status: 'Activo',
            id: 1012121,
            role: 'Cliente'
        },
        {
            name: 'Diomedes Diaz',
            status: 'Activo',
            id: 9765541,
            role: 'Conductor'
        },
        {
            name: 'Edson Mena',
            status: 'Activo',
            id: 102345467,
            role: 'Administrador',
            city: 'Medellin',
            tel: 301321111,
            adress: 'Cra 24 #11-12'
        },
        {
            name: 'Lucelly Renteria',
            status: 'Activo',
            id: 1012121,
            role: 'Cliente'
        },
        {
            name: 'Diomedes Diaz',
            status: 'Activo',
            id: 9765541,
            role: 'Conductor'
        },
        {
            name: 'Diomedes Diaz',
            status: 'Activo',
            id: 9765541,
            role: 'Conductor'
        },
        {
            name: 'Diomedes Diaz',
            status: 'Activo',
            id: 9765541,
            role: 'Conductor'
        }
    ];

    const handleOpenProfile = (user) => {
        setSelectedUser(user);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedUser(null);
    };

    const {
        currentPage,
        totalPages,
        currentData: currentUsers,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(allUsers, 4);

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
                                    <h2 className='h4 text-white font-bold'>{totalItems}</h2>
                                </div>
                            </div>

                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Activos</span>
                                    <h2 className='h4 text-white font-bold'>{allUsers.filter(user => user.status === 'Activo').length}</h2>
                                </div>
                            </div>

                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-white font-bold'>{allUsers.filter(user => user.status === 'Inactivo').length}</h2>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 mt-3'>
                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select name="Estado" id="" className='select-filter'>
                                    <option value="Todos">Estado: Todos</option>
                                    <option value="Activos">Estado: Activos</option>
                                    <option value="Inactivos">Estado: Inactivos</option>
                                </select>
                            </div>

                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select name="Estado" id="" className='select-filter'>
                                    <option value="Nombre">Ordenar por: Nombre</option>
                                    <option value="Apellido">Ordenar por: Apellido</option>
                                </select>
                            </div>

                            <div className='select-wrapper'>
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select name="Estado" id="" className='select-filter'>
                                    <option value="Ascendente">Orden: Ascendente</option>
                                    <option value="Descendente">Orden: Descendente</option>
                                </select>
                            </div>
                        </div>

                        <div className='flex justify-between items-center mt-6 mb-4'>
                            <span className='text-sm text-secondary'>
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 4, totalItems)} de {totalItems} usuarios
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentUsers.map((user, index) => (
                                <div key={index} className={`content-box-outline-4-small ${index > 0 ? 'mt-2' : ''}`} onClick={() => handleOpenProfile(user)}>
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <h1 className='h4'>{user.name}</h1>
                                            <div className='flex gap-1'>
                                                <button className={`btn font-medium btn-lg flex items-center ${user.status === 'Activo' ? 'btn-primary' : 'btn-secondary'}`}>
                                                    {user.status}
                                                </button>
                                                <button className='btn btn-primary font-medium btn-lg flex items-center'>
                                                    {user.role}
                                                </button>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <md-switch
                                                icons
                                                show-only-selected-icon
                                                selected={user.status === 'Activo'}
                                            ></md-switch>
                                            <button className='btn btn-secondary btn-lg font-medium flex items-center'>
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
                <UserProfile
                    user={selectedUser}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                />
            )}
        </section>
    )
}

export default Usuarios
