import '@material/web/icon/icon.js';
import { NavLink } from 'react-router-dom';

const RestablecerContraseña = () => {
    return (
        <div className='min-h-screen flex items-center justify-center bg-background'>
            <div className='w-full max-w-md px-6'>
                <div className='mb-3 -space-y-2'>
                    <h1 className='h2 font-medium text-primary'>Restablecer</h1>
                    <h1 className='h2 font-medium text-primary'>contraseña</h1>
                </div>

                <div className='space-y-4'>
                    <div className='flex flex-col'>
                        <label htmlFor="documento" className='text-secondary subtitle1 mb-1'>Documento</label>
                        <input
                            type="text"
                            id="documento"
                            placeholder='Aquí tu documento'
                            className='w-full px-4 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors'
                        />
                    </div>

                    <div className='pt-1'>
                        <button className='w-full btn btn-primary py-3 font-medium text-subtitle1'>
                            Enviar
                        </button>
                    </div>

                    <div>
                        <NavLink to={"/login"} className="text-secondary subtitle2 underline hover:text-primary transition-colors">Inicia sesión</NavLink>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RestablecerContraseña