import { useState } from 'react';
import '@material/web/icon/icon.js';
import Calendar from '../../../shared/components/calendar/Calendar';

const HomeConductor = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleString('es-ES', { month: 'long' });

  // Datos de ejemplo para servicios
  const servicios = [
    {
      id: 1,
      hora: '4:00 AM',
      cupos: '3 Cupos disponibles',
      origen: 'Medellín',
      destino: 'Quibdó',
      estado: 'Completar'
    },
    {
      id: 2,
      hora: '4:00 AM',
      cupos: '3 Cupos disponibles',
      origen: 'Medellín',
      destino: 'Quibdó',
      estado: 'Completar'
    }
  ];

  const filtros = ['Pendientes', 'Completado'];
  const [filtroActivo, setFiltroActivo] = useState('Pendientes');

  return (
    <section className="list-enter flex gap-4 w-full">
      <div className="flex-1 w-full">
        {/* Encabezado de bienvenida */}
        <div className="mb-4">
          <h1 className="h4 font-bold">Hola, Camilo</h1>
          <p className="text-secondary subtitle2">
            {day} de {month.charAt(0).toUpperCase() + month.slice(1)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Contenido principal - 2 columnas */}
          <div className="col-span-2">
            {/* Tarjeta de servicios para hoy */}
            <div className="bg-primary text-on-primary content-box-small mb-4">
              <span className="opacity-08 h5 font-light">Servicios para hoy</span>
              <span className="h3 font-bold">2 Servicios</span>
            </div>

            {/* Servicios de hoy con filtros */}
            <div className="content-box-outline-small mb-4">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-col">
                  <span className="subtitle2">Servicios de hoy</span>
                  <span className="h4">
                    {day} de {month.charAt(0).toUpperCase() + month.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {filtros.map((filtro) => (
                    <button
                      key={filtro}
                      onClick={() => setFiltroActivo(filtro)}
                      className={`btn btn-sm font-medium ${
                        filtroActivo === filtro
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                    >
                      {filtro}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de servicios */}
              <div className="flex flex-col gap-2">
                {servicios.map((servicio) => (
                  <div key={servicio.id} className="content-box-outline-2-small">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <span className="subtitle2">
                          {servicio.hora} | {servicio.cupos}
                        </span>
                        <h2 className="h5">
                          {servicio.origen}•{servicio.destino}
                        </h2>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-primary btn-lg font-medium">
                          <md-icon slot="icon" className="text-sm">
                            check
                          </md-icon>
                          {servicio.estado}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendario - 1 columna */}
          <div className="col-span-1">
            <Calendar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeConductor;
