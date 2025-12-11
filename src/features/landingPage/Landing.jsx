import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@material/web/icon/icon.js';

const DestinosCarousel = ({ setFormData, scrollToSection }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const destinos = [
    {
      nombre: 'Medellín',
      imagen:
        'https://images.unsplash.com/photo-1599827633519-c5c793798cf8?q=80&w=2070&auto=format&fit=crop',
      rutas: '50+ rutas',
      descripcion: 'Ciudad de la eterna primavera',
    },
    {
      nombre: 'Quibdó',
      imagen:
        'https://images.unsplash.com/photo-1542456048-c26889700344?q=80&w=2070&auto=format&fit=crop',
      rutas: '25+ rutas',
      descripcion: 'Naturaleza y cultura chocoana',
    },
    {
      nombre: 'Raspadura',
      imagen:
        'https://images.unsplash.com/photo-1591823795328-86d7729623e8?q=80&w=2070&auto=format&fit=crop',
      rutas: '15+ rutas',
      descripcion: 'Pueblo tranquilo del Chocó',
    },
    {
      nombre: 'Bagadó',
      imagen:
        'https://images.unsplash.com/photo-1629814589718-2c26425ad509?q=80&w=2070&auto=format&fit=crop',
      rutas: '12+ rutas',
      descripcion: 'Riqueza cultural y natural',
    },
    {
      nombre: 'Lloró',
      imagen:
        'https://images.unsplash.com/photo-1622312675402-23cffaef353c?q=80&w=2070&auto=format&fit=crop',
      rutas: '10+ rutas',
      descripcion: 'El lugar más lluvioso de Colombia',
    },
    {
      nombre: 'Pereira',
      imagen:
        'https://images.unsplash.com/photo-1563202958-3d196420f12d?q=80&w=2070&auto=format&fit=crop',
      rutas: '45+ rutas',
      descripcion: 'La perla del Eje Cafetero',
    },
    {
      nombre: 'Condoto',
      imagen:
        'https://images.unsplash.com/photo-1589561253896-963c7601750b?q=80&w=2070&auto=format&fit=crop',
      rutas: '18+ rutas',
      descripcion: 'Tradición minera del Chocó',
    },
    {
      nombre: 'Istmina',
      imagen:
        'https://images.unsplash.com/photo-1628286539578-838634e4431e?q=80&w=2070&auto=format&fit=crop',
      rutas: '20+ rutas',
      descripcion: 'Corazón del San Juan',
    },
    {
      nombre: 'Tadó',
      imagen:
        'https://images.unsplash.com/photo-1583531352515-8884af319dc1?q=80&w=2070&auto=format&fit=crop',
      rutas: '14+ rutas',
      descripcion: 'Pueblo encantador chocoano',
    },
    {
      nombre: 'Yuto',
      imagen:
        'https://images.unsplash.com/photo-1629814589718-2c26425ad509?q=80&w=2070&auto=format&fit=crop',
      rutas: '8+ rutas',
      descripcion: 'Naturaleza virgen del Pacífico',
    },
    {
      nombre: 'Cali',
      imagen:
        'https://images.unsplash.com/photo-1543324151-6c17532386bb?q=80&w=2070&auto=format&fit=crop',
      rutas: '60+ rutas',
      descripcion: 'Capital mundial de la salsa',
    },
  ];

  const itemsPerView = 3;
  const maxIndex = destinos.length - itemsPerView;

  const next = () => setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  const prev = () => setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <md-icon className="text-blue-600">chevron_left</md-icon>
      </button>

      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      >
        <md-icon className="text-blue-600">chevron_right</md-icon>
      </button>

      <div className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {destinos.map((destino, idx) => (
            <div
              key={idx}
              onClick={() => {
                setFormData(prev => ({ ...prev, destino: destino.nombre }));
                scrollToSection('inicio');
              }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer shrink-0"
              style={{
                width: `calc(${100 / itemsPerView}% - ${(6 * (itemsPerView - 1)) / itemsPerView}px)`,
              }}
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={destino.imagen}
                  alt={destino.nombre}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <div className="flex items-center gap-2">
                    <md-icon className="text-blue-600 text-lg">route</md-icon>
                    <span className="text-sm font-bold text-gray-900">
                      {destino.rutas}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-3xl font-bold text-white mb-2">
                    {destino.nombre}
                  </h4>
                  <p className="text-white/90 text-sm flex items-center gap-2">
                    <md-icon className="text-lg">location_on</md-icon>
                    {destino.descripcion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-blue-600'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getTodayDate();

  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    fecha: today,
    tipoViaje: 'Hoy',
  });

  const [errors, setErrors] = useState({});

  const isPastDate = date => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clearError = field =>
    setErrors(prev => ({ ...prev, [field]: undefined }));

  const handleBuscar = e => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.origen.trim())
      newErrors.origen = 'Debes indicar la ciudad de origen';
    if (!formData.destino.trim())
      newErrors.destino = 'Debes indicar la ciudad de destino';
    if (
      formData.origen.trim() &&
      formData.destino.trim() &&
      formData.origen.trim().toLowerCase() ===
        formData.destino.trim().toLowerCase()
    ) {
      newErrors.destino = 'Origen y destino no pueden ser el mismo lugar';
    }

    if (!formData.fecha) newErrors.fecha = 'Debes seleccionar una fecha';
    else if (isPastDate(formData.fecha))
      newErrors.fecha = 'No puedes seleccionar una fecha pasada';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const queryParams = new URLSearchParams({
      origen: formData.origen,
      destino: formData.destino,
      fecha: formData.fecha,
      tipoViaje: formData.tipoViaje,
    });

    navigate(`/busqueda?${queryParams.toString()}`);
  };

  const handleFormChange = e => {
    const { name, value } = e.target;

    if (name === 'fecha' && isPastDate(value)) {
      setErrors(prev => ({
        ...prev,
        fecha: 'No puedes seleccionar una fecha pasada',
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    clearError(name);

    if (
      (name === 'origen' && formData.destino) ||
      (name === 'destino' && formData.origen)
    ) {
      setErrors(prev => ({ ...prev, destino: undefined }));
    }
  };

  const handleTipoViaje = tipo => {
    const fechaBase = new Date();
    if (tipo === 'Mañana') fechaBase.setDate(fechaBase.getDate() + 1);
    const fechaISO = fechaBase.toISOString().split('T')[0];

    setFormData(prev => ({ ...prev, tipoViaje: tipo, fecha: fechaISO }));
    clearError('fecha');
  };

  const scrollToSection = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white text-gray-900 font-sans overflow-x-hidden">
      <nav
        className={`fixed top-0 z-50 flex justify-between items-center px-6 md:px-10 py-4 transition-all duration-500 ${
          scrolled
            ? 'left-4 right-4 top-4 bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl'
            : 'left-0 right-0 bg-linear-to-b from-black/50 to-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md transition-all duration-500`}
          >
            <span className="text-white font-bold text-lg">LT</span>
          </div>
          <span
            className={`font-bold text-xl transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}
          >
            La Tribu
          </span>
        </div>

        <ul
          className={`hidden md:flex space-x-8 text-sm font-medium transition-colors duration-300 ${scrolled ? 'text-gray-700' : 'text-white'}`}
        >
          {['Inicio', 'Destinos', 'Nosotros', 'Beneficios'].map(item => (
            <li
              key={item}
              onClick={() => scrollToSection(item.toLowerCase())}
              className="hover:text-blue-500 cursor-pointer transition-all duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
        >
          Iniciar sesión
        </button>
      </nav>

      <section
        id="inicio"
        className="relative min-h-[650px] flex items-center px-4 md:px-8 pt-20 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=2071&auto=format&fit=crop"
            alt="Bus moderno"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-r from-gray-900/85 via-gray-900/60 to-gray-900/30" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-2xl p-6">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Reserva tu viaje
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Encuentra el viaje perfecto para ti
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleBuscar} noValidate>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">
                      Origen
                    </label>
                    <div className="relative">
                      <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 text-lg">
                        location_on
                      </md-icon>
                      <input
                        type="text"
                        name="origen"
                        placeholder="Ciudad de origen"
                        value={formData.origen}
                        onChange={handleFormChange}
                        className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${errors.origen ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {errors.origen && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.origen}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">
                      Destino
                    </label>
                    <div className="relative">
                      <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 text-lg">
                        flag
                      </md-icon>
                      <input
                        type="text"
                        name="destino"
                        placeholder="Ciudad de destino"
                        value={formData.destino}
                        onChange={handleFormChange}
                        className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${errors.destino ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {errors.destino && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.destino}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">
                      Fecha de viaje
                    </label>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {['Hoy', 'Mañana'].map(tipo => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => handleTipoViaje(tipo)}
                          className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                            formData.tipoViaje === tipo
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 text-lg">
                        event
                      </md-icon>
                      <input
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        min={today}
                        onChange={handleFormChange}
                        className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-xs focus:outline-none focus:ring-2 ${errors.fecha ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {errors.fecha && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.fecha}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
                  >
                    <md-icon className="text-lg">search</md-icon>
                    Buscar viajes
                  </button>
                </form>
              </div>
            </div>

            <div className="md:col-span-3 text-white space-y-6 md:pl-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                Viajar está a un
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                  clic de distancia
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl">
                Compra tus tiquetes de forma rápida, segura y sin complicaciones
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                  <md-icon className="text-cyan-400">verified</md-icon>
                  <span className="text-sm font-semibold">Viajes seguros</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                  <md-icon className="text-cyan-400">schedule</md-icon>
                  <span className="text-sm font-semibold">
                    Puntualidad garantizada
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                  <md-icon className="text-cyan-400">support_agent</md-icon>
                  <span className="text-sm font-semibold">Atención 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="destinos"
        className="px-4 md:px-8 py-20 bg-linear-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold mb-3">
              Destinos populares
            </p>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Descubre Colombia
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Conectamos los destinos más importantes del país
            </p>
          </div>

          <DestinosCarousel
            setFormData={setFormData}
            scrollToSection={scrollToSection}
          />
        </div>
      </section>

      <section id="nosotros" className="px-4 md:px-20 py-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-blue-600 font-semibold">Nuestra historia</p>
              <h3 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                Más de 20 años conectando destinos
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                En <span className="font-bold text-blue-600">La Tribu</span>,
                somos más que una empresa de transporte. Somos tu compañero de
                viaje, comprometidos con llevar a cada pasajero de manera
                segura, cómoda y puntual.
              </p>

              <div className="space-y-4">
                {[
                  { icon: 'verified', text: 'Flota moderna y tecnológica' },
                  { icon: 'badge', text: 'Conductores certificados' },
                  { icon: 'support_agent', text: 'Atención 24/7' },
                  { icon: 'paid', text: 'Precios transparentes' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <md-icon className="text-blue-600">{item.icon}</md-icon>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6">
                {[
                  { num: '500K+', label: 'Pasajeros' },
                  { num: '50+', label: 'Destinos' },
                  { num: '99%', label: 'Satisfacción' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl font-black text-blue-600 mb-1">
                      {stat.num}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                  alt="Buses modernos"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-4xl font-black mb-1">20+</div>
                <div className="text-sm font-semibold">Años de experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="px-4 md:px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold mb-3">Beneficios</p>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              ¿Por qué elegir La Tribu?
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: 'Seguridad Certificada',
                text: 'Flota con GPS y conductores certificados.',
              },
              {
                title: 'Cobertura Nacional',
                text: 'Más de 50 ciudades conectadas.',
              },
              {
                title: 'Tarifas Claras',
                text: 'Sin cargos ocultos ni sorpresas.',
              },
              { title: 'Soporte 24/7', text: 'Siempre disponibles para ti.' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <h4 className="font-bold text-lg mb-2 text-gray-900">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 shadow-xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { num: '4.8/5', label: 'Calificación' },
                { num: '500K+', label: 'Pasajeros/año' },
                { num: '98%', label: 'Puntualidad' },
                { num: '50+', label: 'Destinos' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl font-black text-white mb-2">
                    {stat.num}
                  </div>
                  <div className="text-blue-100 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer id="contacto" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-xl mb-4">
                LT
              </div>
              <p className="text-gray-400 text-sm">
                Tu compañero de viaje confiable desde hace más de 20 años.
              </p>
            </div>

            <div>
              <h5 className="font-bold mb-4">Enlaces</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                {['Inicio', 'Nosotros', 'Destinos', 'Beneficios'].map(link => (
                  <li
                    key={link}
                    onClick={() => scrollToSection(link.toLowerCase())}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="hover:text-white cursor-pointer">Términos</li>
                <li className="hover:text-white cursor-pointer">Privacidad</li>
                <li className="hover:text-white cursor-pointer">Políticas</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-4">Contacto</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <md-icon className="text-blue-400 text-lg">phone</md-icon>+57
                  300 123 4567
                </li>
                <li className="flex items-center gap-2">
                  <md-icon className="text-blue-400 text-lg">email</md-icon>
                  info@latribu.com
                </li>
                <li className="flex items-center gap-2">
                  <md-icon className="text-blue-400 text-lg">
                    location_on
                  </md-icon>
                  Medellín, Colombia
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 La Tribu. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
