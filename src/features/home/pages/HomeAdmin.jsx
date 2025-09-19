import '@material/web/icon/icon.js';

const HomeAdmin = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('es-ES', { month: 'long' });
  const weekday = today.toLocaleString('es-ES', { weekday: 'long' });

  return (
    <section className='list-enter flex gap-4 max-w-7xl mx-auto'>
      <div className='flex-1 max-w-2xl'>
        <div className='mb-4'>
          <h1 className='h4 font-bold'>Hola, Hader</h1>
          <p className='text-secondary subtitle2'>
            {weekday.charAt(0).toUpperCase() + weekday.slice(1)}, {day} de {month.charAt(0).toUpperCase() + month.slice(1)}
          </p>
        </div>

        <div className='bg-primary text-on-primary content-box-small mb-4'>
          <span className='opacity-08 h5 font-light'>Ingresos</span>
          <span className='h3 font-bold'>$0,000</span>
        </div>

        <div className='content-box-outline-small'>
          <div className='flex flex-col mb-3'>
            <span className='subtitle2'>Viajes de hoy</span>
            <span className='h4'>
              {weekday.charAt(0).toUpperCase() + weekday.slice(1)}, {day} de {month.charAt(0).toUpperCase() + month.slice(1)}
            </span>
          </div>

          <div className='flex flex-col gap-2'>
            <div className='content-box-outline-2-small'>
              <div className='flex flex-col gap-2'>
                <div className='flex flex-col'>
                  <span className='subtitle2'>4:00AM | Alaskan</span>
                  <h2 className='h5'>Edson Mena</h2>
                </div>
                <div className='flex gap-2'>
                  <button className='btn btn-primary btn-lg font-medium'>
                    <md-icon slot="icon" className="text-sm">check</md-icon>
                    Marcar completado
                  </button>
                  <button className='btn btn-outline btn-lg flex items-center'>
                    <md-icon slot="edit" className="text-sm">edit</md-icon>
                    Editar
                  </button>
                </div>
              </div>
            </div>

            <div className='content-box-outline-2-small'>
              <div className='flex flex-col gap-2'>
                <div className='flex flex-col'>
                  <span className='subtitle2'>5:00AM | Sandro</span>
                  <h2 className='h5'>Miguel Muñoz</h2>
                </div>
                <div className='flex gap-2'>
                  <button className='btn btn-primary btn-lg font-medium'>
                    <md-icon slot="icon" className="text-sm">check</md-icon>
                    Marcar completado
                  </button>
                  <button className='btn btn-outline btn-lg flex items-center'>
                    <md-icon slot="edit" className="text-sm">edit</md-icon>
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-1 max-w-md content-box-outline-small'>
        <div className='mb-4'>
          <h1 className='h4 font-light text-white'>Resumen semanal</h1>
          <p className='text-secondary subtitle2'>
            Esta semana está ligeramente ocupada
          </p>
        </div>

        <div className='flex flex-col gap-3'>
          <div className='content-box-outline-3-small'>
            <div className='flex flex-col'>
              <span className='subtitle2 font-light'>Viajes esta semana</span>
              <h2 className='h3 text-white font-bold'>24 viajes</h2>
            </div>
          </div>

          <div className='content-box-outline-3-small'>
            <div className='flex flex-col gap-2'>
              <div>
                <span className='subtitle2 font-light'>Semana pasada</span>
                <h2 className='h3 text-white font-bold'>20 viajes</h2>
              </div>
              <button className='btn btn-primary btn-lg font-medium self-start'>
                <md-icon slot="icon" className="text-sm">keyboard_arrow_up</md-icon>
                + 4 Viajes
              </button>
            </div>
          </div>

          <div className='content-box-outline-3-small'>
            <div className='flex flex-col'>
              <span className='subtitle2 font-light'>Viajes de la semana</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeAdmin;