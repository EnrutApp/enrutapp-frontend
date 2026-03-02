import React, { memo } from "react";
import "@material/web/icon/icon.js";

const AboutSection = memo(({ scrollToSection }) => {
  return (
    <section id="nosotros" className="px-4 md:px-20 py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Contenido izquierdo */}
          <div className="space-y-7">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide"
              style={{ backgroundColor: '#b4c7ed', color: '#1e304f' }}
            >
              Nuestra historia
            </span>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
              Más de 5 años<br />conectando destinos
            </h3>
            <p className="text-gray-500 text-lg leading-relaxed">
              En <span className="font-bold text-gray-900">La Tribu</span>, somos más que una empresa de transporte.
              Somos tu compañero de viaje, comprometidos con llevar a cada pasajero de manera segura, cómoda y puntual.
            </p>

            <div className="space-y-3">
              {[
                { icon: "verified", text: "Flota moderna y tecnológica" },
                { icon: "badge", text: "Conductores certificados" },
                { icon: "support_agent", text: "Atención 24/7" },
                { icon: "paid", text: "Precios transparentes" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: '#b4c7ed' }}
                  >
                    <md-icon style={{ color: '#1e304f' }}>{item.icon}</md-icon>
                  </div>
                  <span className="font-semibold text-gray-800">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { num: "500K+", label: "Pasajeros" },
                { num: "50+", label: "Destinos" },
                { num: "99%", label: "Satisfacción" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-300">
                  <div className="text-3xl font-black text-gray-900 mb-1">{stat.num}</div>
                  <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen derecha */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
              <img
                src="https://images.pexels.com/photos/12127531/pexels-photo-12127531.jpeg?cs=srgb&dl=pexels-baestas-photography-12127531.jpg&fm=jpg"
                alt="Buses modernos"
                loading="lazy"
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-5 -left-5 p-6 rounded-2xl shadow-xl"
              style={{ backgroundColor: '#b4c7ed' }}
            >
              <div className="text-4xl font-black mb-0.5" style={{ color: '#1e304f' }}>5+</div>
              <div className="text-sm font-semibold" style={{ color: '#1e304f' }}>Años de experiencia</div>
            </div>
            {/* Decorative dot grid */}
            <div
              className="absolute -top-4 -right-4 w-24 h-24 opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle, #111827 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";

export default AboutSection;
