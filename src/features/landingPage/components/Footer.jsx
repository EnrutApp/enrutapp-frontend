import React, { memo } from 'react';
import '@material/web/icon/icon.js';

const Footer = memo(({ scrollToSection }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-[#0a0a0b] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Logo y descripción */}
          <div className="gap-5 flex flex-col">
            <img
              src="/logoPositivo.png"
              alt="logo"
              width={82}
              className="opacity-90"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Tu compañero de viaje confiable desde hace más de 5 años.
            </p>
            {/* Social */}
          </div>

          {/* Enlaces */}
          <div>
            <h5 className="font-bold mb-5 text-white/90 text-sm uppercase tracking-wider">
              Navegación
            </h5>
            <ul className="space-y-3 text-sm text-gray-400">
              {['Inicio', 'Nosotros', 'Destinos', 'Beneficios'].map(link => (
                <li
                  key={link}
                  onClick={() => scrollToSection(link.toLowerCase())}
                  className="hover:text-white cursor-pointer transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <span className="w-0 h-px bg-white/60 group-hover:w-3 transition-all duration-200" />
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-bold mb-5 text-white/90 text-sm uppercase tracking-wider">
              Legal
            </h5>
            <ul className="space-y-3 text-sm text-gray-400">
              {['Términos de uso', 'Privacidad', 'Políticas'].map(item => (
                <li
                  key={item}
                  className="hover:text-white cursor-pointer transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <span className="w-0 h-px bg-white/60 group-hover:w-3 transition-all duration-200" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h5 className="font-bold mb-5 text-white/90 text-sm uppercase tracking-wider">
              Contacto
            </h5>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <md-icon className="text-gray-300 text-sm">phone</md-icon>
                </div>
                +57 300 123 4567
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <md-icon className="text-gray-300 text-sm">email</md-icon>
                </div>
                info@latribu.com
              </li>
              <li className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <md-icon className="text-gray-300 text-sm">
                    location_on
                  </md-icon>
                </div>
                Medellín, Colombia
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © {currentYear} La Tribu. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs">Hecho con en Colombia</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
