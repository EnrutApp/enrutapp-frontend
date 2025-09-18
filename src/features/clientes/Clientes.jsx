import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'
import { useState } from 'react';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';


const Clientes = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isClosing, setIsClosing] = useState(false);

    // Datos de ejemplo para la paginación
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

    // Usar el hook de paginación
    const {
        currentPage,
        totalPages,
        currentData: currentClients,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(allClients, 4);

    const handleClientClick = (client) => {
        setSelectedClient(client);
        setShowModal(true);
        setIsClosing(false);
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setSelectedClient(null);
            setIsClosing(false);
        }, 250);
    };

    return (
        <section>
            <nav className='flex justify-between items-center'>
                <h1 className="h4 font-medium">Clientes</h1>

                <div className='flex gap-2'>
                    <div>
                        <md-filled-button className="btn-search-minimal px-6 py-2">
                            <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                            Buscar
                        </md-filled-button>
                    </div>
                </div>
            </nav>

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

            {/* Indicador de resultados */}
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
                        onClick={() => handleClientClick(client)}
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

            {showModal && (
                <div
                    className={`fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 modal-overlay ${isClosing ? 'closing' : ''}`}
                    onClick={closeModal}
                >
                    <div
                        className={`bg-background border border-border rounded-3xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide modal-content ${isClosing ? 'closing' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='flex justify-between items-center p-6'>
                            <div className='flex'>
                                <button
                                    onClick={closeModal}
                                    className='text-text-secondary btn hover:text-white transition-colors'
                                >
                                    <md-icon className="text-2xl">close</md-icon>
                                </button>
                                <h2 className='h3 font-semibold text-white'>Detalles del Cliente</h2>
                            </div>
                            <div className='flex gap-2'>
                                <div>
                                    <md-filled-button className="btn-search-minimal px-6 py-2">
                                        <md-icon slot="icon" className="text-sm text-secondary">edit</md-icon>
                                        Editar datos
                                    </md-filled-button>
                                </div>
                                <div>
                                    <md-filled-button className="btn-add px-5">
                                        <md-icon slot="icon" className="text-sm text-on-primary">person_add</md-icon>
                                        Agregar un cliente
                                    </md-filled-button>
                                </div>
                            </div>
                        </div>

                        <div className='px-6 pb-6 space-y-6'>
                            <div className='bg-primary text-on-primary content-box-small mb-4'>
                                <h1 className='h3 text-on-primary'>Lucelly Renteria</h1>
                                <span className='subtitle1 font-medium text-on-primary'>1021805422</span>
                            </div>
                            <div className='content-box-outline-small'>
                                <h3 className='h4 font-medium mb-4 text-white'>Información Personal</h3>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <span className='subtitle2 text-secondary'>Nombre completo</span>
                                        <p className='text-white font-medium'>{selectedClient?.name}</p>
                                    </div>
                                    <div>
                                        <span className='subtitle2 text-secondary'>Estado</span>
                                        <div className='mt-1'>
                                            <button className='btn btn-primary btn-sm-2 font-medium'>
                                                {selectedClient?.status}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <span className='subtitle2 text-secondary'>Documento</span>
                                        <p className='text-white font-medium'>{selectedClient?.document}</p>
                                    </div>
                                    <div>
                                        <span className='subtitle2 text-secondary'>Fecha de registro</span>
                                        <p className='text-white font-medium'>{selectedClient?.registrationDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='content-box-outline-small'>
                                <h3 className='h4 font-medium mb-4 text-white'>Información de Contacto</h3>
                                <div className='grid grid-cols-1 gap-4'>
                                    <div>
                                        <span className='subtitle2 text-secondary'>Teléfono</span>
                                        <p className='text-white font-medium'>{selectedClient?.phone}</p>
                                    </div>
                                    <div>
                                        <span className='subtitle2 text-secondary'>Email</span>
                                        <p className='text-white font-medium'>{selectedClient?.email}</p>
                                    </div>
                                    <div>
                                        <span className='subtitle2 text-secondary'>Dirección</span>
                                        <p className='text-white font-medium'>{selectedClient?.address}</p>
                                    </div>
                                    <div>
                                        <span className='subtitle2 text-secondary'>Ciudad</span>
                                        <p className='text-white font-medium'>{selectedClient?.city}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='content-box-outline-small'>
                                <h3 className='h4 font-medium mb-4 text-white'>Historial de Viajes</h3>
                                <div className='space-y-3'>
                                    <div className='content-box-outline-2-small'>
                                        <div className='flex justify-between items-center'>
                                            <div>
                                                <p className='text-white font-medium'>Medellín → Quibdó</p>
                                                <span className='subtitle2 text-secondary'>20 de Mayo, 2024 - 4:00 AM</span>
                                            </div>
                                            <button className='btn btn-primary btn-sm-2 font-normal'>
                                                Completado
                                            </button>
                                        </div>
                                    </div>

                                    <div className='content-box-outline-2-small'>
                                        <div className='flex justify-between items-center'>
                                            <div>
                                                <p className='text-white font-medium'>Quibdó → Medellín</p>
                                                <span className='subtitle2 text-secondary'>15 de Mayo, 2024 - 6:00 AM</span>
                                            </div>
                                            <button className='btn btn-primary btn-sm-2 font-normal'>
                                                Completado
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='px-3 pb-3'>
                            <button className='btn btn-lg font-medium flex text-red items-center'>
                                <md-icon className="text-sm">delete</md-icon>
                                Eliminar usuario
                            </button>
                        </div>


                        <div className='flex justify-end gap-2 p-6 border-t border-border'>
                            <button
                                onClick={closeModal}
                                className='btn btn-outline btn-lg font-medium'
                            >
                                Cerrar
                            </button>
                            <button className='btn btn-primary btn-lg font-medium flex items-center'>
                                <md-icon className="text-sm">edit</md-icon>
                                Editar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Componente de Paginación Reutilizable */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showPagination={showPagination}
            />
        </section>
    )
}

export default Clientes