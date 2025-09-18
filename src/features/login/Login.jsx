import '@material/web/icon/icon.js';
import { NavLink } from 'react-router-dom';

const Login = () => {
    return (
        <div className='min-h-screen flex items-center justify-center bg-background'>
            <div className='w-full max-w-md px-6'>
                <div className='mb-3'>
                    <h1 className='h2 font-medium text-white'>Inicia sesión</h1>
                </div>

                <div className='space-y-4'>
                    <div className='flex flex-col'>
                        <label htmlFor="documento" className='text-secondary subtitle1 mb-1'>Documento</label>
                        <input
                            type="text"
                            id="documento"
                            placeholder='Aquí tu documento'
                            className='w-full px-4 input bg-fill border border-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors'
                        />
                    </div>

                    <div className='flex flex-col'>
                        <label htmlFor="password" className='text-secondary subtitle1 mb-1'>Contraseña</label>
                        <div className='relative'>
                            <input
                                type="password"
                                id="password"
                                placeholder='Aquí tu contraseña'
                                className='w-full input pr-12 bg-fill border border-border rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors'
                            />
                        </div>
                    </div>

                    <div className='pt-1'>
                        <NavLink to={"/dashboard"} className='w-full btn btn-primary py-3 font-medium text-subtitle1'>
                            Inicia sesión
                        </NavLink>
                    </div>

                    <div>
                        <NavLink to={"/reset-password"} className="text-secondary subtitle2 underline hover:text-primary transition-colors">Olvidé mi contraseña</NavLink>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login