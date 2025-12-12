import "@material/web/icon/icon.js";

const Navbar = ({ scrolled, scrollToSection, handleNavigateLogin }) => {
  return (
    <nav
      className={`fixed z-50 left-1/2 -translate-x-1/2 flex items-center justify-between transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] transform-gpu ${
        scrolled
          ? "top-4 w-[90%] max-w-[960px] bg-[#0a0a0b]/80 backdrop-blur-2xl border border-white/10 rounded-full py-2.5 px-4 shadow-2xl"
          : "top-0 w-full bg-transparent border-transparent rounded-none shadow-none backdrop-blur-none py-6 px-6 md:px-12"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
            <img 
            src="/logoPositivo.png" 
            alt="logo" 
            className={`transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] object-contain ${
                scrolled ? "w-8 h-8" : "w-10 h-10"
            }`} 
            />
        </div>
        
        <span className={`font-bold tracking-tight text-white leading-none whitespace-nowrap transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${scrolled ? "text-lg opacity-100" : "text-xl md:text-2xl"}`}>
            EnrutApp
        </span>
      </div>

      <div className={`hidden md:flex items-center transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${scrolled ? "opacity-100 translate-y-0" : "opacity-100"}`}>
        <ul className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-md">
            {["Inicio", "Destinos", "Nosotros", "Beneficios"].map((item) => (
            <li
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`relative px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 group hover:bg-white/10 hover:text-white ${scrolled ? "text-gray-300" : "text-gray-200"}`}
            >
                {item}
            </li>
            ))}
        </ul>
      </div>

      <button 
        onClick={handleNavigateLogin} 
        className={`relative overflow-hidden transition-all duration-800 ease-[cubic-bezier(0.25,0.8,0.25,1)] font-semibold rounded-full flex items-center justify-center group ${
          scrolled 
            ? "btn-primary h-9 px-5 text-sm hover:scale-105"
            : "btn-primary h-10 px-6 text-sm hover:scale-105 shadow-lg shadow-white/5"
        }`}
      >
        <span className="relative z-10">{scrolled ? "Entrar" : "Iniciar sesión"}</span>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </nav>
  );
};

export default Navbar;
