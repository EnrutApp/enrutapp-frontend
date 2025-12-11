import React, { memo } from "react";
import "@material/web/icon/icon.js";

const Navbar = memo(({ scrolled, scrollToSection, handleNavigateLogin }) => {
  return (
    <nav
      className={`fixed top-0 z-50 flex justify-between items-center px-6 md:px-10 py-4 transition-all duration-500 ${
        scrolled
          ? "left-4 right-4 top-4 bg-white/90 backdrop-blur-lg shadow-lg rounded-2xl"
          : "left-0 right-0 bg-gradient-to-b from-black/50 to-transparent"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md transition-all duration-500`}>
          <span className="text-white font-bold text-lg">LT</span>
        </div>
        <span className={`font-bold text-xl transition-colors duration-300 ${scrolled ? "text-gray-900" : "text-white"}`}>
          La Tribu
        </span>
      </div>

      {/* Menú */}
      <ul
        className={`hidden md:flex space-x-8 text-sm font-medium transition-colors duration-300 ${
          scrolled ? "text-gray-700" : "text-white"
        }`}
      >
        {["Inicio", "Destinos", "Nosotros", "Beneficios"].map((item) => (
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

      {/* Botón login */}
      <button
        onClick={handleNavigateLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
      >
        Iniciar sesión
      </button>
    </nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
