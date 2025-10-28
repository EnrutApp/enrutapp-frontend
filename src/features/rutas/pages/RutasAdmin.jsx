import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../../shared/components/modal/switchModal/SwitchModal';
import Pagination from '../../../shared/components/pagination/Pagination';
import usePagination from '../../../shared/hooks/usePagination';
import { useEffect, useState } from 'react';
import apiClient from '../../../shared/services/apiService';
import RutasProfile from '../pages/RutasProfile';
import RutaForm from '../components/RutaForm';

const RutasAdmin = () => {
  const [rutas, setRutas] = useState([]);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rutaToDelete, setRutaToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [rutaToSwitch, setRutaToSwitch] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 🔹 Cargar rutas del backend
  const fetchRutas = async () => {
    try {
      const response = await apiClient.get('/rutas');
      const data = response?.data?.rutas || response?.data || response || [];
      setRutas(Array.isArray(data) ? data : []);
      console.log('Rutas cargadas:', data);
    } catch (error) {
      console.error('Error al cargar rutas:', error);
      setRutas([]);
    }
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  const handleOpenProfile = (ruta) => {
    setSelectedRuta(ruta);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedRuta(null);
  };

  // 🔹 Eliminar ruta
  const handleDeleteClick = (ruta) => {
    setRutaToDelete(ruta);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/rutas/${rutaToDelete.idRuta}`);
      setIsDeleteModalOpen(false);
      setRutaToDelete(null);
      fetchRutas();
    } catch (error) {
      console.error('Error al eliminar ruta:', error);
    }
  };

  // 🔹 Cambiar estado (habilitar/deshabilitar)
  const handleToggleEstado = (ruta, e) => {
    e.stopPropagation();
    setRutaToSwitch(ruta);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    try {
      const nuevoEstado = rutaToSwitch.estado === 'Activa' ? 'Inactiva' : 'Activa';
      await apiClient.patch(`/rutas/${rutaToSwitch.idRuta}`, { estado: nuevoEstado });
      setIsSwitchModalOpen(false);
      setRutaToSwitch(null);
      fetchRutas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setIsSwitchModalOpen(false);
      setRutaToSwitch(null);
    }
  };

  // 🔹 Filtrar rutas por búsqueda
  const filteredRutas = (Array.isArray(rutas) ? rutas : []).filter((ruta) => {
    const origen = ruta.origen?.ubicacion?.nombreUbicacion?.toLowerCase() || '';
    const destino = ruta.destino?.ubicacion?.nombreUbicacion?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return origen.includes(search) || destino.includes(search);
  });

  // 🔹 Paginación
  const {
    currentPage,
    totalPages,
    currentData: currentRutas,
    showPagination,
    handlePageChange,
    startIndex,
    totalItems,
  } = usePagination(filteredRutas, 4);

  return (
    <section>
      {!isProfileOpen && !isFormOpen ? (
        <>
          <div className='list-enter'>
            <div className='flex justify-between items-center'>
              <h1 className='h4 font-medium'>Rutas</h1>
              <div className='flex gap-2'>
                <div className='relative'>
                  <md-filled-button className="btn-search-minimal px-6 py-2">
                    <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                      Buscar
                  </md-filled-button>
                </div>
                <md-filled-button className='btn-add px-5' onClick={() => setIsFormOpen(true)}>
                  <md-icon slot='icon' className='text-sm text-on-primary'>
                    add
                  </md-icon>
                  Agregar ruta
                </md-filled-button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className='flex mt-4 gap-2'>
              <div className='content-box-outline-3-small'>
                <div className='flex flex-col'>
                  <span className='subtitle2 font-light'>Totales</span>
                  <h2 className='h4 text-primary font-bold'>{rutas.length}</h2>
                </div>
              </div>
              <div className='content-box-outline-3-small'>
                <div className='flex flex-col'>
                  <span className='subtitle2 font-light'>Activas</span>
                  <h2 className='h4 text-primary font-bold'>
                    {rutas.filter((r) => r.estado === 'Activa').length}
                  </h2>
                </div>
              </div>
              <div className='content-box-outline-3-small'>
                <div className='flex flex-col'>
                  <span className='subtitle2 font-light'>Inactivas</span>
                  <h2 className='h4 text-primary font-bold'>
                    {rutas.filter((r) => r.estado === 'Inactiva').length}
                  </h2>
                </div>
              </div>
            </div>

            {/* Paginación superior */}
            <div className='flex justify-between items-center mt-6 mb-4'>
              <span className='text-sm text-secondary'>
                Mostrando {totalItems > 0 ? startIndex + 1 : 0}-
                {Math.min(startIndex + 4, totalItems)} de {totalItems} rutas
              </span>
              {showPagination && (
                <span className='text-xs text-secondary'>
                  Página {currentPage} de {totalPages}
                </span>
              )}
            </div>

            {/* Lista de rutas */}
            <div className='mt-3'>
              {currentRutas.length === 0 ? (
                <div className='content-box-outline-4-small text-center py-8'>
                  <p className='text-secondary'>No se encontraron rutas</p>
                </div>
              ) : (
                currentRutas.map((ruta) => (
                  <div
                    key={ruta.idRuta}
                    className={`content-box-outline-4-small cursor-pointer hover:border-primary transition-colors mb-3 ${
                      ruta.estado !== 'Activa' ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleOpenProfile(ruta)}
                  >
                    <div className='flex justify-between items-center'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <h1 className='h4'>{ruta.origen?.ubicacion?.nombreUbicacion || 'Sin origen'}</h1>
                          <md-icon className='text-xl text-secondary'>arrow_right</md-icon>
                          <h1 className='h4'>{ruta.destino?.ubicacion?.nombreUbicacion || 'Sin destino'}</h1>
                        </div>
                        <div className='flex gap-2 mt-2'>
                          <span className={`btn  ${ruta.estado === 'Activa' ? 'btn-green' : 'btn-red'} font-medium btn-lg`}>
                            {ruta.estado}
                          </span>
                          <span className='btn btn-primary  font-medium btn-lg'>
                            ${Number(ruta.precioBase)?.toLocaleString('es-CO') || '0'}
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-2 items-center'>
                        {/* Botón Habilitar/Deshabilitar */}
                        <button
                          className={`btn ${ruta.estado === 'Activa' ? 'btn-secondary' : 'btn-primary'} btn-lg font-medium flex items-center gap-1`}
                          onClick={(e) => handleToggleEstado(ruta, e)}
                        >
                          {ruta.estado === 'Activa' ? 'Deshabilitar' : 'Habilitar'}
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          className='btn btn-secondary btn-lg font-medium flex items-center gap-1'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(ruta);
                          }}
                        >
                          <md-icon className='text-sm'>delete</md-icon>
                        </button>

                        {/* Botón Editar */}
                        <button
                          className='btn btn-primary btn-lg font-medium flex items-center gap-1'
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRuta(ruta);
                            setIsFormOpen(true);
                          }}
                        >
                          <md-icon className='text-sm'>edit</md-icon>
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {showPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showPagination={showPagination}
            />
          )}
        </>
      ) : isFormOpen ? (
        <RutaForm
          ruta={selectedRuta}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedRuta(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setSelectedRuta(null);
            fetchRutas();
          }}
        />
      ) : (
        <RutasProfile 
          ruta={selectedRuta} 
          isOpen={isProfileOpen} 
          onClose={handleCloseProfile}
          onDeleted={fetchRutas}
        />
      )}

      {/* Modales */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType='ruta'
        itemName={`${rutaToDelete?.origen?.ubicacion?.nombreUbicacion || ''} - ${rutaToDelete?.destino?.ubicacion?.nombreUbicacion || ''}`}
      />

      <SwitchModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        onConfirm={handleSwitchConfirm}
        itemType='ruta'
        isCurrentlyActive={rutaToSwitch?.estado === 'Activa'}
      />
    </section>
  );
};

export default RutasAdmin;