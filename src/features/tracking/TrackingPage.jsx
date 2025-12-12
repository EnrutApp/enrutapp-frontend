/**
 * Página de tracking de conductores en tiempo real
 * Vista de administrador para monitorear todos los conductores
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/progress/circular-progress.js';
import DriverTrackingMap from './components/DriverTrackingMap';
import useDriverTracking from '../../shared/hooks/useDriverTracking';
import conductorService from '../conductores/api/conductorService';
import Avvvatars from 'avvvatars-react';
import { resolveAssetUrl } from '../../shared/utils/url';

const TrackingPage = () => {
  const [conductores, setConductores] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConductores, setLoadingConductores] = useState(true);

  const {
    allLocations,
    isConnected,
    isLoading,
    error,
    getDriverLocation,
    isDriverOnline,
  } = useDriverTracking(null);

  useEffect(() => {
    const loadConductores = async () => {
      try {
        setLoadingConductores(true);
        const response = await conductorService.getConductores();
        setConductores(response.data || []);
      } catch (error) {
        console.error('Error al cargar conductores:', error);
      } finally {
        setLoadingConductores(false);
      }
    };

    loadConductores();
  }, []);

  const filteredConductores = conductores.filter(conductor => {
    const nombre =
      `${conductor.usuario?.nombre || ''} ${conductor.usuario?.apellido || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return nombre.includes(query);
  });

  const conductoresConUbicacion = filteredConductores.map(conductor => {
    const location = getDriverLocation(conductor.idConductor);
    return {
      ...conductor,
      location,
      isOnline: isDriverOnline(conductor.idConductor),
    };
  });

  const sortedConductores = [...conductoresConUbicacion].sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return 0;
  });

  const driverLabelById = useMemo(() => {
    const map = new Map();
    conductores.forEach(conductor => {
      const nombre =
        `${conductor.usuario?.nombre || ''} ${conductor.usuario?.apellido || ''}`.trim();
      if (nombre) {
        map.set(conductor.idConductor, nombre);
      }
    });
    return map;
  }, [conductores]);

  const getDriverLabel = useCallback(
    driverId => driverLabelById.get(driverId) || null,
    [driverLabelById]
  );

  const onlineCount = conductoresConUbicacion.filter(c => c.isOnline).length;
  const offlineCount = conductoresConUbicacion.length - onlineCount;

  const handleDriverSelect = driverId => {
    setSelectedDriverId(driverId === selectedDriverId ? null : driverId);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="h3 font-bold text-primary">Mapa en tiempo Real</h1>
            <p className="text-sm text-secondary">
              Monitorea la ubicación de los conductores
            </p>
          </div>
        </div>

        <div
          className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
            isConnected ? 'btn-green' : 'btn-red'
          }`}
        >
          <span className="text-sm font-medium">
            {isConnected ? 'Conectado al servidor' : 'Desconectado'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 min-h-[600px] h-[calc(100vh-180px)]">
        <div className="bg-fill border border-border rounded-2xl overflow-hidden shadow-sm relative h-full">
          <DriverTrackingMap
            locations={allLocations}
            selectedDriverId={selectedDriverId}
            isConnected={isConnected}
            isLoading={isLoading}
            error={error}
            onDriverSelect={handleDriverSelect}
            getDriverLabel={getDriverLabel}
            height="100%"
            showStatusPanel={true}
          />
        </div>

        <div className="flex flex-col gap-4 h-full overflow-hidden">
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-fill border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-medium text-primary mb-1">
                {onlineCount}
              </div>
              <div className="text-xs text-primary font-medium tracking-wide">
                En línea
              </div>
            </div>
            <div className="bg-fill border border-border rounded-xl p-4 text-center">
              <div className="text-2xl font-medium text-primary mb-1 opacity-70">
                {offlineCount}
              </div>
              <div className="text-xs text-primary font-medium tracking-wide">
                Desconectados
              </div>
            </div>
          </div>

          <div className="bg-fill border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm flex-1 min-h-0">
            <div className="p-4 border-b border-border bg-fill shrink-0">
              <h3 className="font-medium text-primary mb-3">Conductores</h3>
              <div className="relative">
                <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
                  search
                </md-icon>
                <input
                  type="text"
                  placeholder="Buscar conductor..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-fill border border-border rounded-xl text-primary text-sm placeholder:text-secondary focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {loadingConductores ? (
                <div className="flex justify-center items-center h-40">
                  <md-circular-progress indeterminate />
                </div>
              ) : sortedConductores.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-secondary opacity-70">
                  <md-icon className="text-2xl mb-2">person_off</md-icon>
                  <p className="text-sm">No se encontraron conductores</p>
                </div>
              ) : (
                sortedConductores.map(conductor => {
                  const nombre =
                    `${conductor.usuario?.nombre || ''} ${conductor.usuario?.apellido || ''}`.trim() ||
                    `Conductor #${conductor.idConductor}`;
                  const fotoUrl = conductor.usuario?.foto
                    ? resolveAssetUrl(conductor.usuario.foto)
                    : null;

                  const isSelected = selectedDriverId === conductor.idConductor;

                  return (
                    <div
                      key={conductor.idConductor}
                      onClick={() => handleDriverSelect(conductor.idConductor)}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border
                        ${
                          isSelected
                            ? 'bg-transparent border-border border-2 shadow-sm'
                            : 'bg-transparent border-border hover:bg-secondary/5 hover:border-border'
                        }
                      `}
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm bg-secondary/10 flex items-center justify-center">
                          {fotoUrl ? (
                            <img
                              src={fotoUrl}
                              alt={nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Avvvatars
                              value={nombre}
                              style="shape"
                              size={48}
                              radius={8}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-primary text-sm truncate leading-tight mb-1">
                          {nombre}
                        </div>
                        {conductor.location ? (
                          <div className="flex items-center gap-2">
                            {conductor.location.speed > 0 && (
                              <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                {(conductor.location.speed * 3.6).toFixed(0)}{' '}
                                km/h
                              </span>
                            )}
                            <span className="text-xs text-secondary font-mono truncate">
                              {conductor.location.latitude.toFixed(4)},{' '}
                              {conductor.location.longitude.toFixed(4)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-secondary">
                            Sin ubicación
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <md-icon className="text-secondary text-lg">
                          chevron_right
                        </md-icon>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
