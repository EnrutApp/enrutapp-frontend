import '@material/web/icon/icon.js';

const HomeUsuario = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('es-ES', { month: 'long' });
  const weekday = today.toLocaleString('es-ES', { weekday: 'long' });

  // Datos de ejemplo para viajes de hoy
  const viajesToday = [
    {
      id: 1,
      hora: '4:00 AM',
      cupos: '3 Cupos disponibles',
      origen: 'Medellín',
      destino: 'Quibdó',
      estado: 'Comprar'
    },
    {
      id: 2,
      hora: '4:00 AM',
      cupos: '4 Cupos disponibles',
      origen: 'Quibdó',
      destino: 'Medellín',
      estado: 'Comprar'
    }
  ];

  const acciones = [
    {
      id: 1,
      titulo: 'Comprar tiquetes',
      descripcion: 'Aquí podrás comprar un tiquete para hoy o mañana.',
      icon: 'shopping_cart'
    },
    {
      id: 2,
      titulo: 'Hacer reserva',
      descripcion: 'Aquí podrás fletar un viaje sea para cuando sea.',
      icon: 'event_note'
    },
    {
      id: 3,
      titulo: 'Enviar encomiendo',
      descripcion: 'Envíla una encomiendo a alguien.',
      icon: 'local_shipping'
    }
  ];

  return (
    <section className="list-enter flex gap-4 max-w-7xl mx-auto">
      <div className="flex-1 max-w-2xl">
        {/* Encabezado de bienvenida */}
        <div className="mb-4">
          <h1 className="h4 font-bold">Hola, Andres</h1>
          <p className="text-secondary subtitle2">
            {day} de {month.charAt(0).toUpperCase() + month.slice(1)}
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="bg-primary text-on-primary content-box-small mb-4">
          <span className="opacity-08 h5 font-light">Servicios realizados</span>
          <span className="h3 font-bold">12 Servicios</span>
        </div>

        {/* Viajes de hoy */}
        <div className="content-box-outline-small">
          <div className="flex flex-col mb-3">
            <span className="subtitle2">Viajes de hoy</span>
            <span className="h4">
              {day} de {month.charAt(0).toUpperCase() + month.slice(1)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {viajesToday.map((viaje) => (
              <div key={viaje.id} className="content-box-outline-2-small">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <span className="subtitle2">{viaje.hora} | {viaje.cupos}</span>
                    <h2 className="h5">
                      {viaje.origen}•{viaje.destino}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-primary btn-lg font-medium">
                      {viaje.estado}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex-1 max-w-md">
        <div className="mb-4">
          <h1 className="h4 font-light text-primary">Acciones</h1>
          <p className="text-secondary subtitle2">
            Aquí encontras acciones rápidas
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {acciones.map((accion) => (
            <button
              key={accion.id}
              className="bg-primary text-on-primary content-box-small hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex flex-col gap-2">
                <h3 className="h5 font-bold">{accion.titulo}</h3>
                <p className="text-sm opacity-80">{accion.descripcion}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeUsuario;
