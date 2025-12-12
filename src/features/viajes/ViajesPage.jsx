import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/constants/routeConstants';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/circular-progress.js';
import viajesService from './api/viajesService';
import Avvvatars from 'avvvatars-react';
import { resolveAssetUrl } from '../../shared/utils/url';
import AddViajeModal from './components/AddViajeModal';

const ViajesPage = () => {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadViajes();
  }, []);

  const loadViajes = async () => {
    try {
      setLoading(true);
      const response = await viajesService.getViajes();
      setViajes(response.data || []);
    } catch (error) {
      console.error('Error cargando viajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredViajes = viajes.filter(viaje => {
    const rutaName = viaje.ruta
      ? `${viaje.ruta.origen?.ubicacion?.nombreUbicacion} - ${viaje.ruta.destino?.ubicacion?.nombreUbicacion}`
      : '';
    const driverName = viaje.turno?.conductor?.usuario?.nombre || '';
    return (
      rutaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driverName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full h-full p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <md-icon className="text-3xl">map</md-icon>
          </div>
          <div>
            <h1 className="text-h4 font-bold text-primary">
              Gestión de Viajes
            </h1>
            <p className="text-body2 text-secondary">
              Administra rutas, conductores y pasajeros
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <md-icon className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">
              search
            </md-icon>
            <input
              type="text"
              placeholder="Buscar viaje..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-fill border border-border rounded-xl text-primary text-sm placeholder:text-secondary focus:outline-none focus:border-primary transition-colors min-w-[240px]"
            />
          </div>
          <md-filled-button
            class="btn-add"
            onClick={() => setIsAddModalOpen(true)}
          >
            <md-icon slot="icon">add</md-icon>
            Crear Viaje
          </md-filled-button>
        </div>
      </div>

      <div className="content-box-outline-2-small p-0 overflow-hidden flex flex-col flex-1 rounded-2xl shadow-sm bg-surface">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 min-h-[400px]">
            <md-circular-progress
              indeterminate
              size="large"
            ></md-circular-progress>
            <span className="text-secondary text-sm font-medium">
              Cargando viajes...
            </span>
          </div>
        ) : filteredViajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 min-h-[400px] text-secondary opacity-60">
            <md-icon className="text-4xl">no_transfer</md-icon>
            <p>No se encontraron viajes registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 overflow-y-auto">
            {filteredViajes.map(viaje => {
              const origen =
                viaje.ruta?.origen?.ubicacion?.nombreUbicacion || 'Origen';
              const destino =
                viaje.ruta?.destino?.ubicacion?.nombreUbicacion || 'Destino';
              const conductorNombre =
                viaje.turno?.conductor?.usuario?.nombre || 'Sin Conductor';
              const placa = viaje.turno?.vehiculo?.placa || '---';

              return (
                <div
                  key={viaje.idViaje}
                  className="bg-fill border border-border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group hover:border-primary/50"
                  onClick={() =>
                    navigate(
                      ROUTES.ADMIN.VIAJE_DETALLE.replace(':id', viaje.idViaje)
                    )
                  }
                >
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-bold border ${
                        viaje.estado === 'Programado'
                          ? 'bg-blue-500/10 border-blue-500/20'
                          : viaje.estado === 'En Curso'
                            ? 'bg-green/10 text-green border-green/20'
                            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}
                    >
                      {viaje.estado}
                    </span>
                    <span className="text-xs text-secondary font-mono">
                      {new Date(viaje.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex flex-col flex-1">
                      <span
                        className="text-lg font-bold text-primary truncate"
                        title={origen}
                      >
                        {origen}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-0.5 h-3 bg-border mx-1"></div>
                        <md-icon className="text-xs text-secondary rotate-90">
                          arrow_forward
                        </md-icon>
                      </div>
                      <span
                        className="text-lg font-bold text-primary truncate"
                        title={destino}
                      >
                        {destino}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                      <md-icon>person</md-icon>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-primary truncate">
                        {conductorNombre}
                      </span>
                      <span className="text-xs text-secondary font-mono bg-fill px-1 rounded truncate w-fit">
                        {placa}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddViajeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadViajes}
      />
    </div>
  );
};

export default ViajesPage;
