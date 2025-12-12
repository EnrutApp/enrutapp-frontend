import React, { useState, useCallback, useEffect } from "react";
import "@material/web/icon/icon.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import CityAutocomplete from "./components/CityAutocomplete";
import SeatsModal from "./components/SeatsModal";
import viajeService from "../../shared/services/viajeService";
import ubicacionesService from "../ubicaciones/api/ubicacionesService";

// Obtener fecha de hoy en formato local correcto (no UTC)
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ResultadosBusqueda = ({ datosIniciales, onVolverInicio }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [scrolled, setScrolled] = useState(false);
  const [filtroHorario, setFiltroHorario] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seatsModalOpen, setSeatsModalOpen] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState(null);
  const [viajes, setViajes] = useState([]);
  const [error, setError] = useState(null);

  const [ubicacionesItems, setUbicacionesItems] = useState([]);
  const [ubicacionesReady, setUbicacionesReady] = useState(false);

  // Estado temporal para el formulario (no se aplica hasta buscar)
  const [formTemporal, setFormTemporal] = useState({
    origenId: searchParams.get("origenId") || datosIniciales?.origenId || "",
    destinoId: searchParams.get("destinoId") || datosIniciales?.destinoId || "",
    origen: searchParams.get("origen") || datosIniciales?.origen || "",
    destino: searchParams.get("destino") || datosIniciales?.destino || "",
    fecha: searchParams.get("fecha") || datosIniciales?.fecha || getTodayDate(),
    fechaRegreso: searchParams.get("fechaRegreso") || null
  });

  // Estado actual de búsqueda (lo que se muestra)
  const [busqueda, setBusqueda] = useState(formTemporal);

  // Obtener viajes desde la API
  const obtenerViajes = useCallback(async (origen, destino, origenId, destinoId, fecha, fechaRegreso) => {
    try {
      setIsLoading(true);
      setError(null);

      const viajesCargados = await viajeService.buscarViajes({
        origen,
        destino,
        origenId,
        destinoId,
        fecha,
        fechaRegreso
      });

      setViajes(viajesCargados || []);
    } catch (err) {
      console.error("Error al obtener viajes:", err);
      setError("Error al cargar los viajes disponibles");
      setViajes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cargar viajes cuando se monta el componente o cuando cambia la búsqueda
  useEffect(() => {
    const tieneOrigen = Boolean(busqueda.origenId || busqueda.origen);
    const tieneDestino = Boolean(busqueda.destinoId || busqueda.destino);

    if (!tieneOrigen || !tieneDestino) {
      setViajes([]);
      return;
    }

    obtenerViajes(
      busqueda.origen,
      busqueda.destino,
      busqueda.origenId,
      busqueda.destinoId,
      busqueda.fecha,
      busqueda.fechaRegreso
    );
  }, [busqueda, obtenerViajes]);

  useEffect(() => {
    let mounted = true;

    const loadUbicaciones = async () => {
      try {
        const res = await ubicacionesService.getAll();
        const data = Array.isArray(res) ? res : res?.data || [];

        const mapped = data
          .map((u) => ({
            idUbicacion: u.idUbicacion || u.id,
            city: u.nombreUbicacion || u.nombre,
            department: u.direccion || '',
            estado: u.estado !== undefined ? u.estado : u.activo,
          }))
          .filter((u) => u.idUbicacion && u.city)
          .filter((u) => u.estado !== false);

        if (mounted) {
          setUbicacionesItems(mapped);
          setUbicacionesReady(true);
        }
      } catch (_) {
        if (mounted) {
          setUbicacionesItems([]);
          setUbicacionesReady(true);
        }
      }
    };

    loadUbicaciones();
    return () => {
      mounted = false;
    };
  }, []);

  // Si llegan IDs (por query) pero no texto, rellenar desde ubicaciones.
  useEffect(() => {
    if (!ubicacionesReady || ubicacionesItems.length === 0) return;

    setFormTemporal((prev) => {
      const next = { ...prev };
      if (prev.origenId && !prev.origen) {
        const found = ubicacionesItems.find((u) => String(u.idUbicacion) === String(prev.origenId));
        if (found) next.origen = found.city;
      }
      if (prev.destinoId && !prev.destino) {
        const found = ubicacionesItems.find((u) => String(u.idUbicacion) === String(prev.destinoId));
        if (found) next.destino = found.city;
      }
      return next;
    });
  }, [ubicacionesReady, ubicacionesItems]);

  // También mantener el estado de búsqueda sincronizado si se rellenó texto.
  useEffect(() => {
    setBusqueda(formTemporal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formTemporal.origenId, formTemporal.destinoId]);

  const parseHoraTo24 = (hora) => {
    const raw = String(hora || '').trim();
    if (!raw) return null;

    // Formato HH:mm (24h)
    const m24 = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (m24) {
      const h = Number.parseInt(m24[1], 10);
      const mm = Number.parseInt(m24[2], 10);
      if (!Number.isFinite(h) || !Number.isFinite(mm)) return null;
      if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
      return h;
    }

    // Formato h:mm AM/PM
    const m12 = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (m12) {
      let h = Number.parseInt(m12[1], 10);
      const mm = Number.parseInt(m12[2], 10);
      const periodo = m12[3].toUpperCase();
      if (h < 1 || h > 12 || mm < 0 || mm > 59) return null;
      if (periodo === 'PM' && h !== 12) h += 12;
      if (periodo === 'AM' && h === 12) h = 0;
      return h;
    }

    return null;
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO + 'T00:00:00');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${fecha.getDate()}-${meses[fecha.getMonth()]}-${fecha.getFullYear().toString().slice(2)}`;
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const handleNuevaBusqueda = useCallback(async () => {
    // Si hay catálogo de ubicaciones, intentamos resolver IDs (sin depender de setState async).
    const origenResolvedId =
      ubicacionesItems.length > 0
        ? formTemporal.origenId ||
        (formTemporal.origen
          ? ubicacionesItems.find(
            u => u.city.toLowerCase() === formTemporal.origen.toLowerCase()
          )?.idUbicacion
          : "")
        : formTemporal.origenId;

    const destinoResolvedId =
      ubicacionesItems.length > 0
        ? formTemporal.destinoId ||
        (formTemporal.destino
          ? ubicacionesItems.find(
            u => u.city.toLowerCase() === formTemporal.destino.toLowerCase()
          )?.idUbicacion
          : "")
        : formTemporal.destinoId;

    if (ubicacionesItems.length > 0) {
      if (!origenResolvedId) {
        alert("Selecciona un origen válido");
        return;
      }
      if (!destinoResolvedId) {
        alert("Selecciona un destino válido");
        return;
      }
    }

    const busquedaToApply = {
      ...formTemporal,
      origenId: origenResolvedId || "",
      destinoId: destinoResolvedId || "",
    };

    // Validar que origen y destino sean diferentes
    if (busquedaToApply.origenId && busquedaToApply.destinoId) {
      if (String(busquedaToApply.origenId) === String(busquedaToApply.destinoId)) {
        alert("El origen y destino no pueden ser iguales");
        return;
      }
    } else if (
      busquedaToApply.origen &&
      busquedaToApply.destino &&
      busquedaToApply.origen.toLowerCase() === busquedaToApply.destino.toLowerCase()
    ) {
      alert("El origen y destino no pueden ser iguales");
      return;
    }

    // Aplicar los cambios
    setBusqueda(busquedaToApply);

    // Obtener viajes desde la API
    await obtenerViajes(
      busquedaToApply.origen,
      busquedaToApply.destino,
      busquedaToApply.origenId,
      busquedaToApply.destinoId,
      busquedaToApply.fecha,
      busquedaToApply.fechaRegreso
    );
  }, [formTemporal, obtenerViajes, ubicacionesItems]);

  const handleIntercambiar = useCallback(() => {
    setFormTemporal(prev => ({
      ...prev,
      origen: prev.destino,
      destino: prev.origen,
      origenId: prev.destinoId,
      destinoId: prev.origenId,
    }));
  }, []);

  const viajesFiltrados = viajes.filter(viaje => {
    if (filtroHorario === "todos") return true;
    const periodo = parseHoraTo24(viaje.horaSalida);
    if (periodo === null) return true;

    if (filtroHorario === "manana") return periodo >= 6 && periodo < 12;
    if (filtroHorario === "tarde") return periodo >= 12 && periodo < 18;
    if (filtroHorario === "noche") return periodo >= 18 && periodo < 24;
    if (filtroHorario === "madrugada") return periodo >= 0 && periodo < 6;
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navegación */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-lg" : "bg-blue-700"
        }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md cursor-pointer" onClick={() => navigate('/')}>
                <span className="text-white font-bold text-lg">LT</span>
              </div>
              <span
                onClick={() => navigate('/')}
                className={`font-bold text-xl transition-colors cursor-pointer ${scrolled ? "text-gray-900" : "text-white"
                  }`}>
                La Tribu
              </span>
            </div>

            <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <md-icon className="text-xl">person</md-icon>
              <span className="text-sm font-semibold">Iniciar sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Banner de búsqueda */}
      <div className="bg-blue-700 pt-20 pb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="text-white/90 text-sm mb-4">
            ¡Bienvenido a La Tribu! Recuerda: los precios online son exclusivos de nuestra web y pueden cambiar en otros puntos de venta
          </p>

          <div className="bg-white rounded-xl shadow-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Origen</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none z-20">
                    <md-icon>location_on</md-icon>
                  </div>
                  <CityAutocomplete
                    value={formTemporal.origen}
                    onChange={(value) => setFormTemporal(prev => ({ ...prev, origen: value, origenId: "" }))}
                    onSelect={(city) => setFormTemporal(prev => ({ ...prev, origen: city.city, origenId: city.idUbicacion || city.id || "" }))}
                    placeholder="Ciudad de origen"
                    items={ubicacionesItems}
                    inputClassName="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  onClick={handleIntercambiar}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <md-icon className="text-blue-600">swap_horiz</md-icon>
                </button>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-700 mb-2 block">Destino</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none z-20">
                    <md-icon>flag</md-icon>
                  </div>
                  <CityAutocomplete
                    value={formTemporal.destino}
                    onChange={(value) => setFormTemporal(prev => ({ ...prev, destino: value, destinoId: "" }))}
                    onSelect={(city) => setFormTemporal(prev => ({ ...prev, destino: city.city, destinoId: city.idUbicacion || city.id || "" }))}
                    placeholder="Ciudad de destino"
                    items={ubicacionesItems}
                    inputClassName="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Fecha de Ida</label>
                <div className="relative">
                  <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">event</md-icon>
                  <input
                    type="date"
                    value={formTemporal.fecha}
                    min={getTodayDate()}
                    onChange={(e) => setFormTemporal(prev => ({ ...prev, fecha: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Fecha de Regreso (Opcional)</label>
                <div className="relative">
                  <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600">event</md-icon>
                  <input
                    type="date"
                    value={formTemporal.fechaRegreso || ''}
                    min={getTodayDate()}
                    onChange={(e) => setFormTemporal(prev => ({ ...prev, fechaRegreso: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-blue-300 rounded-lg text-sm font-semibold text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <button
                  onClick={handleNuevaBusqueda}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <md-icon className="animate-spin">refresh</md-icon>
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <md-icon>search</md-icon>
                      <span className="hidden sm:inline">Buscar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Encabezado de resultados */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Seleccionar horario de ida <span className="text-gray-600 font-normal text-lg">{formatearFecha(busqueda.fecha)}</span>
          </h2>
        </div>

        {/* Filtros de horario */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {[
              { id: "todos", label: "Todos", icon: "schedule" },
              { id: "manana", label: "Mañana", icon: "wb_sunny" },
              { id: "tarde", label: "Tarde", icon: "wb_twilight" },
              { id: "noche", label: "Noche", icon: "nights_stay" },
              { id: "madrugada", label: "Madrugada", icon: "bedtime" }
            ].map(filtro => (
              <button
                key={filtro.id}
                onClick={() => setFiltroHorario(filtro.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${filtroHorario === filtro.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <md-icon className="text-lg">{filtro.icon}</md-icon>
                {filtro.label}
              </button>
            ))}
          </div>
        </div>

        {/* Etiqueta de viajes recomendados */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Viajes recomendados</h3>
          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            PARA TI
          </span>
        </div>

        {/* Mostrar error si hay */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
            <p className="text-red-700 font-semibold flex items-center gap-2">
              <md-icon className="text-red-600">error</md-icon>
              {error}
            </p>
          </div>
        )}

        {/* Mostrar loader si está cargando */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <md-icon className="text-blue-600 text-4xl animate-spin">refresh</md-icon>
              <p className="text-gray-600 font-semibold">Cargando viajes disponibles...</p>
            </div>
          </div>
        )}

        {/* Mostrar mensaje si no hay viajes */}
        {!isLoading && viajes.length === 0 && !error && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-8 text-center">
            <md-icon className="text-blue-600 text-4xl mb-3 block">info</md-icon>
            <p className="text-gray-700 font-semibold">No hay viajes disponibles para esta ruta</p>
            <p className="text-gray-500 text-sm mt-1">Intenta con otras fechas u otra ruta</p>
          </div>
        )}

        {/* Lista de viajes */}
        <div className="space-y-4">
          {viajesFiltrados.map((viaje, index) => (
            <div
              key={viaje.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="grid md:grid-cols-12 gap-6 items-center">
                  {/* Logo y categoría */}
                  <div className="md:col-span-2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xl">LT</span>
                      </div>
                      <div className="text-center">
                        <h4 className="text-blue-600 font-bold text-sm">{viaje.categoria}</h4>
                        <p className="text-gray-500 text-xs">{viaje.categoriaDesc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="md:col-span-6">
                    <div className="flex items-center gap-4">
                      {/* Salida */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <md-icon className="text-2xl text-gray-700">{viaje.icono}</md-icon>
                          <span className="text-3xl font-black text-gray-900">{viaje.horaSalida}</span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{viaje.origenTerminal}</p>
                      </div>

                      {/* Ruta */}
                      <div className="flex flex-col items-center gap-1 px-4">
                        <span className="text-xs text-gray-500 font-medium">{viaje.rutas} ruta</span>
                        <div className="flex items-center gap-2">
                          <div className="h-0.5 w-12 bg-gray-300"></div>
                          <md-icon className="text-blue-600 text-xl">arrow_forward</md-icon>
                          <div className="h-0.5 w-12 bg-gray-300"></div>
                        </div>
                      </div>

                      {/* Llegada */}
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <span className="text-3xl font-black text-gray-900">{viaje.horaLlegada}</span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{viaje.destinoTerminal}</p>
                      </div>
                    </div>
                  </div>

                  {/* Precio y acción */}
                  <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      {index === 0 && (
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <md-icon className="text-purple-600 text-sm">bolt</md-icon>
                          <span className="text-purple-600 text-xs font-bold">{viaje.etiqueta}</span>
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

                    <button
                      onClick={() => {
                        setSelectedViaje(viaje);
                        setSeatsModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg whitespace-nowrap">
                      Ver sillas
                    </button>
                  </div>
                </div>

                {/* Enlace ver detalles */}
                {/* Removido: Ver detalles */}
              </div>
            </div>
          ))}
        </div>

        {/* Sin resultados */}
        {viajesFiltrados.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <md-icon className="text-6xl text-gray-300 mb-4">search_off</md-icon>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No hay viajes disponibles
            </h3>
            <p className="text-gray-600">
              Intenta seleccionar otro horario o fecha
            </p>
          </div>
        )}
      </div>

      {/* Modal de sillas */}
      <SeatsModal
        isOpen={seatsModalOpen}
        onClose={() => {
          setSeatsModalOpen(false);
          setSelectedViaje(null);
        }}
        viaje={selectedViaje}
      />
    </div>
  );
};

export default ResultadosBusqueda;