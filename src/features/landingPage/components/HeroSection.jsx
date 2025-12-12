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

const HeroSection = memo(({ formData, setFormData, errors, setErrors, clearError, handleBuscar, handleTipoViaje, today, ubicacionesItems = [], ubicacionesReady = false, scrollToSection }) => {
  // Manejador para el campo origen
  const handleOrigenChange = (value) => {
    setFormData((prev) => ({ ...prev, origen: value, origenId: "" }));
    const error = validateCity(value);
    if (error) {
      setErrors((prev) => ({ ...prev, origen: error }));
    } else {
      clearError("origen");
    }
  };

  // Manejador para el campo destino
  const handleDestinoChange = (value) => {
    setFormData((prev) => ({ ...prev, destino: value, destinoId: "" }));

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
    setFormData((prev) => ({ ...prev, destino: city.city, destinoId: city.idUbicacion || city.id || "" }));

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

    // Validar fecha pasada usando la prop 'today' para consistencia con el atributo min
    if (name === "fecha" && today) {
      if (value < today) {
        setErrors((prev) => ({ ...prev, fecha: "No puedes seleccionar una fecha en el pasado" }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  return (
    <section id="inicio" className="relative min-h-[800px] flex items-center px-4 md:px-8 pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://i.pinimg.com/originals/ec/cc/f7/ecccf7cc87338d7f8ea12a8e80f56418.jpg"
          alt="Niños"
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
        {/* Usamos style inline para asegurar el gradiente independientemente de la config de Tailwind */}
        <div
          className="absolute inset-0 bg-linear-to-r from-gray-950/90 via-gray-950/60 to-gray-950/30"
          style={{ background: 'linear-gradient(to right, rgba(3, 7, 18, 0.9), rgba(3, 7, 18, 0.6), rgba(3, 7, 18, 0.3))' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Formulario de búsqueda */}
          <div className="lg:col-span-5">
            <div className="w-full max-w-md p-8 content-box-outline-auth-small bg-background rounded-2xl shadow-2xl">
              <div className="mb-3">
                <h2 className="h2 font-medium text-primary">Reserva tu viaje</h2>
              </div>

              <form className="space-y-4" onSubmit={handleBuscar} noValidate>
                {/* Origen y Destino con botón de intercambio */}
                <div className="relative flex flex-col gap-4">
                  {/* Origen */}
                  <div className="flex flex-col">
                    <label className="text-secondary subtitle1 mb-1">
                      Origen
                    </label>
                    <div className="relative group/input">
                      <CityAutocomplete
                        value={formData.origen}
                        onChange={handleOrigenChange}
                        onSelect={(city) => {
                          setFormData((prev) => ({ ...prev, origen: city.city, origenId: city.idUbicacion || city.id || "" }));
                          clearError("origen");
                        }}
                        items={ubicacionesItems}
                        placeholder="Ciudad de origen"
                        inputClassName={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.origen ? "border-red-500" : "border-border"}`}
                      />
                    </div>
                    {errors.origen && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><md-icon className="text-sm">error</md-icon>{errors.origen}</p>}
                  </div>

                  {/* Botón de intercambio centrado */}
                  <button
                    type="button"
                    onClick={() => {
                      const temp = formData.origen;
                      setFormData(prev => ({ ...prev, origen: prev.destino, destino: temp, origenId: prev.destinoId, destinoId: prev.origenId }));
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-2 rounded-full bg-background border border-border text-primary shadow-md hover:shadow-lg hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
                    title="Intercambiar origen y destino"
                    style={{ right: '2rem' }}
                  >
                    <md-icon className="text-xl">swap_vert</md-icon>
                  </button>

                  {/* Destino */}
                  <div className="flex flex-col">
                    <label className="text-secondary subtitle1 mb-1">
                      Destino
                    </label>
                    <div className="relative group/input">
                      <CityAutocomplete
                        value={formData.destino}
                        onChange={handleDestinoChange}
                        onSelect={handleDestinoSelect}
                        items={ubicacionesItems}
                        placeholder="Ciudad de destino"
                        inputClassName={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors ${errors.destino ? "border-red-500" : "border-border"}`}
                      />
                    </div>
                    {errors.destino && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><md-icon className="text-sm">error</md-icon>{errors.destino}</p>}
                  </div>
                </div>

                {/* Fecha */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-secondary subtitle1">
                      Fecha de salida
                    </label>
                    <div className="flex bg-fill rounded-lg p-1 border border-border">
                      {["Hoy", "Mañana"].map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => handleTipoViaje(tipo)}
                          className={`px-3 py-1 rounded-md text-caption font-bold transition-all ${formData.tipoViaje === tipo
                              ? "bg-background text-primary shadow-sm border border-border"
                              : "text-secondary hover:text-primary"
                            }`}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative group/input">
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      min={today}
                      onChange={handleDateChange}
                      className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary date-secondary focus:outline-none focus:border-primary transition-colors ${errors.fecha ? "border-red-500" : "border-border"
                        }`}
                    />
                  </div>
                  {errors.fecha && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><md-icon className="text-sm">error</md-icon>{errors.fecha}</p>}
                </div>

                {/* Botón búsqueda */}
                <div className="flex flex-col">
                  <button
                    type="submit"
                    className="w-full btn btn-primary font-medium text-subtitle1 flex items-center justify-center gap-2"
                  >
                    Buscar viajes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contenido derecho */}
          <div className="lg:col-span-7 text-primary space-y-8 lg:pl-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fill border border-border text-primary text-caption font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                La forma más simple de viajar
              </div>
              <h1 className="text-h1 font-bold leading-tight tracking-tight text-primary">
                Viajar está a un<br />
                <span className="text-primary">
                  Clic de distancia
                </span>
              </h1>

              <p className="text-h5 text-secondary font-regular max-w-xl leading-relaxed">
                Compra tus tiquetes de forma rápida, segura y sin complicaciones
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {[
                { icon: "verified_user", title: "Seguro", desc: "Viajes verificados" },
                { icon: "schedule", title: "Puntual", desc: "Sin retrasos" },
                { icon: "headset_mic", title: "Soporte", desc: "24/7 en vivo" }
              ].map((feature, i) => (
                <div key={i} className="group flex flex-col items-start gap-2 bg-fill p-5 rounded-2xl border border-border transition-all duration-300 hover:border-primary">
                  <div className="p-2 rounded-lg bg-background text-primary transition-colors">
                    <md-icon>{feature.icon}</md-icon>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary text-body1">{feature.title}</h4>
                    <p className="text-caption text-secondary">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";

export default HeroSection;
