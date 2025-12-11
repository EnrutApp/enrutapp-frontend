import React, { useState } from 'react';
import '@material/web/icon/icon.js';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResultadosBusqueda = ({ datosIniciales, onVolverInicio }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [scrolled, setScrolled] = useState(false);
  const [filtroHorario, setFiltroHorario] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [busqueda, setBusqueda] = useState({
    origen: searchParams.get('origen') || datosIniciales?.origen || 'Medellín',
    destino:
      searchParams.get('destino') || datosIniciales?.destino || 'Cartagena',
    fecha: searchParams.get('fecha') || datosIniciales?.fecha || getTodayDate(),
    fechaRegreso: searchParams.get('fechaRegreso') || null,
  });

  const generarViajes = () => {
    const periodos = [
      {
        id: 'manana',
        hora: '06:30',
        icono: 'wb_sunny',
        horaLlegada: '2:00 PM',
      },
      {
        id: 'tarde',
        hora: '02:00',
        icono: 'wb_twilight',
        horaLlegada: '10:30 PM',
      },
      {
        id: 'noche',
        hora: '09:30',
        icono: 'nights_stay',
        horaLlegada: '5:30 AM',
        periodo: 'PM',
      },
      {
        id: 'madrugada',
        hora: '12:30',
        icono: 'bedtime',
        horaLlegada: '8:30 AM',
        periodo: 'AM',
      },
    ];

    return periodos.map((periodo, index) => {
      const hora = periodo.hora;
      const horaPeriodo = periodo.periodo || 'AM';
      return {
        id: index + 1,
        empresa: 'La Tribu',
        categoria: index % 2 === 0 ? 'Diamante' : 'Premium',
        categoriaDesc:
          index % 2 === 0 ? 'Preferencial de Lujo' : 'Preferencial',
        horaSalida: `${hora} ${horaPeriodo}`,
        horaLlegada: periodo.horaLlegada,
        origenTerminal: `${busqueda.origen.toUpperCase()} TERMINAL`,
        destinoTerminal: `${busqueda.destino.toUpperCase()} TERMINAL`,
        rutas: 1,
        precio: index % 2 === 0 ? 178000 : 165000,
        precioAnterior: index % 2 === 0 ? 196000 : 182000,
        icono: periodo.icono,
        etiqueta: index === 0 ? 'Más rápido' : null,
        disponible: true,
      };
    });
  };

  const viajes = generarViajes();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatearFecha = fechaISO => {
    const fecha = new Date(fechaISO + 'T00:00:00');
    const meses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    return `${fecha.getDate()}-${meses[fecha.getMonth()]}-${fecha.getFullYear().toString().slice(2)}`;
  };

  const formatearPrecio = precio => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const handleNuevaBusqueda = () => {
    console.log('Nueva búsqueda:', busqueda);
  };

  const handleIntercambiar = () => {
    setBusqueda(prev => ({
      ...prev,
      origen: prev.destino,
      destino: prev.origen,
    }));
  };

  const viajesFiltrados = viajes.filter(viaje => {
    if (filtroHorario === 'todos') return true;
    const hora = parseInt(viaje.horaSalida.split(':')[0]);
    const periodo = viaje.horaSalida.includes('PM') ? hora + 12 : hora;

    if (filtroHorario === 'manana') return periodo >= 6 && periodo < 12;
    if (filtroHorario === 'tarde') return periodo >= 12 && periodo < 18;
    if (filtroHorario === 'noche') return periodo >= 18 && periodo < 24;
    if (filtroHorario === 'madrugada') return periodo >= 0 && periodo < 6;
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg' : 'bg-blue-700'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md cursor-pointer"
                onClick={() => navigate('/')}
              >
                <span className="text-white font-bold text-lg">LT</span>
              </div>
              <span
                onClick={() => navigate('/')}
                className={`font-bold text-xl transition-colors cursor-pointer ${
                  scrolled ? 'text-gray-900' : 'text-white'
                }`}
              >
                La Tribu
              </span>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <md-icon className="text-xl">person</md-icon>
              <span className="text-sm font-semibold">Iniciar sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="bg-blue-700 pt-20 pb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-white/90 text-sm mb-4">
            ¡Bienvenido a La Tribu! Recuerda: los precios online son exclusivos
            de nuestra web y pueden cambiar en otros puntos de venta
          </p>

          <div className="bg-white rounded-xl shadow-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Origen
                </label>
                <div className="relative">
                  <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                    location_on
                  </md-icon>
                  <input
                    type="text"
                    placeholder="Ciudad de origen"
                    value={busqueda.origen}
                    onChange={e =>
                      setBusqueda(prev => ({ ...prev, origen: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  onClick={handleIntercambiar}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <md-icon className="text-blue-600">swap_horiz</md-icon>
                </button>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Destino
                </label>
                <div className="relative">
                  <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                    flag
                  </md-icon>
                  <input
                    type="text"
                    placeholder="Ciudad de destino"
                    value={busqueda.destino}
                    onChange={e =>
                      setBusqueda(prev => ({
                        ...prev,
                        destino: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Fecha de Ida
                </label>
                <div className="relative">
                  <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                    event
                  </md-icon>
                  <input
                    type="date"
                    value={busqueda.fecha}
                    min={getTodayDate()}
                    onChange={e =>
                      setBusqueda(prev => ({ ...prev, fecha: e.target.value }))
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Fecha de Regreso (Opcional)
                </label>
                <div className="relative">
                  <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">
                    event
                  </md-icon>
                  <input
                    type="date"
                    value={busqueda.fechaRegreso || ''}
                    min={getTodayDate()}
                    onChange={e =>
                      setBusqueda(prev => ({
                        ...prev,
                        fechaRegreso: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <button
                  onClick={handleNuevaBusqueda}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <md-icon>search</md-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Seleccionar horario de ida{' '}
            <span className="text-gray-600 font-normal text-lg">
              {formatearFecha(busqueda.fecha)}
            </span>
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'todos', label: 'Todos', icon: 'schedule' },
              { id: 'manana', label: 'Mañana', icon: 'wb_sunny' },
              { id: 'tarde', label: 'Tarde', icon: 'wb_twilight' },
              { id: 'noche', label: 'Noche', icon: 'nights_stay' },
              { id: 'madrugada', label: 'Madrugada', icon: 'bedtime' },
            ].map(filtro => (
              <button
                key={filtro.id}
                onClick={() => setFiltroHorario(filtro.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  filtroHorario === filtro.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <md-icon className="text-lg">{filtro.icon}</md-icon>
                {filtro.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Viajes recomendados
          </h3>
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            PARA TI
          </span>
        </div>

        <div className="space-y-4">
          {viajesFiltrados.map((viaje, index) => (
            <div
              key={viaje.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="grid md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xl">
                          LT
                        </span>
                      </div>
                      <div className="text-center">
                        <h4 className="text-blue-600 font-bold text-sm">
                          {viaje.categoria}
                        </h4>
                        <p className="text-gray-500 text-xs">
                          {viaje.categoriaDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <md-icon className="text-2xl text-gray-700">
                            {viaje.icono}
                          </md-icon>
                          <span className="text-3xl font-black text-gray-900">
                            {viaje.horaSalida}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          {viaje.origenTerminal}
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-1 px-4">
                        <span className="text-xs text-gray-500 font-medium">
                          {viaje.rutas} ruta
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-0.5 w-12 bg-gray-300"></div>
                          <md-icon className="text-blue-600 text-xl">
                            arrow_forward
                          </md-icon>
                          <div className="h-0.5 w-12 bg-gray-300"></div>
                        </div>
                      </div>

                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-3xl font-black text-gray-900">
                            {viaje.horaLlegada}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          {viaje.destinoTerminal}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      {index === 0 && (
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <md-icon className="text-purple-600 text-sm">
                            bolt
                          </md-icon>
                          <span className="text-purple-600 text-xs font-bold">
                            {viaje.etiqueta}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-gray-400 line-through text-sm">
                          Anterior: {formatearPrecio(viaje.precioAnterior)}
                        </span>
                      </div>
                      <div className="text-3xl font-black text-blue-600">
                        {formatearPrecio(viaje.precio)}
                      </div>
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg whitespace-nowrap">
                      Ver sillas
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                    Ver detalles
                    <md-icon className="text-lg">chevron_right</md-icon>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {viajesFiltrados.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <md-icon className="text-6xl text-gray-300 mb-4">
              search_off
            </md-icon>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No hay viajes disponibles
            </h3>
            <p className="text-gray-600">
              Intenta seleccionar otro horario o fecha
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultadosBusqueda;
