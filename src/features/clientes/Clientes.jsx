import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import { useState } from 'react';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import ClienteProfile from './pages/ClientesProfile';


const Clientes = () => {
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const allClients = [
        {
            name: 'Lucelly Renteria',
            status: 'Activo',
            document: '1234567890',
            phone: '+57 300 123 4567',
            email: 'lucelly.renteria@email.com',
            address: 'Calle 123 #45-67, Medellín',
            registrationDate: '15 de Marzo, 2024',
            city: 'Medellin'
        },
        {
            name: 'Carlos Mendoza',
            status: 'Activo',
            document: '0987654321',
            phone: '+57 301 987 6543',
            email: 'carlos.mendoza@email.com',
            address: 'Carrera 45 #12-34, Bogotá',
            registrationDate: '20 de Febrero, 2024',
            city: 'Bogotá'
        },
        {
            name: 'María González',
            status: 'Inactivo',
            document: '1122334455',
            phone: '+57 302 555 1234',
            email: 'maria.gonzalez@email.com',
            address: 'Avenida 80 #23-45, Cali',
            registrationDate: '10 de Enero, 2024',
            city: 'Cali'
        },
        {
            name: 'María González',
            status: 'Inactivo',
            document: '1122334455',
            phone: '+57 302 555 1234',
            email: 'maria.gonzalez@email.com',
            address: 'Avenida 80 #23-45, Cali',
            registrationDate: '10 de Enero, 2024',
            city: 'Cali'
        },
        {
            name: 'María González',
            status: 'Inactivo',
            document: '1122334455',
            phone: '+57 302 555 1234',
            email: 'maria.gonzalez@email.com',
            address: 'Avenida 80 #23-45, Cali',
            registrationDate: '10 de Enero, 2024',
            city: 'Cali'
        },
        {
            name: 'María González',
            status: 'Inactivo',
            document: '1122334455',
            phone: '+57 302 555 1234',
            email: 'maria.gonzalez@email.com',
            address: 'Avenida 80 #23-45, Cali',
            registrationDate: '10 de Enero, 2024',
            city: 'Cali'
        },
        {
            name: 'María González',
            status: 'Inactivo',
            document: '1122334455',
            phone: '+57 302 555 1234',
            email: 'maria.gonzalez@email.com',
            address: 'Avenida 80 #23-45, Cali',
            registrationDate: '10 de Enero, 2024',
            city: 'Cali'
        }
    ];

    const {
        currentPage,
        totalPages,
        currentData: currentClients,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(allClients, 4);

    const handleOpenProfile = (cliente) => {
        setSelectedCliente(cliente);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedCliente(null);
    };

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className='list-enter'>
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Clientes</h1>

                            <div className='flex gap-2'>
                                <div>
                                    <md-filled-button className="btn-search-minimal px-6 py-2">
                                        <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                                        Buscar
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
                                    <h2 className='h4 text-white font-bold'>{allClients.filter(client => client.status === 'Activo').length}</h2>
                                </div>
                            </div>

                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-white font-bold'>{allClients.filter(client => client.status === 'Inactivo').length}</h2>
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
                                Mostrando {startIndex + 1}-{Math.min(startIndex + 4, totalItems)} de {totalItems} clientes
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentClients.map((client, index) => (
                                <div
                                    key={index}
                                    className='content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3'
                                    onClick={() => handleOpenProfile(client)}
                                >
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <h1 className='h4'>{client.name}</h1>
                                            <div>
                                                <button className={`btn btn-lg font-medium flex items-center ${client.status === 'Activo' ? 'btn-primary' : 'btn-secondary'
                                                    }`}>
                                                    {client.status}
                                                </button>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <md-switch
                                                icons
                                                show-only-selected-icon
                                                selected={client.status === 'Activo'}
                                            ></md-switch>
                                            <button
                                                className='btn btn-secondary btn-lg font-medium flex items-center'
                                                onClick={(e) => { e.stopPropagation(); }}
                                            >
                                                <md-icon className="text-sm">delete</md-icon>
                                            </button>

                                            <button
                                                className='btn btn-primary btn-lg font-medium flex items-center'
                                                onClick={(e) => { e.stopPropagation(); }}
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
                <ClienteProfile
                    cliente={selectedCliente}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                />
            )}


        </section>
    )
}

export default Clientes