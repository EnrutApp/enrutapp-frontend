import "@material/web/icon/icon.js";
import "@material/web/button/filled-button.js";
import UbicacionProfile from "./pages/UbicacionProfile";
import Pagination from "../../shared/components/pagination/Pagination";
import usePagination from "../../shared/hooks/usePagination";
import DeleteModal from "../../shared/components/modal/deleteModal/DeleteModal";
import SwitchModal from "../../shared/components/modal/switchModal/SwitchModal";
import UbicacionAdd from "./pages/UbicacionAdd";
import ubicacionesService from "./ubicacionesService";
import { useEffect, useMemo, useState } from "react";

const Ubicacion = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedUbicacion, setSelectedUbicacion] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ubicacionToDelete, setUbicacionToDelete] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [ubicacionToSwitch, setUbicacionToSwitch] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchUbicaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ubicacionesService.getAll();
      const data = Array.isArray(res) ? res : res.data || [];

      const mapped = data.map((u) => ({
        ...u,
        nombre: u.nombre || "Sin nombre",
        direccion: u.direccion || "Sin dirección",
        activo: u.estado === true,
      }));

      setUbicaciones(mapped);
    } catch (err) {
      console.error("Error cargando ubicaciones:", err);
      setError(err?.response?.data?.message || "Error al cargar ubicaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  // Contadores
  const activeCount = useMemo(
    () => ubicaciones.filter((u) => u.activo).length,
    [ubicaciones]
  );
  const inactiveCount = useMemo(
    () => ubicaciones.filter((u) => !u.activo).length,
    [ubicaciones]
  );

  // Paginación
  const {
    currentPage,
    totalPages,
    currentData: currentUbicaciones,
    showPagination,
    handlePageChange,
  } = usePagination(ubicaciones, 4);

  // Perfil
  const handleOpenProfile = (ubicacion) => {
    setSelectedUbicacion(ubicacion);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedUbicacion(null);
  };

  // Eliminar
  const handleDeleteClick = (ubicacion) => {
    setUbicacionToDelete(ubicacion);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ubicacionToDelete) return;
    try {
      await ubicacionesService.remove(ubicacionToDelete.id);
      await fetchUbicaciones();
    } catch (err) {
      alert(err?.response?.data?.message || "Error al eliminar ubicación");
    } finally {
      setIsDeleteModalOpen(false);
      setUbicacionToDelete(null);
    }
  };

  // Cambiar estado
  const handleSwitchClick = (ubicacion) => {
    setUbicacionToSwitch(ubicacion);
    setIsSwitchModalOpen(true);
  };

  const handleSwitchConfirm = async () => {
    if (!ubicacionToSwitch) return;
    try {
      await ubicacionesService.update(ubicacionToSwitch.id, {
        estado: !ubicacionToSwitch.activo, 
      });
      await fetchUbicaciones();
    } catch (err) {
      alert(err?.response?.data?.message || "Error al cambiar estado");
    } finally {
      setIsSwitchModalOpen(false);
      setUbicacionToSwitch(null);
    }
  };

  // Añadir/editar
  const handleAddSuccess = () => fetchUbicaciones();

  const handleOpenEdit = (ubicacion) => {
    setSelectedUbicacion(ubicacion);
    setIsEditOpen(true);
  };

  return (
    <section>
      {!isProfileOpen ? (
        <>
          <div className="list-enter">
            <div className="flex justify-between items-center">
              <h1 className="h4 font-medium">Ubicaciones</h1>
              <div className="flex gap-2">
                <md-filled-button
                  className="btn-add px-5"
                  onClick={() => setIsAddOpen(true)}
                >
                  <md-icon slot="icon" className="text-sm text-on-primary">
                    add
                  </md-icon>
                  Agregar una ubicación
                </md-filled-button>
              </div>
            </div>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

            <div className="flex mt-4 gap-2">
              <div className="content-box-outline-3-small">
                <span className="subtitle2 font-light">Totales</span>
                <h2 className="h4 text-primary font-bold">
                  {ubicaciones.length}
                </h2>
              </div>
              <div className="content-box-outline-3-small">
                <span className="subtitle2 font-light">Activas</span>
                <h2 className="h4 text-primary font-bold">{activeCount}</h2>
              </div>
              <div className="content-box-outline-3-small">
                <span className="subtitle2 font-light">Inactivas</span>
                <h2 className="h4 text-primary font-bold">{inactiveCount}</h2>
              </div>
            </div>

            <div className="mt-3">
              {loading ? (
                <p className="text-secondary">Cargando ubicaciones...</p>
              ) : currentUbicaciones.length > 0 ? (
                currentUbicaciones.map((ubicacion, index) => (
                  <div
                    key={ubicacion.id || index}
                    className={`content-box-outline-4-small ${
                      index > 0 ? "mt-2" : ""
                    } ${ubicacion.activo ? "" : "opacity-60"}`}
                    onClick={() => handleOpenProfile(ubicacion)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="h4">{ubicacion.nombre}</h1>
                        <span className="subtitle2 text-secondary">
                          {ubicacion.direccion}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className={`btn btn-lg font-medium flex items-center ${
                            ubicacion.activo ? "btn-outline" : "btn-secondary"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitchClick(ubicacion);
                          }}
                        >
                          {ubicacion.activo ? "Deshabilitar" : "Habilitar"}
                        </button>
                        <button
                          className="btn btn-secondary btn-lg font-medium flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(ubicacion);
                          }}
                        >
                          <md-icon className="text-sm">delete</md-icon>
                        </button>
                        <button
                          className="btn btn-primary btn-lg font-medium flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(ubicacion);
                          }}
                        >
                          <md-icon className="text-sm">edit</md-icon>
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary mt-4">
                  No hay ubicaciones registradas.
                </p>
              )}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPagination={showPagination}
          />
        </>
      ) : (
        <UbicacionProfile
          ubicacion={selectedUbicacion}
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
          onAdd={() => setIsAddOpen(true)}
          onEdit={(u) => {
            setIsEditOpen(true);
            setSelectedUbicacion(u);
          }}
        />
      )}

      {/* MODALES */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemType="ubicación"
        itemName={ubicacionToDelete?.nombre}
      />

      <SwitchModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        onConfirm={handleSwitchConfirm}
        itemType="ubicación"
        itemName={ubicacionToSwitch?.nombre}
        isCurrentlyActive={ubicacionToSwitch?.activo}
      />

      {/* Formulario de agregar/editar */}
      <UbicacionAdd
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onConfirm={handleAddSuccess}
      />

      <UbicacionAdd
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedUbicacion(null);
        }}
        onConfirm={fetchUbicaciones}
        itemData={selectedUbicacion}
      />
    </section>
  );
};

export default Ubicacion;
