// src/features/ubicaciones/pages/UbicacionAdd.jsx
import "@material/web/icon/icon.js";
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";
import "@material/web/textfield/filled-text-field.js";
import "@material/web/switch/switch.js";
import { useState, useEffect } from "react";
import ubicacionesService from "../ubicacionesService";

const UbicacionAdd = ({ isOpen, onClose, onConfirm, itemData }) => {
  const isEditMode = !!itemData;

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [estado, setEstado] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && itemData) {
      setNombre(itemData.nombre || "");
      setDireccion(itemData.direccion || "");
      setEstado(itemData.estado === true || itemData.estado === 1);
    } else {
      setNombre("");
      setDireccion("");
      setEstado(true);
    }
  }, [itemData, isEditMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Corregido: enviamos estado como booleano
    const data = {
      nombre,
      direccion,
      estado: Boolean(estado),
    };

    try {
      if (isEditMode) {
        await ubicacionesService.update(itemData.id, data);
      } else {
        await ubicacionesService.create(data);
      }
      onConfirm();
      onClose();
    } catch (error) {
      console.error("Error guardando ubicación:", error);
      alert(
        error?.response?.data?.message || "Error al guardar la ubicación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="content-box-large w-[600px] bg-surface text-on-surface p-6 rounded-2xl shadow-lg">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-secondary p-2 hover:text-primary rounded-full transition-colors"
            >
              <md-icon>arrow_back</md-icon>
            </button>
            <h2 className="h4 font-medium text-primary">
              {isEditMode ? "Editar Ubicación" : "Añadir Ubicación"}
            </h2>
          </div>
        </div>

        <p className="text-secondary mb-6">
          {isEditMode
            ? "Modifica la información de la ubicación seleccionada."
            : "Completa la información para registrar una nueva ubicación."}
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="subtitle2 text-primary">Nombre</label>
            <md-filled-text-field
              label="Ej: Oficina Central"
              value={nombre}
              onInput={(e) => setNombre(e.target.value)}
              required
              className="w-full text-on-surface"
              style={{
                "--md-sys-color-on-surface": "var(--on-surface)",
                "--md-sys-color-surface-container-highest": "transparent",
                color: "var(--on-surface)",
              }}
            ></md-filled-text-field>
          </div>

          <div>
            <label className="subtitle2 text-primary">Dirección</label>
            <md-filled-text-field
              label="Ej: Cra 10 #20-30"
              value={direccion}
              onInput={(e) => setDireccion(e.target.value)}
              required
              className="w-full text-on-surface"
              style={{
                "--md-sys-color-on-surface": "var(--on-surface)",
                "--md-sys-color-surface-container-highest": "transparent",
                color: "var(--on-surface)",
              }}
            ></md-filled-text-field>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <label className="subtitle2 text-primary">Estado</label>
            <md-switch
              selected={estado}
              onClick={() => setEstado(!estado)}
            ></md-switch>
            <span className="body2 text-secondary">
              {estado ? "Activa" : "Inactiva"}
            </span>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <md-filled-tonal-button onClick={onClose} disabled={loading}>
              Cancelar
            </md-filled-tonal-button>
            <md-filled-button type="submit" disabled={loading}>
              {loading
                ? "Guardando..."
                : isEditMode
                ? "Guardar cambios"
                : "Añadir"}
            </md-filled-button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UbicacionAdd;
