import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import '@material/web/switch/switch.js'

const Turnos = () => {
    return (
        <section>
            <div className='flex justify-between items-center'>
                <h1 className="h4 font-medium">Turnos</h1>

                <div className='flex gap-2'>
                    <div>
                        <md-filled-button className="btn-search-minimal px-6 py-2">
                            <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                            Buscar
                        </md-filled-button>
                    </div>
                    <div>
                        <md-filled-button className="btn-add px-5">
                            <md-icon slot="icon" className="text-sm text-on-primary">add</md-icon>
                            Asignar un turnos
                        </md-filled-button>
                    </div>
                </div>
            </div>

            <div className='flex mt-4 gap-2'>
                <div className='content-box-outline-3-small'>
                    <div className='flex flex-col'>
                        <span className='subtitle2 font-light'>Totales</span>
                        <h2 className='h4 text-white font-bold'>1</h2>
                    </div>
                </div>

                <div className='content-box-outline-3-small'>
                    <div className='flex flex-col'>
                        <span className='subtitle2 font-light'>Programados</span>
                        <h2 className='h4 text-white font-bold'>1</h2>
                    </div>
                </div>

                <div className='content-box-outline-3-small'>
                    <div className='flex flex-col'>
                        <span className='subtitle2 font-light'>Completados</span>
                        <h2 className='h4 text-white font-bold'>0</h2>
                    </div>
                </div>

                <div className='content-box-outline-3-small'>
                    <div className='flex flex-col'>
                        <span className='subtitle2 font-light'>Cancelados</span>
                        <h2 className='h4 text-white font-bold'>0</h2>
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

            <div className='mt-3'>
                <div className='content-box-outline-4-small'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <div className='flex flex-col'>
                                <span>20 de Mayo, 4:00AM | Alaskan</span>
                                <h1 className='h4'>Diomedes Diaz</h1>
                            </div>
                            <div className='flex gap-1'>
                                <button className='btn btn-green font-medium btn-lg flex items-center'>
                                    <md-icon slot="edit" className="text-sm">check</md-icon>
                                    Completado
                                </button>
                            </div>
                        </div>
                        <div className='flex gap-2'>
                            <md-switch icons show-only-selected-icon selected></md-switch>
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
            </div>
        </section>
    )
}

export default Turnos