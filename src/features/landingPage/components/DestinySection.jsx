import React, { memo } from "react";
import "@material/web/icon/icon.js";
import useInView from "../hooks/useInView";

const DestinySection = memo(({ setFormData, scrollToSection, children }) => {
  const headRef = useInView();

  return (
    <section id="destinos" className="px-4 md:px-8 py-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div ref={headRef} className="text-center mb-16 lp-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-900 text-sm font-semibold mb-4 tracking-wide">
            Destinos populares
          </span>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Descubre Colombia</h3>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Conectamos los destinos más importantes del país</p>
        </div>

        {children}
      </div>
    </section>
  );
});

DestinySection.displayName = "DestinySection";

export default DestinySection;
