import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/circular-progress.js';
import viajesService from './api/viajesService';
import pasajesService from '../pasajes/api/pasajesService';
import encomiendasService from '../encomiendas/api/encomiendasService';
import AddPasajeModal from './components/AddPasajeModal';
import AddEncomiendaModal from './components/AddEncomiendaModal';

const ViajeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pasajeros');

  const [pasajes, setPasajes] = useState([]);
  const [encomiendas, setEncomiendas] = useState([]);
  const [isPasajeModalOpen, setIsPasajeModalOpen] = useState(false);
  const [isEncomiendaModalOpen, setIsEncomiendaModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [viajeRes, pasajesRes, encomiendasRes] = await Promise.all([
        viajesService.getViajeById(id),
        pasajesService.getByViaje(id),
        encomiendasService.getByViaje(id),
      ]);

      setViaje(viajeRes.data);
      setPasajes(pasajesRes.data || []);
      setEncomiendas(encomiendasRes.data || []);
    } catch (error) {
      console.error('Error loading viaje details:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLists = async () => {
    const [pasajesRes, encomiendasRes] = await Promise.all([
      pasajesService.getByViaje(id),
      encomiendasService.getByViaje(id),
    ]);
    setPasajes(pasajesRes.data || []);
    setEncomiendas(encomiendasRes.data || []);

    const viajeRes = await viajesService.getViajeById(id);
    setViaje(viajeRes.data);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <md-circular-progress indeterminate></md-circular-progress>
      </div>
    );
  }

  if (!viaje) {
    return <div className="p-6">Viaje no encontrado</div>;
  }

  const { ruta, turno, cuposDisponibles } = viaje;

  return (
    <div className="w-full h-full p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
        >
          <md-icon>arrow_back</md-icon>
        </button>
        <div>
          <h1 className="text-h5 font-bold text-primary">Detalles del Viaje</h1>
          <p className="text-body2 text-secondary flex items-center gap-2">
            ID:{' '}
            <span className="font-mono text-xs bg-fill px-2 rounded opacity-70">
              {id}
            </span>
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <div className="px-3 py-1 bg-primary/10 rounded-lg text-primary font-bold">
            {cuposDisponibles} Cupos Libres
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-2xl p-6 h-fit space-y-6">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <md-icon>info</md-icon> Información General
          </h2>

          <div className="p-4 bg-fill/50 rounded-xl border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-secondary uppercase font-bold tracking-wider">
                Ruta
              </span>
              <span className="text-primary font-bold">
                ${ruta?.precioBase}
              </span>
            </div>
            <div className="flex items-center gap-2 text-primary font-medium">
              <span>{ruta?.origen?.ubicacion?.nombre}</span>
              <md-icon className="text-sm text-secondary">
                arrow_forward
              </md-icon>
              <span>{ruta?.destino?.ubicacion?.nombre}</span>
            </div>
          </div>

          <div className="p-4 bg-fill/50 rounded-xl border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-secondary uppercase font-bold tracking-wider">
                Conductor & Vehículo
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <md-icon>person</md-icon>
              </div>
              <div>
                <div className="font-bold text-primary">
                  {turno?.conductor?.usuario?.nombre}
                </div>
                <div className="text-xs text-secondary font-mono">
                  {turno?.vehiculo?.placa} • {turno?.vehiculo?.modelo}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <md-filled-button
              className="w-full h-12"
              onClick={() => setIsPasajeModalOpen(true)}
            >
              <md-icon slot="icon">airplane_ticket</md-icon>
              Vender Pasaje
            </md-filled-button>
            <md-filled-button
              className="w-full h-12"
              onClick={() => setIsEncomiendaModalOpen(true)}
            >
              <md-icon slot="icon">inventory_2</md-icon>
              Encomienda
            </md-filled-button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 min-h-[500px] flex flex-col">
          <div className="flex border-b border-border mb-6">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'pasajeros' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
              onClick={() => setActiveTab('pasajeros')}
            >
              Pasajeros
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'encomiendas' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'}`}
              onClick={() => setActiveTab('encomiendas')}
            >
              Encomiendas
            </button>
          </div>

          <div className="flex-1">
            {activeTab === 'pasajeros' ? (
              pasajes.length === 0 ? (
                <div className="text-center text-secondary py-10 opacity-60">
                  <md-icon className="text-4xl mb-2">airplane_ticket</md-icon>
                  <p>No hay pasajeros registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pasajes.map(pasaje => (
                    <div
                      key={pasaje.idPasaje}
                      className="bg-fill border border-border p-3 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-primary">
                          {pasaje.nombrePasajero}
                        </div>
                        <div className="text-xs text-secondary">
                          Doc: {pasaje.documentoPasajero} • Asiento:{' '}
                          {pasaje.asiento}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          ${pasaje.precio}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green/10 text-green border border-green/20">
                          {pasaje.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : encomiendas.length === 0 ? (
              <div className="text-center text-secondary py-10 opacity-60">
                <md-icon className="text-4xl mb-2">inventory_2</md-icon>
                <p>No hay encomiendas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {encomiendas.map(enc => (
                  <div
                    key={enc.idEncomienda}
                    className="bg-fill border border-border p-3 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-primary">{enc.guia}</div>
                      <div className="text-xs text-secondary">
                        De: {enc.remitenteNombre}{' '}
                        <md-icon className="text-[10px] align-middle">
                          arrow_forward
                        </md-icon>{' '}
                        {enc.destinatarioNombre}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        ${enc.precio}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        {enc.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddPasajeModal
        isOpen={isPasajeModalOpen}
        onClose={() => setIsPasajeModalOpen(false)}
        viaje={viaje}
        onSuccess={refreshLists}
      />

      <AddEncomiendaModal
        isOpen={isEncomiendaModalOpen}
        onClose={() => setIsEncomiendaModalOpen(false)}
        viaje={viaje}
        onSuccess={refreshLists}
      />
    </div>
  );
};

export default ViajeDetailsPage;
