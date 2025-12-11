import React, { memo } from "react";
import "@material/web/icon/icon.js";

const BenefitsSection = memo(() => {
  return (
    <section id="beneficios" className="px-4 md:px-8 py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold mb-3">Beneficios</p>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">¿Por qué elegir La Tribu?</h3>
        </div>

        {/* Grid de beneficios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Seguridad Certificada", text: "Flota con GPS y conductores certificados." },
            { title: "Cobertura Nacional", text: "Más de 50 ciudades conectadas." },
            { title: "Tarifas Claras", text: "Sin cargos ocultos ni sorpresas." },
            { title: "Soporte 24/7", text: "Siempre disponibles para ti." },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <h4 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h4>
              <p className="text-gray-600 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Estadísticas destacadas */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-12 shadow-xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { num: "4.8/5", label: "Calificación" },
              { num: "500K+", label: "Pasajeros/año" },
              { num: "98%", label: "Puntualidad" },
              { num: "50+", label: "Destinos" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-black text-white mb-2">{stat.num}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
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
