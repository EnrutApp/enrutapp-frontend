
import { useState, useEffect, useRef } from "react";
import apiClient from "../../../shared/services/apiService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const RutaForm = ({ ruta, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    origenNombre: "",
    destinoNombre: "",
    origenCoords: null,
    destinoCoords: null,
    distancia: "",
    precioBase: "",
    observaciones: "",
    tiempo: "",
    estado: "Activa",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchingOrigen, setSearchingOrigen] = useState(false);
  const [searchingDestino, setSearchingDestino] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const origenMarkerRef = useRef(null);
  const destinoMarkerRef = useRef(null);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (ruta) {
      const origenLat = ruta.origen?.ubicacion?.latitud;
      const origenLng = ruta.origen?.ubicacion?.longitud;
      const destinoLat = ruta.destino?.ubicacion?.latitud;
      const destinoLng = ruta.destino?.ubicacion?.longitud;

      setFormData({
        origenNombre: ruta.origen?.ubicacion?.nombreUbicacion || "",
        destinoNombre: ruta.destino?.ubicacion?.nombreUbicacion || "",
        origenCoords:
          origenLat && origenLng
            ? {
                lat: parseFloat(origenLat),
                lng: parseFloat(origenLng),
                displayName: ruta.origen?.ubicacion?.direccion,
              }
            : null,
        destinoCoords:
          destinoLat && destinoLng
            ? {
                lat: parseFloat(destinoLat),
                lng: parseFloat(destinoLng),
                displayName: ruta.destino?.ubicacion?.direccion,
              }
            : null,
        distancia: ruta.distancia || "",
        precioBase: ruta.precioBase || "",
        observaciones: ruta.observaciones || "",
        tiempo: ruta.tiempoEstimado || "",
        estado: ruta.estado || "Activa",
      });
    }
  }, [ruta]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView([4.5709, -74.2973], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const buscarCoordenadas = async (direccion) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          direccion
        )}, Colombia&countrycodes=co&limit=5`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleBuscarOrigen = async () => {
    if (!formData.origenNombre.trim()) return;
    setSearchingOrigen(true);
    setError(null);

    const coords = await buscarCoordenadas(formData.origenNombre);
    if (coords) {
      setFormData((prev) => ({ ...prev, origenCoords: coords }));

      if (origenMarkerRef.current)
        mapInstanceRef.current.removeLayer(origenMarkerRef.current);

      origenMarkerRef.current = L.marker([coords.lat, coords.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: '<div style="background:#10b981;width:35px;height:35px;border-radius:50%;border:4px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);"></div>',
          iconSize: [35, 35],
          iconAnchor: [17, 17],
        }),
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.setView([coords.lat, coords.lng], 13);
    } else {
      setError("No se encontró la ubicación del origen.");
    }

    setSearchingOrigen(false);
  };

  const handleBuscarDestino = async () => {
    if (!formData.destinoNombre.trim()) return;
    setSearchingDestino(true);
    setError(null);

    const coords = await buscarCoordenadas(formData.destinoNombre);
    if (coords) {
      setFormData((prev) => ({ ...prev, destinoCoords: coords }));

      if (destinoMarkerRef.current)
        mapInstanceRef.current.removeLayer(destinoMarkerRef.current);

      destinoMarkerRef.current = L.marker([coords.lat, coords.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: '<div style="background:#ef4444;width:35px;height:35px;border-radius:50%;border:4px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);"></div>',
          iconSize: [35, 35],
          iconAnchor: [17, 17],
        }),
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.setView([coords.lat, coords.lng], 13);
    } else {
      setError("No se encontró la ubicación del destino.");
    }

    setSearchingDestino(false);
  };

  // Actualiza ruta cuando hay origen y destino
  useEffect(() => {
    if (!mapInstanceRef.current || !formData.origenCoords || !formData.destinoCoords) return;

    if (routingControlRef.current)
      mapInstanceRef.current.removeControl(routingControlRef.current);

    if (origenMarkerRef.current)
      mapInstanceRef.current.removeLayer(origenMarkerRef.current);
    if (destinoMarkerRef.current)
      mapInstanceRef.current.removeLayer(destinoMarkerRef.current);

    origenMarkerRef.current = L.marker([formData.origenCoords.lat, formData.origenCoords.lng], {
      icon: L.divIcon({
        className: "custom-marker",
        html: '<div style="background:#10b981;width:35px;height:35px;border-radius:50%;border:4px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);"></div>',
        iconSize: [35, 35],
        iconAnchor: [17, 17],
      }),
    }).addTo(mapInstanceRef.current);

    destinoMarkerRef.current = L.marker([formData.destinoCoords.lat, formData.destinoCoords.lng], {
      icon: L.divIcon({
        className: "custom-marker",
        html: '<div style="background:#ef4444;width:35px;height:35px;border-radius:50%;border:4px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);"></div>',
        iconSize: [35, 35],
        iconAnchor: [17, 17],
      }),
    }).addTo(mapInstanceRef.current);

    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(formData.origenCoords.lat, formData.origenCoords.lng),
        L.latLng(formData.destinoCoords.lat, formData.destinoCoords.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: "#6366f1", weight: 5, opacity: 0.8 }],
      },
      createMarker: () => null,
    }).addTo(mapInstanceRef.current);

    routingControlRef.current.on("routesfound", function (e) {
      const summary = e.routes[0].summary;
      const distanciaKm = (summary.totalDistance / 1000).toFixed(2);
      
      // Cálculo de tiempo más realista para carreteras colombianas
      // Velocidad promedio de 50 km/h en vez de la que calcula el routing (más realista para Colombia)
      const velocidadPromedioKmH = 50; // Ajusta este valor según la realidad de tus rutas
      const tiempoHoras = distanciaKm / velocidadPromedioKmH;
      const horas = Math.floor(tiempoHoras);
      const minutos = Math.round((tiempoHoras - horas) * 60);
      const tiempoFormateado = `${horas}:${minutos.toString().padStart(2, "0")}`;

      if (!ruta) {
        setFormData((prev) => ({
          ...prev,
          distancia: distanciaKm,
          tiempo: tiempoFormateado,
        }));
      }
    });

    routingControlRef.current.on("routingerror", () =>
      setError("No se pudo calcular la ruta entre estos puntos.")
    );
  }, [formData.origenCoords, formData.destinoCoords, ruta]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.origenCoords || !formData.destinoCoords)
        return alert("Por favor busca y confirma el origen y destino en el mapa");
      if (!formData.precioBase || parseFloat(formData.precioBase) <= 0)
        return alert("Por favor ingresa un precio válido");

      setLoading(true);

      if (ruta) {
        const dataToUpdate = {
          distancia: parseFloat(formData.distancia),
          precioBase: parseFloat(formData.precioBase),
          tiempoEstimado: formData.tiempo,
          estado: formData.estado,
          observaciones: formData.observaciones || "",
        };
        await apiClient.patch(`/rutas/${ruta.idRuta}`, dataToUpdate);
        alert("Ruta actualizada exitosamente!");
      } else {
        const ubicacionOrigen = await apiClient.post("/rutas/ubicaciones", {
          nombreUbicacion: formData.origenNombre,
          latitud: formData.origenCoords.lat,
          longitud: formData.origenCoords.lng,
          direccion:
            formData.origenCoords.displayName || formData.origenNombre,
        });

        const origenCreado = await apiClient.post("/rutas/origen", {
          idUbicacion:
            ubicacionOrigen.data?.idUbicacion || ubicacionOrigen.idUbicacion,
          descripcion: `Origen: ${formData.origenNombre}`,
        });

        const ubicacionDestino = await apiClient.post("/rutas/ubicaciones", {
          nombreUbicacion: formData.destinoNombre,
          latitud: formData.destinoCoords.lat,
          longitud: formData.destinoCoords.lng,
          direccion:
            formData.destinoCoords.displayName || formData.destinoNombre,
        });

        const destinoCreado = await apiClient.post("/rutas/destino", {
          idUbicacion:
            ubicacionDestino.data?.idUbicacion ||
            ubicacionDestino.idUbicacion,
          descripcion: `Destino: ${formData.destinoNombre}`,
        });

        const dataToSend = {
          idOrigen: origenCreado.idOrigen,
          idDestino: destinoCreado.idDestino,
          distancia: parseFloat(formData.distancia),
          precioBase: parseFloat(formData.precioBase),
          tiempoEstimado: formData.tiempo,
          estado: formData.estado,
          observaciones: formData.observaciones || "",
        };

        await apiClient.post("/rutas", dataToSend);
        alert("Ruta creada exitosamente!");
      }

      onSuccess?.();
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 min-h-screen p-4 bg-black">
      <div className="w-[35%] flex justify-center">
        <div className="bg-[#1a1a1a] rounded-2xl p-6 w-full shadow-2xl relative h-fit">
          <div className="flex mb-4">
            <button
              onClick={onCancel}
              className="text-secondary p-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
            >
              <md-icon className="text-xl flex items-center justify-center">close</md-icon>
            </button>
            
            <h2 className="h4 p-2 font-medium text-primary">
              {ruta ? "Editar ruta" : "Agregar nueva ruta"}
            </h2>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Origen */}
            <div>
              <label className="block text-gray-400 text-xs mb-2">Origen</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="origenNombre"
                  value={formData.origenNombre}
                  onChange={handleChange}
                  onBlur={handleBuscarOrigen}
                  placeholder="Aquí va el origen"
                  disabled={!!formData.origenCoords}
                  className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                />
                {formData.origenCoords && (
                  <button
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, origenCoords: null }))
                    }
                    className="bg-red-500/20 text-red-400 px-4 rounded-lg hover:bg-red-500/30"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchingOrigen && (
                <p className="text-gray-400 text-xs mt-1">Buscando origen...</p>
              )}
              {formData.origenCoords && (
                <p className="text-green-400 text-xs mt-1">✓ Ubicación encontrada</p>
              )}
            </div>

            {/* Destino */}
            <div>
              <label className="block text-gray-400 text-xs mb-2">Destino</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="destinoNombre"
                  value={formData.destinoNombre}
                  onChange={handleChange}
                  onBlur={handleBuscarDestino}
                  placeholder="Aquí va el destino"
                  disabled={!!formData.destinoCoords}
                  className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
                />
                {formData.destinoCoords && (
                  <button
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, destinoCoords: null }))
                    }
                    className="bg-red-500/20 text-red-400 px-4 rounded-lg hover:bg-red-500/30"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchingDestino && (
                <p className="text-gray-400 text-xs mt-1">Buscando destino...</p>
              )}
              {formData.destinoCoords && (
                <p className="text-green-400 text-xs mt-1">✓ Ubicación encontrada</p>
              )}
            </div>

            {/* Distancia y Tiempo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="content-box-outline-4-small">
                <div className="relative">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                    Distancia
                  </p>
                  <p className="text-white text-3xl font-bold">
                    {formData.distancia || "0"}
                    <span className="text-sm font-normal text-gray-400 ml-1">km</span>
                  </p>
                </div>
              </div>
              <div className="content-box-outline-4-small">
                <div className="relative">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                    Tiempo
                  </p>
                  <p className="text-white text-3xl font-bold">
                    {formData.tiempo || "0:00"}
                    <span className="text-sm font-normal text-gray-400 ml-1">hrs</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-2">Precio base</label>
              <input
                type="number"
                name="precioBase"
                value={formData.precioBase}
                onChange={handleChange}
                placeholder="Precio base (COP)"
                className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-2">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-2">Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
                className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn btn-add hover:bg-indigo-600 text-white px-5 py-2 rounded-full mt-4 transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : ruta ? "Actualizar" : "Agregar"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-[65%]">
        <div
          ref={mapRef}
          className="h-full rounded-2xl shadow-2xl border-2 border-gray-800"
          style={{ minHeight: "95vh" }}
        />
      </div>
    </div>
  );
};

export default RutaForm;