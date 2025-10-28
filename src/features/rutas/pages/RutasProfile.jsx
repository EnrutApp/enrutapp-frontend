import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import apiClient from '../../../shared/services/apiService';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const RutasProfile = ({ ruta, isOpen, onClose, onDeleted }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const routingControlRef = useRef(null);

    if (!isOpen || !ruta) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 300);
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await apiClient.delete(`/rutas/${ruta.idRuta}`);
            setIsDeleteModalOpen(false);
            handleClose();
            if (onDeleted) onDeleted();
        } catch (error) {
            console.error('Error al eliminar ruta:', error);
            alert('Error al eliminar la ruta');
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const origenNombre = ruta.origen?.ubicacion?.nombreUbicacion || 'Sin origen';
    const destinoNombre = ruta.destino?.ubicacion?.nombreUbicacion || 'Sin destino';

    // Inicializar mapa
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current || !isOpen) return;

        mapInstanceRef.current = L.map(mapRef.current).setView([4.5709, -74.2973], 6);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(mapInstanceRef.current);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isOpen]);

    // Trazar ruta cuando el mapa esté listo
    useEffect(() => {
        if (!mapInstanceRef.current || !ruta) return;

        const origenLat = ruta.origen?.ubicacion?.latitud;
        const origenLng = ruta.origen?.ubicacion?.longitud;
        const destinoLat = ruta.destino?.ubicacion?.latitud;
        const destinoLng = ruta.destino?.ubicacion?.longitud;

        if (!origenLat || !origenLng || !destinoLat || !destinoLng) {
            console.warn("Coordenadas no disponibles para trazar la ruta");
            return;
        }

        // Remover ruta anterior si existe
        if (routingControlRef.current) {
            mapInstanceRef.current.removeControl(routingControlRef.current);
        }

        // Crear marcadores
        const origenMarker = L.marker([parseFloat(origenLat), parseFloat(origenLng)], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background:#10b981;width:35px;height:35px;border-radius:50%;border:4px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);"></div>',
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            })
        }).addTo(mapInstanceRef.current);

        const destinoMarker = L.marker([parseFloat(destinoLat), parseFloat(destinoLng)], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background:#ef4444;width:35px;height:35px;border-radius:50%;border:4px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.4);"></div>',
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            })
        }).addTo(mapInstanceRef.current);

        // Crear ruta
        routingControlRef.current = L.Routing.control({
            waypoints: [
                L.latLng(parseFloat(origenLat), parseFloat(origenLng)),
                L.latLng(parseFloat(destinoLat), parseFloat(destinoLng))
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#6366f1', weight: 5, opacity: 0.8 }]
            },
            createMarker: () => null
        }).addTo(mapInstanceRef.current);

        return () => {
            if (origenMarker) mapInstanceRef.current?.removeLayer(origenMarker);
            if (destinoMarker) mapInstanceRef.current?.removeLayer(destinoMarker);
        };
    }, [ruta, isOpen]);

    return (
        <div className={`flex gap-4 overflow-auto ${isClosing ? 'profile-exit' : 'profile-enter'}`}
            style={{
                background: 'var(--background)',
                boxSizing: 'border-box',
                width: '100%',
                height: '100%',
                padding: '1rem'
            }}>

            {/* Información de la ruta - Izquierda */}
            <div className="w-[40%] flex flex-col gap-4">
                {/* Header */}
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={handleClose}
                            className='text-secondary p-2 btn-search rounded-full hover:text-primary transition-colors cursor-pointer'
                        >
                            <md-icon className="text-xl">close</md-icon>
                        </button>
                        <h2 className='h4 font-medium text-primary'>Ruta</h2>
                    </div>
                </div>

                <div className='flex gap-2'>
                    <button className='btn btn-primary btn-sm font-medium flex items-center gap-1'>
                        <md-icon className="text-sm">edit</md-icon>
                        Editar ruta
                    </button>
                    <button className='btn btn-primary btn-sm font-medium flex items-center gap-1'>
                        <md-icon className="text-sm">add</md-icon>
                        Agregar ruta
                    </button>
                </div>

                {/* Tarjeta principal con origen y destino */}
                <div className='bg-primary text-on-primary content-box-small'>
                    <h1 className='h3 text-on-primary font-bold mb-2'>{origenNombre} <md-icon className='text-4xl '>arrow_right</md-icon> {destinoNombre}</h1>
                    <div className='text-sm text-on-primary/90'>
                        <p><span className='font-medium'>Origen:</span> {origenNombre}</p>
                        <p><span className='font-medium'>Destino:</span> {destinoNombre}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                    {/* Estado de la ruta */}
                    <div className="content-box-outline-3-small">
                        <h3 className="subtitle1 text-primary font-medium mb-2">Estado de la ruta</h3>
                        <span className={`btn font-medium btn-sm inline-block ${ruta.estado === 'Activa' ? 'btn-green' : 'btn-red'}`}>
                            {ruta.estado || 'Sin estado'}
                        </span>
                    </div>

                    {/* Detalles de la ruta */}
                    <div className="content-box-outline-3-small">
                        <h3 className="subtitle1 text-primary font-medium mb-3">Detalles de la ruta</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className='text-xs text-secondary mb-1'>Duración estimada:</p>
                                <p className='h3 font-bold'>{ruta.tiempoEstimado || '0:00'}hrs</p>
                            </div>
                            <div>
                                <p className='text-xs text-secondary mb-1'>Distancia estimada:</p>
                                <p className='h3 font-bold'>{ruta.distancia || '0'}km</p>
                            </div>
                        </div>

                        <div className='mb-4'>
                            <p className='text-xs text-secondary mb-1'>Precio base:</p>
                            <p className='h3 font-bold text-green'>${ruta.precioBase?.toLocaleString() || '0'}</p>
                        </div>

                        <div className='mb-4'>
                            <p className='text-xs text-secondary mb-1'>Observaciones:</p>
                            <p className='text-sm text-secondary'>
                                {ruta.observaciones || 'Sin observaciones'}
                            </p>
                        </div>
                    </div>

                    {/* Eliminar ruta */}
                    <div className='mt-auto pt-6'>
                        <button
                            className='font-medium flex items-center gap-1 text-on-surface/60 hover:text-on-surface transition-colors'
                            onClick={handleDeleteClick}
                        >
                            <md-icon className=" text-sm">delete</md-icon>
                            <span className='te' >Eliminar ruta</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mapa - Derecha */}
            <div className="w-[60%]">
                <div 
                    ref={mapRef} 
                    className="h-full rounded-2xl shadow-2xl border-2 border-gray-800"
                    style={{ minHeight: '90vh' }}
                />
            </div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="ruta"
                itemName={`${origenNombre} - ${destinoNombre}`}
            />
        </div>
    );
};

export default RutasProfile;