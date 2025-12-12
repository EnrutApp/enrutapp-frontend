import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import "@material/web/icon/icon.js";

// Lista de ciudades principales de Colombia por departamento
const COLOMBIAN_CITIES = {
  ATLANTICO: [
    { city: "Barranquilla", department: "Barranquilla" },
    { city: "Sabana Larga", department: "Sabana Larga" },
    { city: "Baranoa", department: "Baranoa" },
    { city: "Luruaco", department: "Luruaco" },
    { city: "Ponedera", department: "Ponedera" },
    { city: "Campeche", department: "Campeche" },
  ],
  BOLIVAR: [
    { city: "Cartagena", department: "Cartagena" },
    { city: "Turbaco", department: "Turbaco" },
    { city: "Magangue", department: "Magangue" },
    { city: "Arjona", department: "Arjona" },
  ],
  CHOCO: [
    { city: "Quibdo", department: "Quibdo" },
    { city: "Istmina", department: "Istmina" },
    { city: "Tado", department: "Tado" },
    { city: "Condoto", department: "Condoto" },
    { city: "Lloro", department: "Lloro" },
    { city: "Raspadura", department: "Raspadura" },
    { city: "Bagado", department: "Bagado" },
    { city: "Yuto", department: "Yuto" },
  ],
  CORDOBA: [
    { city: "Monteria", department: "Monteria" },
    { city: "Cerete", department: "Cerete" },
    { city: "Lorica", department: "Lorica" },
  ],
  SUCRE: [
    { city: "Sincelejo", department: "Sincelejo" },
    { city: "Corozal", department: "Corozal" },
    { city: "Tolu", department: "Tolu" },
  ],
  ANTIOQUIA: [
    { city: "Medellin", department: "Medellin" },
    { city: "Envigado", department: "Envigado" },
    { city: "Sabaneta", department: "Sabaneta" },
    { city: "La Ceja", department: "La Ceja" },
    { city: "Rionegro", department: "Rionegro" },
    { city: "Itagui", department: "Itagui" },
    { city: "Bello", department: "Bello" },
    { city: "Copacabana", department: "Copacabana" },
    { city: "Girardota", department: "Girardota" },
    { city: "Marinilla", department: "Marinilla" },
    { city: "Carepa", department: "Carepa" }
  ],
  CAUCA: [
    { city: "Popayan", department: "Popayan" },
    { city: "Santander de Quilichao", department: "Santander de Quilichao" },
  ],
  HUILA: [
    { city: "Neiva", department: "Neiva" },
    { city: "Pitalito", department: "Pitalito" },
  ],
  MAGDALENA: [
    { city: "Santa Marta", department: "Santa Marta" },
    { city: "Cienaga", department: "Cienaga" },
  ],
  NARINO: [
    { city: "Pasto", department: "Pasto" },
    { city: "Ipiales", department: "Ipiales" },
  ],
  QUINDIO: [
    { city: "Armenia", department: "Armenia" },
    { city: "Pereira", department: "Pereira" },
  ],
  RISARALDA: [
    { city: "Pereira", department: "Pereira" },
    { city: "Dosquebradas", department: "Dosquebradas" },
  ],
  TOLIMA: [
    { city: "Ibague", department: "Ibague" },
    { city: "Espinal", department: "Espinal" },
  ],
  VALLE: [
    { city: "Cali", department: "Cali" },
    { city: "Palmira", department: "Palmira" },
    { city: "Buenaventura", department: "Buenaventura" },
    { city: "Cartago", department: "Cartago" },
  ],
  CUNDINAMARCA: [
    { city: "Bogota", department: "Bogota" },
    { city: "Soacha", department: "Soacha" },
    { city: "Zipaquira", department: "Zipaquira" },
  ],
};

// Aplanar todas las ciudades en un solo array
const ALL_CITIES = Object.entries(COLOMBIAN_CITIES).flatMap(([dept, cities]) =>
  cities.map((city) => ({
    ...city,
    departamento: dept,
  }))
);

const CityAutocomplete = memo(
  ({
    value = "",
    onChange = () => { },
    onSelect = () => { },
    items = null,
    placeholder = "Buscar ciudad",
    className = "",
    inputClassName = "",
    disabled = false,
  }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const timeoutRef = useRef(null);

    // Limpiar timeout al desmontar
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const sourceItems = React.useMemo(() => {
      if (Array.isArray(items) && items.length > 0) {
        return items
          .map((item) => {
            const city =
              item?.city ||
              item?.nombreUbicacion ||
              item?.nombre ||
              item?.label ||
              "";

            const department =
              item?.department || item?.direccion || item?.subtitle || "";

            const id = item?.idUbicacion || item?.id || item?.value;

            return {
              ...item,
              id,
              idUbicacion: id,
              city,
              department,
              departamento: item?.departamento || item?.group || "UBICACIONES",
            };
          })
          .filter((x) => x.city);
      }

      return ALL_CITIES;
    }, [items]);

    // Buscar ciudades
    const searchCities = useCallback((query) => {
      if (!query.trim() || query.length < 1) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const queryLower = query.toLowerCase();
      const filtered = sourceItems.filter(
        (item) =>
          item.city.toLowerCase().includes(queryLower) ||
          item.department.toLowerCase().includes(queryLower)
      ).slice(0, 8); // Limitar a 8 resultados

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    }, [sourceItems]);

    // Manejar cambio en input
    const handleInputChange = useCallback(
      (e) => {
        const newValue = e.target.value;
        onChange(newValue);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          searchCities(newValue);
        }, 150);
      },
      [onChange, searchCities]
    );

    // Manejar selección
    const handleSelect = useCallback(
      (suggestion) => {
        onChange(suggestion.city);
        setShowSuggestions(false);
        setSuggestions([]);
        onSelect(suggestion);
      },
      [onChange, onSelect]
    );

    // Manejar navegación con teclado
    const handleKeyDown = useCallback(
      (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : prev
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
          case "Enter":
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
              handleSelect(suggestions[selectedIndex]);
            }
            break;
          case "Escape":
            setShowSuggestions(false);
            setSelectedIndex(-1);
            break;
          default:
            break;
        }
      },
      [showSuggestions, suggestions, selectedIndex, handleSelect]
    );

    // Manejar blur
    const handleBlur = useCallback(() => {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 200);
    }, []);

    // Manejar focus
    const handleFocus = useCallback(() => {
      if (suggestions.length > 0 && value.trim().length >= 1) {
        setShowSuggestions(true);
      } else if (value.trim().length >= 1) {
        searchCities(value);
      }
    }, [suggestions.length, value, searchCities]);

    return (
      <div className={`relative ${className}`}>
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            className={inputClassName || "input w-full pl-10 text-primary placeholder-secondary bg-fill border-border"}
          />
        </div>

        {/* Dropdown de sugerencias */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-2 bg-fill border border-border rounded-xl shadow-xl overflow-hidden"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {/* Agrupar por departamento */}
            {Object.entries(
              suggestions.reduce((acc, suggestion) => {
                const dept = suggestion.departamento;
                if (!acc[dept]) acc[dept] = [];
                acc[dept].push(suggestion);
                return acc;
              }, {})
            ).map(([dept, cities]) => (
              <div key={dept}>
                {/* Header del departamento */}
                <div className="px-4 py-2 bg-background font-bold text-secondary text-caption uppercase tracking-wider border-b border-border">
                  {dept}
                </div>

                {/* Ciudades del departamento */}
                {cities.map((suggestion, cityIndex) => {
                  const globalIndex = suggestions.indexOf(suggestion);
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <button
                      key={`${dept}-${suggestion.city}`}
                      type="button"
                      onClick={() => handleSelect(suggestion)}
                      className={`w-full text-left px-4 py-3 transition-colors border-b border-border last:border-b-0 flex items-start gap-3 ${isSelected ? "bg-primary text-on-primary" : "hover:bg-background text-primary"
                        }`}
                    >
                      <md-icon className={`text-lg shrink-0 mt-0.5 ${isSelected ? "text-on-primary" : "text-secondary"}`}>
                        location_on
                      </md-icon>
                      <div className="flex-1 min-w-0">
                        <p className={`text-body2 font-medium ${isSelected ? "text-on-primary" : "text-primary"}`}>
                          {suggestion.city}
                        </p>
                        <p className={`text-caption mt-0.5 ${isSelected ? "text-on-primary opacity-80" : "text-secondary"}`}>
                          {suggestion.department}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Mensaje de no resultados */}
        {showSuggestions &&
          suggestions.length === 0 &&
          value.trim().length >= 1 && (
            <div className="absolute z-50 w-full mt-2 bg-fill border border-border rounded-xl shadow-xl p-4 text-center">
              <p className="text-body2 text-secondary">
                No se encontraron ciudades
              </p>
            </div>
          )}
      </div>
    );
  }
);

CityAutocomplete.displayName = "CityAutocomplete";

export default CityAutocomplete;
