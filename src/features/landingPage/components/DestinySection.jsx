import React, { memo } from "react";
import "@material/web/icon/icon.js";

const DestinySection = memo(({ setFormData, scrollToSection, children }) => {
  return (
    <section id="destinos" className="px-4 md:px-8 py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold mb-3">Destinos populares</p>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Descubre Colombia</h3>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Conectamos los destinos más importantes del país</p>
        </div>

        {children}
      </div>
    </section>
  );
});

DestinySection.displayName = "DestinySection";

export default DestinySection;
