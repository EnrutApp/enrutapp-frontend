import { useState, useEffect, useRef } from 'react';
import '@material/web/icon/icon.js';

const AddressAutocomplete = ({
  value = '',
  onChange = () => {},
  onSelect = () => {},
  placeholder = 'Escribe una dirección...',
  className = '',
  disabled = false,
  country = 'co',
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const timeoutRef = useRef(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const searchAddresses = async query => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!MAPBOX_TOKEN) {
      
      return;
    }

    setIsLoading(true);

    try {
      let response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          `access_token=${MAPBOX_TOKEN}&` +
          `country=${country}&` +
          `limit=10&` +
          `language=es&` +
          `autocomplete=true`
      );

      let data = await response.json();

      if (data.features && data.features.length > 0) {
        const sortedFeatures = data.features
          .sort((a, b) => {
            const aIsAddress = a.place_type?.includes('address') || false;
            const bIsAddress = b.place_type?.includes('address') || false;
            if (aIsAddress && !bIsAddress) return -1;
            if (!aIsAddress && bIsAddress) return 1;

            const aIsPOI = a.place_type?.includes('poi') || false;
            const bIsPOI = b.place_type?.includes('poi') || false;
            if (aIsPOI && !bIsPOI) return -1;
            if (!aIsPOI && bIsPOI) return 1;

            return 0;
          })
          .slice(0, 8);

        setSuggestions(sortedFeatures);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = e => {
    const newValue = e.target.value;
    onChange(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 200);
  };

  const handleSelect = suggestion => {
    const address = suggestion.place_name || suggestion.text;
    const [lng, lat] = suggestion.center;

    onChange(address);
    setShowSuggestions(false);
    setSuggestions([]);

    onSelect({
      address,
      lat,
      lng,
      context: suggestion.context,
      placeType: suggestion.place_type,
      properties: suggestion.properties,
    });
  };

  const handleKeyDown = e => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && value.trim().length >= 2) {
      setShowSuggestions(true);
    } else if (value.trim().length >= 2) {
      searchAddresses(value);
    }
  };

  const formatAddress = suggestion => {
    if (suggestion.place_name) {
      return suggestion.place_name;
    }

    const context = suggestion.context || [];
    const addressLine =
      suggestion.properties?.address_line_1 ||
      suggestion.properties?.address ||
      suggestion.text ||
      '';
    const city = context.find(c => c.id?.startsWith('place'))?.text || '';
    const region = context.find(c => c.id?.startsWith('region'))?.text || '';
    const country =
      context.find(c => c.id?.startsWith('country'))?.text || 'Colombia';

    let parts = [addressLine];
    if (city && city !== addressLine && !addressLine.includes(city))
      parts.push(city);
    if (region && !parts.includes(region)) parts.push(region);
    if (country && !parts.includes(country)) parts.push(country);

    return parts.join(', ');
  };

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
          required={required}
          className="w-full px-4 py-3 pr-10 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
          style={{
            overflowX: 'auto',
            scrollbarWidth: 'thin',
            minWidth: 0,
          }}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <md-icon className="text-secondary text-base animate-spin">
              refresh
            </md-icon>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-fill border border-border rounded-lg shadow-2xl overflow-hidden"
          style={{ maxHeight: '240px', overflowY: 'auto' }}
        >
          {suggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            const fullAddress = formatAddress(suggestion);
            const mainText =
              suggestion.properties?.address_line_1 ||
              suggestion.properties?.address ||
              suggestion.text ||
              '';
            const contextParts = fullAddress
              .split(',')
              .slice(1)
              .map(s => s.trim())
              .filter(Boolean);
            const contextText =
              contextParts.length > 0 ? contextParts.join(', ') : '';

            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className={`w-full text-left px-4 py-3 transition-colors border-b border-border last:border-b-0 ${
                  isSelected ? 'bg-primary/10' : 'hover:bg-fill'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-background rounded-full p-2 w-10 h-10 flex items-center justify-center">
                    <md-icon className="text-primary text-base">
                      location_on
                    </md-icon>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body1 font-medium text-primary">
                      {mainText}
                    </p>
                    {contextText && (
                      <p className="text-sm text-secondary mt-0.5">
                        {contextText}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showSuggestions &&
        suggestions.length === 0 &&
        value.trim().length >= 2 &&
        !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg p-4">
            <p className="text-sm text-secondary text-center">
              No se encontraron resultados
            </p>
          </div>
        )}
    </div>
  );
};

export default AddressAutocomplete;
