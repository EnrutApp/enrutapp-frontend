import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@material/web/icon/icon.js';

const MapBoxMap = ({
    origen = null,
    destino = null,
    onRouteCalculated = null,
    height = '400px',
    className = '',
    interactive = true,
    onMapClick = null,
    allowClickSelection = false,
    showDefaultMap = false,
    initialCenter = null,
    initialZoom = null,
    enable3D = false,
    mapStyle = 'streets-v12' // 'streets-v12', 'dark-v11', 'satellite-v9', 'satellite-streets-v12'
}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);
    const routeLayerRef = useRef(null);
    const origenMarkerRef = useRef(null);
    const destinoMarkerRef = useRef(null);
    const clickMarkerRef = useRef(null);
    const hasShownErrorRef = useRef(false); // Para evitar mostrar errores múltiples

    // API Key de Mapbox - en producción debería estar en .env
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Validar que el token existe
        if (!MAPBOX_TOKEN || MAPBOX_TOKEN.trim() === '') {
            setError('API key de Mapbox no configurada. Por favor configura VITE_MAPBOX_TOKEN en tu archivo .env');
            return;
        }

        // Validar formato básico del token
        if (!MAPBOX_TOKEN.startsWith('pk.')) {
            setError('API key de Mapbox inválida. El token debe comenzar con "pk."');
            return;
        }

        try {
            mapboxgl.accessToken = MAPBOX_TOKEN;

            // Determinar el estilo del mapa
            const styleMap = {
                'streets-v12': 'mapbox://styles/mapbox/streets-v12',
                'dark-v11': 'mapbox://styles/mapbox/dark-v11',
                'satellite-v9': 'mapbox://styles/mapbox/satellite-v9',
                'satellite-streets-v12': 'mapbox://styles/mapbox/satellite-streets-v12'
            };
            const selectedStyle = styleMap[mapStyle] || styleMap['streets-v12'];

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: selectedStyle,
                center: initialCenter || [-75.5658, 6.2476], // Medellín, Colombia [lng, lat] o ubicación del usuario
                zoom: initialZoom || 6,
                pitch: enable3D ? 30 : 0, // Reducido de 45 a 30 para mejor rendimiento
                bearing: enable3D ? -17.6 : 0, // Rotación para mejor vista 3D
                antialias: enable3D ? false : false, // Desactivado para mejor rendimiento
                fadeDuration: enable3D ? 200 : 0, // Reducido de 300 a 200 para más rapidez
                renderWorldCopies: false, // Mejor rendimiento
                projection: enable3D ? 'globe' : 'mercator', // Proyección globo para 3D
                // Optimizaciones de rendimiento
                preserveDrawingBuffer: true, // Mantener el buffer para mejor transición
                refreshExpiredTiles: false, // No refrescar tiles expirados para mejor rendimiento
                maxPitch: enable3D ? 60 : 0, // Limitar pitch máximo para mejor rendimiento
                maxZoom: 18, // Limitar zoom máximo para mejor rendimiento
                minZoom: 2, // Limitar zoom mínimo
                maxBounds: null, // Sin límites de bounds para mejor rendimiento
                attributionControl: false // Desactivar atribución para mejor rendimiento (opcional)
            });

            map.current.on('load', () => {
                // Marcar como cargado inmediatamente cuando el evento 'load' se dispara
                setIsLoaded(true);
                
                // Limpiar cualquier error previo cuando el mapa carga exitosamente
                setError(null);
                hasShownErrorRef.current = false;

                // Agregar controles de navegación con estilo mejorado
                const nav = new mapboxgl.NavigationControl({
                    showCompass: enable3D, // Mostrar brújula solo en 3D
                    showZoom: true,
                    visualizePitch: enable3D // Visualizar pitch solo en 3D
                });
                map.current.addControl(nav, 'top-right');
            });

            map.current.on('error', (e) => {
                console.error('Mapbox error:', e);

                const errorMessage = e.error?.message || e.error || '';
                const errorString = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : JSON.stringify(errorMessage).toLowerCase();

                // Solo mostrar errores críticos de autenticación
                // Ignorar todos los demás errores (sprites, fuentes, tiles, etc.)
                const isAuthError = errorString.includes('token') ||
                    errorString.includes('unauthorized') ||
                    errorString.includes('401') ||
                    errorString.includes('forbidden') ||
                    errorString.includes('403');

                if (isAuthError) {
                    setError('API key de Mapbox inválida o expirada. Por favor configura VITE_MAPBOX_TOKEN en tu archivo .env con una clave válida.');
                    hasShownErrorRef.current = true;
                }
                // Ignorar todos los demás errores (no son críticos)
            });

            map.current.on('style.load', () => {
                // Si el estilo carga, el mapa funciona correctamente
                setError(null);
                hasShownErrorRef.current = false;
            });

            // Limpiar errores cuando cualquier dato se carga exitosamente
            map.current.on('data', () => {
                if (map.current && map.current.isStyleLoaded() && map.current.loaded()) {
                    setError(null);
                }
            });
        } catch (err) {
            console.error('Error al inicializar Mapbox:', err);
            setError('Error al inicializar el mapa. Verifica tu API key de Mapbox.');
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [enable3D, mapStyle, initialCenter, initialZoom]);

    // Manejar selección por click en el mapa
    useEffect(() => {
        if (!map.current || !isLoaded || !allowClickSelection || !onMapClick) {
            // Desactivar cursor si no está en modo selección
            if (map.current) {
                map.current.getCanvas().style.cursor = '';
            }
            return;
        }

        const handleMapClick = async (e) => {
            const { lng, lat } = e.lngLat;

            // Agregar marcador en el punto clickeado
            if (clickMarkerRef.current) {
                clickMarkerRef.current.remove();
            }

            // Remover marcador de origen si existe cuando se hace clic
            if (origenMarkerRef.current) {
                origenMarkerRef.current.remove();
                origenMarkerRef.current = null;
            }

            // Obtener color primary desde CSS
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#B4C7ED';

            const markerEl = document.createElement('div');
            markerEl.className = 'mapbox-marker-click';
            markerEl.innerHTML = `
                <div class="marker-icon-click">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${primaryColor}"/>
                        <circle cx="12" cy="9" r="3.5" fill="white"/>
                    </svg>
                </div>
            `;

            clickMarkerRef.current = new mapboxgl.Marker(markerEl)
                .setLngLat([lng, lat])
                .addTo(map.current);

            // Obtener dirección mediante geocoding inverso
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
                    `access_token=${MAPBOX_TOKEN}&` +
                    `language=es`
                );
                const data = await response.json();
                const address = data.features?.[0]?.place_name || '';

                // Llamar callback con coordenadas y dirección
                onMapClick({
                    lat,
                    lng,
                    address
                });
            } catch (error) {
                console.error('Error obteniendo dirección:', error);
                // Llamar callback solo con coordenadas
                onMapClick({
                    lat,
                    lng,
                    address: ''
                });
            }
        };

        map.current.on('click', handleMapClick);
        map.current.getCanvas().style.cursor = 'crosshair';

        return () => {
            if (map.current) {
                map.current.off('click', handleMapClick);
                map.current.getCanvas().style.cursor = '';
            }
        };
    }, [isLoaded, allowClickSelection, onMapClick]);

    // Actualizar el centro del mapa cuando cambie initialCenter o initialZoom
    useEffect(() => {
        if (map.current && isLoaded && initialCenter && initialZoom) {
            map.current.flyTo({
                center: initialCenter,
                zoom: initialZoom,
                pitch: enable3D ? 30 : 0, // Pitch reducido para mejor rendimiento
                bearing: enable3D ? -17.6 : 0,
                duration: enable3D ? 1000 : 800, // Animación más rápida
                essential: true
            });
        }
    }, [initialCenter, initialZoom, isLoaded, enable3D]);

    const calculateRoute = async (origenLng, origenLat, destinoLng, destinoLat) => {
        if (!map.current || !isLoaded) return;

        try {
            const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origenLng},${origenLat};${destinoLng},${destinoLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.code !== 'Ok') {
                throw new Error(data.message || 'No se pudo calcular la ruta');
            }

            const route = data.routes[0];
            const distance = route.distance / 1000; // Convertir a km
            const duration = route.duration / 60; // Convertir a minutos

            // Remover ruta anterior si existe
            if (map.current.getLayer('route')) {
                map.current.removeLayer('route');
            }
            if (map.current.getLayer('route-shadow')) {
                map.current.removeLayer('route-shadow');
            }
            if (map.current.getSource('route')) {
                map.current.removeSource('route');
            }

            // Agregar ruta al mapa con estilo mejorado
            map.current.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: route.geometry
                }
            });

            // Capa de sombra para efecto de profundidad
            map.current.addLayer({
                id: 'route-shadow',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#1e1b4b',
                    'line-width': 8,
                    'line-opacity': 0.2
                }
            });

            // Capa principal de la ruta con color vibrante y mejor estilo optimizado
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#B4C7ED';
            
            map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': primaryColor,
                    'line-width': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        6, enable3D ? 5 : 4, // Reducido para mejor rendimiento
                        10, enable3D ? 6 : 6,
                        14, enable3D ? 8 : 8, // Reducido de 10 a 8
                        18, enable3D ? 10 : 10 // Reducido de 12 a 10
                    ],
                    'line-opacity': 0.95
                }
            });

            // Ajustar vista del mapa para mostrar toda la ruta con animación optimizada
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend([origenLng, origenLat]);
            bounds.extend([destinoLng, destinoLat]);
            map.current.fitBounds(bounds, {
                padding: { top: 100, bottom: 100, left: 100, right: 100 },
                duration: enable3D ? 1000 : 800, // Animación más rápida para mejor rendimiento
                pitch: enable3D ? 30 : 0, // Pitch reducido para mejor rendimiento
                bearing: enable3D ? -17.6 : 0 // Mantener bearing 3D si está habilitado
            });

            if (onRouteCalculated) {
                const horas = Math.floor(duration / 60);
                const minutos = Math.round(duration % 60);
                onRouteCalculated({
                    distance: distance.toFixed(2),
                    duration: duration,
                    durationFormatted: `${horas}:${minutos.toString().padStart(2, '0')}`
                });
            }
        } catch (err) {
            console.error('Error calculating route:', err);
            // Solo mostrar error si es un error crítico, no mostrar errores de ruta como errores de API key
            // Los errores de cálculo de ruta son diferentes a errores de carga del mapa
            if (err.message && (err.message.includes('token') || err.message.includes('unauthorized') || err.message.includes('401'))) {
                setError('Error de autenticación con Mapbox. Verifica tu API key.');
            }
            // No establecer error para errores normales de cálculo de ruta (puede ser que no haya ruta disponible)
        }
    };

    const addMarkers = (origenLng, origenLat, destinoLng, destinoLat) => {
        if (!map.current || !isLoaded) return;

        // Remover marcadores anteriores
        if (origenMarkerRef.current) origenMarkerRef.current.remove();
        if (destinoMarkerRef.current) destinoMarkerRef.current.remove();

        // Obtener colores desde CSS
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#B4C7ED';
        const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim() || '#1E304F';

        // Crear marcador de origen
        const origenEl = document.createElement('div');
        origenEl.className = 'mapbox-marker-origen';
        origenEl.innerHTML = `
            <div class="marker-pulse-origen"></div>
            <div class="marker-icon-origen">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${primaryColor}"/>
                    <circle cx="12" cy="9" r="3.5" fill="white"/>
                </svg>
            </div>
        `;

        // Crear marcador de destino
        const destinoEl = document.createElement('div');
        destinoEl.className = 'mapbox-marker-destino';
        destinoEl.innerHTML = `
            <div class="marker-pulse-destino"></div>
            <div class="marker-icon-destino">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${secondaryColor}"/>
                    <circle cx="12" cy="9" r="3.5" fill="white"/>
                </svg>
            </div>
        `;

        origenMarkerRef.current = new mapboxgl.Marker(origenEl)
            .setLngLat([origenLng, origenLat])
            .addTo(map.current);

        destinoMarkerRef.current = new mapboxgl.Marker(destinoEl)
            .setLngLat([destinoLng, destinoLat])
            .addTo(map.current);
    };

    useEffect(() => {
        if (!isLoaded) return;

        // Si showDefaultMap es true y no hay origen, mostrar mapa de Colombia
        if (showDefaultMap && !origen) {
            map.current.flyTo({
                center: [-75.5658, 6.2476], // Medellín, Colombia
                zoom: 5.5,
                pitch: enable3D ? 30 : 0, // Pitch reducido para mejor rendimiento
                bearing: enable3D ? -17.6 : 0,
                duration: enable3D ? 1000 : 800 // Animación más rápida
            });
            // Remover marcadores si existen
            if (origenMarkerRef.current) origenMarkerRef.current.remove();
            if (destinoMarkerRef.current) destinoMarkerRef.current.remove();
            if (clickMarkerRef.current) clickMarkerRef.current.remove();
            return;
        }

        if (!origen) return;

        const origenLat = parseFloat(origen.latitud);
        const origenLng = parseFloat(origen.longitud);

        if (isNaN(origenLat) || isNaN(origenLng)) {
            // No mostrar error de coordenadas inválidas como error crítico del mapa
            console.warn('Coordenadas inválidas para origen');
            return;
        }

        // Si allowClickSelection está activo y ya hay un marcador de clic, no mostrar el de origen
        // para evitar duplicados
        if (allowClickSelection && clickMarkerRef.current) {
            return;
        }

        // Si origen y destino son iguales (mismo objeto), mostrar solo un marcador
        if (origen === destino || !destino) {
            // Solo mostrar marcador único
            if (origenMarkerRef.current) origenMarkerRef.current.remove();
            if (destinoMarkerRef.current) destinoMarkerRef.current.remove();

            // Obtener color primary desde CSS
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#B4C7ED';

            const markerEl = document.createElement('div');
            markerEl.className = 'mapbox-marker-origen';
            markerEl.innerHTML = `
                <div class="marker-pulse-origen"></div>
                <div class="marker-icon-origen">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${primaryColor}"/>
                        <circle cx="12" cy="9" r="3.5" fill="white"/>
                    </svg>
                </div>
            `;

            origenMarkerRef.current = new mapboxgl.Marker(markerEl)
                .setLngLat([origenLng, origenLat])
                .addTo(map.current);

            // Ajustar vista al punto con animación optimizada
            map.current.flyTo({
                center: [origenLng, origenLat],
                zoom: 14,
                pitch: enable3D ? 30 : 0, // Pitch reducido para mejor rendimiento
                bearing: enable3D ? -17.6 : 0,
                duration: enable3D ? 1000 : 800 // Animación más rápida
            });
        } else {
            // Rutas con origen y destino diferentes
            const destinoLat = parseFloat(destino.latitud);
            const destinoLng = parseFloat(destino.longitud);

            if (isNaN(destinoLat) || isNaN(destinoLng)) {
                // No mostrar error de coordenadas inválidas como error crítico del mapa
                console.warn('Coordenadas inválidas para destino');
                return;
            }

            addMarkers(origenLng, origenLat, destinoLng, destinoLat);
            calculateRoute(origenLng, origenLat, destinoLng, destinoLat);
        }
    }, [origen, destino, isLoaded, showDefaultMap, enable3D]);

    return (
        <>
            <div className={`relative ${className}`} style={{ height }}>
                {/* Mostrar el mapa inmediatamente, sin esperar a que esté completamente cargado */}
                <div
                    ref={mapContainer}
                    className="w-full h-full rounded-r-3xl overflow-hidden shadow-2xl border border-border/50"
                    style={{ minHeight: '300px' }}
                />
                
                {/* Indicador de carga sutil solo si el mapa no está cargado */}
                {!isLoaded && (
                    <div className="absolute top-4 right-4 z-20">
                        <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg border border-border/50">
                            <md-icon className="text-primary text-lg animate-spin">sync</md-icon>
                            <p className="text-secondary text-xs font-medium">Cargando...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="absolute top-4 left-4 right-4 bg-red/10 border border-red/30 rounded-lg p-3 text-red text-sm z-40 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MapBoxMap;
