import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/switch/switch.js';
import '@material/web/checkbox/checkbox.js';

const ContratosPage = () => {
    return (
        <section>
            <div className='list-enter'>
                <div className='flex justify-between items-center'>
                    <h1 className='h4 font-medium'>Contratos</h1>
                    <div className='flex gap-2'>
                        <div className='relative'>
                            <md-filled-button className='btn-search-minimal px-10 py-2'>
                                <md-icon slot='icon' className='text-sm text-secondary'>
                                    search
                                </md-icon>
                                Buscar
                            </md-filled-button>
                        </div>
                        <div>
                            <md-filled-button
                                className="btn-add px-5"
                                onClick={() => { }}
                            >
                                <md-icon slot="icon" className="text-sm text-on-primary">
                                    assignment_add
                                </md-icon>
                                Agregar un contrato
                            </md-filled-button>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ContratosPage;