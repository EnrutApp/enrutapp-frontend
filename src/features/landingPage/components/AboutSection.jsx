import React, { memo } from "react";
import "@material/web/icon/icon.js";

const AboutSection = memo(({ scrollToSection }) => {
  return (
    <section id="nosotros" className="px-4 md:px-20 py-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Contenido izquierdo */}
          <div className="space-y-6">
            <p className="text-blue-600 font-semibold">Nuestra historia</p>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              Más de 20 años conectando destinos
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              En <span className="font-bold text-blue-600">La Tribu</span>, somos más que una empresa de transporte.
              Somos tu compañero de viaje, comprometidos con llevar a cada pasajero de manera segura, cómoda y puntual.
            </p>

            <div className="space-y-4">
              {[
                { icon: "verified", text: "Flota moderna y tecnológica" },
                { icon: "badge", text: "Conductores certificados" },
                { icon: "support_agent", text: "Atención 24/7" },
                { icon: "paid", text: "Precios transparentes" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <md-icon className="text-blue-600">{item.icon}</md-icon>
                  </div>
                  <span className="font-semibold text-gray-800">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6">
              {[
                { num: "500K+", label: "Pasajeros" },
                { num: "50+", label: "Destinos" },
                { num: "99%", label: "Satisfacción" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-black text-blue-600 mb-1">{stat.num}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen derecha */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/12127531/pexels-photo-12127531.jpeg?cs=srgb&dl=pexels-baestas-photography-12127531.jpg&fm=jpg"
                alt="Buses modernos"
                loading="lazy"
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
  );
});

AboutSection.displayName = "AboutSection";

export default AboutSection;
