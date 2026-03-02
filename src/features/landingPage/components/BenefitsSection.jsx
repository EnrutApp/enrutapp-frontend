import React, { memo } from "react";
import "@material/web/icon/icon.js";

const BENEFITS = [
  { icon: "shield", title: "Seguridad Certificada", text: "Flota con GPS y conductores certificados.", color: "blue" },
  { icon: "public", title: "Cobertura Nacional", text: "Más de 50 ciudades conectadas.", color: "indigo" },
  { icon: "receipt_long", title: "Tarifas Claras", text: "Sin cargos ocultos ni sorpresas.", color: "blue" },
  { icon: "support_agent", title: "Soporte 24/7", text: "Siempre disponibles para ti.", color: "indigo" },
];

const STATS = [
  { num: "4.8/5", label: "Calificación" },
  { num: "500K+", label: "Pasajeros/año" },
  { num: "98%", label: "Puntualidad" },
  { num: "50+", label: "Destinos" },
];

const BenefitsSection = memo(() => {
  return (
    <section id="beneficios" className="px-4 md:px-8 py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 tracking-wide"
            style={{ backgroundColor: '#b4c7ed', color: '#1e304f' }}
          >
            Beneficios
          </span>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">¿Por qué elegir La Tribu?</h3>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Todo lo que necesitas para viajar con tranquilidad</p>
        </div>

        {/* Grid de beneficios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {BENEFITS.map((item, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300"
                style={{ backgroundColor: '#b4c7ed' }}
              >
                <md-icon style={{ color: '#1e304f' }}>{item.icon}</md-icon>
              </div>
              <h4 className="font-bold text-base mb-2 text-gray-900">{item.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Estadísticas destacadas */}
        <div
          className="relative rounded-2xl p-12 shadow-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #111827 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, i) => (
              <div key={i} className="group">
                <div className="text-4xl font-black text-white mb-2 tabular-nums">{stat.num}</div>
                <div className="text-gray-400 font-medium text-sm uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

BenefitsSection.displayName = "BenefitsSection";

export default BenefitsSection;
