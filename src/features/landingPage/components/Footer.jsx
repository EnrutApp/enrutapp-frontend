import React, { memo } from "react";
import "@material/web/icon/icon.js";

const Footer = memo(({ scrollToSection }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-16">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="gap-4 flex flex-col">
            <img src="/logoLaTribu.png" alt="logo" width={82} />
            <p className="text-gray-400 text-sm">Tu compañero de viaje confiable desde hace más de 20 años.</p>
          </div>

          {/* Enlaces */}
          <div>
            <h5 className="font-bold mb-4">Enlaces</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              {["Inicio", "Nosotros", "Destinos", "Beneficios"].map((link) => (
                <li key={link} onClick={() => scrollToSection(link.toLowerCase())} className="hover:text-white cursor-pointer transition-colors">
                  {link}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-bold mb-4">Legal</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer">Términos</li>
              <li className="hover:text-white cursor-pointer">Privacidad</li>
              <li className="hover:text-white cursor-pointer">Políticas</li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h5 className="font-bold mb-4">Contacto</h5>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <md-icon className="text-blue-400 text-lg">phone</md-icon>
                +57 300 123 4567
              </li>
              <li className="flex items-center gap-2">
                <md-icon className="text-blue-400 text-lg">email</md-icon>
                info@latribu.com
              </li>
              <li className="flex items-center gap-2">
                <md-icon className="text-blue-400 text-lg">location_on</md-icon>
                Medellín, Colombia
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-sm">© {currentYear} La Tribu. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
