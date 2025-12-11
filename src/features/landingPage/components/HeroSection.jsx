import React, { memo } from "react";
import "@material/web/icon/icon.js";
import CityAutocomplete from "./CityAutocomplete";

/**
 * Validar que una ciudad no esté vacía
 * @param {string} city - Nombre de la ciudad
 * @returns {string} Mensaje de error o vacío
 */
const validateCity = (city) => {
  if (!city || !city.trim()) {
    return "La ciudad es requerida";
  }
  if (city.trim().length < 2) {
    return "La ciudad debe tener al menos 2 caracteres";
  }
  return "";
};

const HeroSection = memo(({ formData, setFormData, errors, setErrors, clearError, handleBuscar, handleTipoViaje, today, scrollToSection }) => {
  // Manejador para el campo origen
  const handleOrigenChange = (value) => {
    setFormData((prev) => ({ ...prev, origen: value }));
    const error = validateCity(value);
    if (error) {
      setErrors((prev) => ({ ...prev, origen: error }));
    } else {
      clearError("origen");
    }
  };

  // Manejador para el campo destino
  const handleDestinoChange = (value) => {
    setFormData((prev) => ({ ...prev, destino: value }));
    
    let error = validateCity(value);
    
    // Validar que no sea igual al origen
    if (!error && formData.origen && value.toLowerCase() === formData.origen.toLowerCase()) {
      error = "Origen y destino no pueden ser la misma ciudad";
    }
    
    if (error) {
      setErrors((prev) => ({ ...prev, destino: error }));
    } else {
      clearError("destino");
    }
  };

  // Manejador para selección de destino en autocomplete
  const handleDestinoSelect = (city) => {
    setFormData((prev) => ({ ...prev, destino: city.city }));
    
    let error = "";
    if (formData.origen && city.city.toLowerCase() === formData.origen.toLowerCase()) {
      error = "Origen y destino no pueden ser la misma ciudad";
    }
    
    if (error) {
      setErrors((prev) => ({ ...prev, destino: error }));
    } else {
      clearError("destino");
    }
  };

  // Solo manejador para la fecha
  const handleDateChange = (e) => {
    const { name, value } = e.target;

    // Validar fecha pasada
    if (name === "fecha") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(value);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) {
        setErrors((prev) => ({ ...prev, fecha: "No puedes seleccionar una fecha pasada" }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  return (
    <section id="inicio" className="relative min-h-[650px] flex items-center px-4 md:px-8 pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://i.pinimg.com/originals/ec/cc/f7/ecccf7cc87338d7f8ea12a8e80f56418.jpg"
          alt="Bus moderno"
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/60 to-gray-900/30" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 items-center">
          {/* Formulario de búsqueda */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Reserva tu viaje</h3>
                <p className="text-gray-600 text-xs">Encuentra el viaje perfecto para ti</p>
              </div>

              <form className="space-y-4" onSubmit={handleBuscar} noValidate>
                {/* Origen con Autocomplete */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">
                    Origen
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 text-lg pointer-events-none z-10">
                      <md-icon>location_on</md-icon>
                    </div>
                    <div className="relative">
                      <CityAutocomplete
                        value={formData.origen}
                        onChange={handleOrigenChange}
                        onSelect={(city) => {
                          setFormData((prev) => ({ ...prev, origen: city.city }));
                          clearError("origen");
                        }}
                        placeholder="Ciudad de origen"
                        className={errors.origen ? "border-red-400" : ""}
                      />
                    </div>
                  </div>
                  {errors.origen && <p className="text-red-600 text-xs mt-1">{errors.origen}</p>}
                </div>

                {/* Destino con Autocomplete */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">
                    Destino
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 text-lg pointer-events-none z-10">
                      <md-icon>flag</md-icon>
                    </div>
                    <div className="relative">
                      <CityAutocomplete
                        value={formData.destino}
                        onChange={handleDestinoChange}
                        onSelect={handleDestinoSelect}
                        placeholder="Ciudad de destino"
                        className={errors.destino ? "border-red-400" : ""}
                      />
                    </div>
                  </div>
                  {errors.destino && <p className="text-red-600 text-xs mt-1">{errors.destino}</p>}
                </div>

                {/* Fecha */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block uppercase tracking-wide">
                    Fecha de viaje
                  </label>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {["Hoy", "Mañana"].map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => handleTipoViaje(tipo)}
                        className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                          formData.tipoViaje === tipo
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
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
                      onChange={handleDateChange}
                      className={`w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg text-xs focus:outline-none focus:ring-2 ${
                        errors.fecha ? "border-red-400 bg-red-50" : "border-gray-200"
                      }`}
                    />
                  </div>
                  {errors.fecha && <p className="text-red-600 text-xs mt-1">{errors.fecha}</p>}
                </div>

                {/* Botón búsqueda */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
                >
                  <md-icon className="text-lg">search</md-icon>
                  Buscar viajes
                </button>
              </form>
            </div>
          </div>

          {/* Contenido derecho */}
          <div className="md:col-span-3 text-white space-y-6 md:pl-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              Viajar está a un<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
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
                <span className="text-sm font-semibold">Puntualidad garantizada</span>
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
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
