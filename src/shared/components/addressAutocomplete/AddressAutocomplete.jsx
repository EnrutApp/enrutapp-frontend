import { useState, useEffect, useRef } from 'react';
import '@material/web/icon/icon.js';
import { useGoogleMaps } from '../../context/GoogleMapsLoader';

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
  const { isLoaded } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const sessionToken = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      sessionToken.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  const searchAddresses = query => {
    if (!query.trim() || query.length < 2 || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    const request = {
      input: query,
      sessionToken: sessionToken.current,
      componentRestrictions: { country },
      types: [],
      language: 'es',
    };

    autocompleteService.current.getPlacePredictions(
      request,
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  const handleInputChange = e => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    searchAddresses(newValue);
  };

  const handleSelect = prediction => {
    setInputValue(prediction.description);
    onChange(prediction.description);
    setShowSuggestions(false);

    const request = {
      placeId: prediction.place_id,
      fields: ['name', 'formatted_address', 'geometry', 'address_components'],
      sessionToken: sessionToken.current,
    };

    placesService.current.getDetails(request, (place, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        place
      ) {
        onSelect({
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: prediction.place_id,
          components: place.address_components,
        });

        sessionToken.current =
          new window.google.maps.places.AutocompleteSessionToken();
      }
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

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length > 2) searchAddresses(inputValue);
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled || !isLoaded}
          required={required}
          className="w-full px-4 py-3 pr-10 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
          autoComplete="off"
        />
        {!isLoaded ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <md-icon className="text-secondary text-base animate-spin">
              sync
            </md-icon>
          </div>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <md-icon className="text-secondary text-base">search</md-icon>
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
            return (
              <button
                key={suggestion.place_id}
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
                      {suggestion.structured_formatting.main_text}
                    </p>
                    <p className="text-sm text-secondary mt-0.5">
                      {suggestion.structured_formatting.secondary_text}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
