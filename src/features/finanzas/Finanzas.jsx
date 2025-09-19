import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'

const Finanzas = () => {
    return (
        <section className='list-enter'>
            <div className='flex justify-between items-center mb-6'>
                <h1 className="h4 font-medium">Finanzas</h1>

                <div className='flex gap-2 items-center'>
                    <div className='select-wrapper'>
                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                        <select name="Mes" id="" className='select-filter'>
                            <option value="Mayo">Mayo</option>
                            <option value="Abril">Abril</option>
                            <option value="Junio">Junio</option>
                        </select>
                    </div>

                    <div className='select-wrapper'>
                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                        <select name="Año" id="" className='select-filter'>
                            <option value="2025">Año 2025</option>
                            <option value="2024">Año 2024</option>
                            <option value="2023">Año 2023</option>
                        </select>
                    </div>

                    <div>
                        <md-filled-button className="btn-add px-5">
                            <md-icon slot="icon" className="text-sm text-on-primary">add_circle</md-icon>
                            Agregar gasto
                        </md-filled-button>
                    </div>
                </div>
            </div>

            <div className='flex mt-4 gap-2 mb-2'>
                <div className='content-box-outline-small'>
                    <div className='flex flex-col'>
                        <span className='subtitle2 font-light text-secondary'>Total encomiendas</span>
                        <h2 className='h4 text-white font-bold'>$0.00</h2>
                    </div>
                </div>

                <div className='content-box-outline-small relative'>
                    <div className='flex flex-col'>
                        <span className='subtitle2 font-light text-secondary'>Ingresos</span>
                        <h2 className='h4 text-blue font-bold'>$0,000</h2>
                    </div>
                    <md-icon className="text-blue absolute-card">arrow_upward</md-icon>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-2'>
                <div>
                    <div className='content-box-outline-small mb-2'>
                        <div className='flex justify-between items-center mb-2'>
                            <span className='subtitle2 font-light text-secondary'>Gastos</span>
                        </div>

                        <div className='space-y-2'>
                            <div className='flex content-box-outline-5-small justify-between items-center'>
                                <span className='subtitle2'>Fecha</span>
                                <span className='subtitle2'>Cantidad</span>
                            </div>
                            <div className='flex content-box-outline-5-small justify-between items-center'>
                                <span className='subtitle2'>30 de Mayo</span>
                                <span className='text-secondary'>$0,00</span>
                            </div>
                            <div className='flex content-box-outline-5-small justify-between items-center'>
                                <span className='subtitle2'>30 de Mayo</span>
                                <span className='text-secondary'>$0,00</span>
                            </div>
                        </div>
                    </div>

                    <div className='content-box-outline-small'>
                        <div className='flex flex-col mb-2'>
                            <span className='subtitle2 font-light text-secondary'>Promedio de ingresos</span>
                        </div>

                        <div className='space-y-3'>
                            <div className='flex justify-between items-center'>
                                <span className='h4 font-bold text-blue'>$0.00</span>
                                <span className='subtitle2 text-secondary'>/ día</span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='h4 font-bold text-blue'>$0.00</span>
                                <span className='subtitle2 text-secondary'>/ semana</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className='bg-primary text-on-primary content-box-small mb-2'>
                        <div className='flex flex-col'>
                            <span className='subtitle2 font-light opacity-80'>Balance</span>
                            <h2 className='h2 font-bold'>$0.00</h2>
                        </div>
                    </div>

                    <div className='content-box-outline-3-small'>
                        <div className='flex flex-col'>
                            <span className='subtitle2 font-light text-secondary mb-4'>Ingresos por día</span>
                            <div className='h-44 flex items-center justify-center text-secondary'>
                                <span className='subtitle2'>Sin datos disponibles</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Finanzas