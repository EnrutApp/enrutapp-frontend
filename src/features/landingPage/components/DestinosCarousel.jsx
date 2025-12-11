import React, { useState, useEffect, useCallback, memo } from "react";
import "@material/web/icon/icon.js";

// Componente para cada tarjeta de destino
const DestinoCard = memo(({ destino, index, itemsPerView, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(destino.nombre)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer flex-shrink-0"
      style={{ width: `calc(${100 / itemsPerView}% - ${(6 * (itemsPerView - 1)) / itemsPerView}px)` }}
    >
      <div className="relative h-72 overflow-hidden">
        {/* Imagen con lazy loading */}
        <img
          src={destino.imagen}
          alt={destino.nombre}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Badge de rutas */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <div className="flex items-center gap-2">
            <md-icon className="text-blue-600 text-lg">route</md-icon>
            <span className="text-sm font-bold text-gray-900">{destino.rutas}</span>
          </div>
        </div>

        {/* Información en la base */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h4 className="text-3xl font-bold text-white mb-2">{destino.nombre}</h4>
          <p className="text-white/90 text-sm flex items-center gap-2">
            <md-icon className="text-lg">location_on</md-icon>
            {destino.descripcion}
          </p>
        </div>
      </div>
    </div>
  );
});

DestinoCard.displayName = "DestinoCard";

// Componente principal del carrusel
const DestinosCarousel = memo(({ setFormData, scrollToSection }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  const destinos = [
    {
      nombre: "Medellín",
      imagen: "https://i.natgeofe.com/n/c5f625f7-a459-4afb-85c6-673224306569/downtown-medellin-colombia.jpg",
      rutas: "50+ rutas",
      descripcion: "Ciudad de la eterna primavera",
    },
    {
      nombre: "Quibdó",
      imagen: "https://caracoltv.brightspotcdn.com/dims4/default/6ab8243/2147483647/strip/true/crop/1890x992+0+65/resize/1200x630!/quality/90/?url=http:%2F%2Fcaracol-brightspot.s3.amazonaws.com%2Fae%2F79%2F52ccc5f9410bac9b20ea23a471ef%2F01-choco-viajeros-por-naturaleza-copy.jpg",
      rutas: "25+ rutas",
      descripcion: "Naturaleza y cultura chocoana",
    },
    {
      nombre: "Raspadura",
      imagen: "https://i.ytimg.com/vi/5wW_Rt5UFi8/maxresdefault.jpg",
      rutas: "15+ rutas",
      descripcion: "Pueblo tranquilo del Chocó",
    },
    {
      nombre: "Bagadó",
      imagen: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgE5ov2suelssNCq7T33_brxUFR10eKNJc2YP3MGHsniai1qeyn7eWUnTYSVckSvCYBJTXSq-KCJ93TqGaSP5JFGCqfIXeIiJUtu_p29PZYCi_S1oM3Vw5hqnqVglqpaiXG-JROXAAwTEvSUCeeCY1AVoKdbiNn6WP_cqWUkRG2nFwJniRGFkjDuVc26g/s1000/Municipio%20de%20Bagado.jpg",
      rutas: "12+ rutas",
      descripcion: "Riqueza cultural y natural",
    },
    {
      nombre: "Lloró",
      imagen: "https://choco7dias.com/wp-content/uploads/2021/06/lloro-choco-aereo.jpg",
      rutas: "10+ rutas",
      descripcion: "El lugar más lluvioso de Colombia",
    },
    {
      nombre: "Pereira",
      imagen: "https://www.colombiaespasion.com/wp-content/uploads/2023/07/Skyline_Pereira-990x557.jpg",
      rutas: "45+ rutas",
      descripcion: "La perla del Eje Cafetero",
    },
    {
      nombre: "Condoto",
      imagen: "https://www.diccionariodecolombia.expert/wp-content/uploads/2020/08/condotof.jpg",
      rutas: "18+ rutas",
      descripcion: "Tradición minera del Chocó",
    },
    {
      nombre: "Istmina",
      imagen: "https://centralpdet.renovacionterritorio.gov.co/wp-content/uploads/2022/04/itsmina_municipio-choco-1024x651.jpg",
      rutas: "20+ rutas",
      descripcion: "Corazón del San Juan",
    },
    {
      nombre: "Tadó",
      imagen: "https://tse2.mm.bing.net/th/id/OIP.zgefMwO7PfBpKHThJPBm8wHaEJ?rs=1&pid=ImgDetMain&o=7&rm=3",
      rutas: "14+ rutas",
      descripcion: "Pueblo encantador chocoano",
    },
    {
      nombre: "Yuto",
      imagen: "https://tse2.mm.bing.net/th/id/OIP.O_jtsUY4RiVAp4JZrdOE9wHaDo?rs=1&pid=ImgDetMain&o=7&rm=3",
      rutas: "8+ rutas",
      descripcion: "Naturaleza virgen del Pacífico",
    },
    {
      nombre: "Cali",
      imagen: "https://destincolombia.com/wp-content/uploads/2018/08/vida-diurna-y-nocturna-en-cali.jpg",
      rutas: "60+ rutas",
      descripcion: "Capital mundial de la salsa",
    },
  ];

  const itemsPerView = 3;
  const maxIndex = destinos.length - itemsPerView;

  const next = useCallback(
    () => setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1)),
    [maxIndex]
  );

  const prev = useCallback(
    () => setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1)),
    [maxIndex]
  );

  const handleDestinySelect = useCallback(
    (destinoNombre) => {
      setFormData((prev) => ({ ...prev, destino: destinoNombre }));
      scrollToSection("inicio");
      setAutoplayEnabled(false);
    },
    [setFormData, scrollToSection]
  );

  // Autoplay con control
  useEffect(() => {
    if (!autoplayEnabled) {
      return;
    }

    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [autoplayEnabled, next]);

  // Reactivar autoplay después de 10s de inactividad
  useEffect(() => {
    if (autoplayEnabled) return;

    const timer = setTimeout(() => {
      setAutoplayEnabled(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [autoplayEnabled]);

  return (
    <div className="relative">
      {/* Botón anterior */}
      <button
        onClick={prev}
        onMouseEnter={() => setAutoplayEnabled(false)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Anterior"
      >
        <md-icon className="text-blue-600">chevron_left</md-icon>
      </button>

      {/* Botón siguiente */}
      <button
        onClick={next}
        onMouseEnter={() => setAutoplayEnabled(false)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-100 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Siguiente"
      >
        <md-icon className="text-blue-600">chevron_right</md-icon>
      </button>

      {/* Contenedor del carrusel */}
      <div className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {destinos.map((destino, idx) => (
            <DestinoCard
              key={destino.nombre}
              destino={destino}
              index={idx}
              itemsPerView={itemsPerView}
              onSelect={handleDestinySelect}
            />
          ))}
        </div>
      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setAutoplayEnabled(false);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-8 bg-blue-600" : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Ir a destino ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

DestinosCarousel.displayName = "DestinosCarousel";

export default DestinosCarousel;
