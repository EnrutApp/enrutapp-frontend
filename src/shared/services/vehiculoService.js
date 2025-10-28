import apiClient from "./apiService";

// Utilidades internas para construir FormData
function buildVehiculoFormData(data, file) {
  const formData = new FormData();
  if (file) formData.append("foto", file);
  // Campos obligatorios y opcionales
  const fields = {
    idVehiculo: data.idVehiculo,
    idTipoVehiculo: data.idTipoVehiculo,
    idMarcaVehiculo: data.idMarcaVehiculo,
    placa: data.placa,
    linea: data.linea,
    modelo: data.modelo,
    color: data.color,
    vin: data.vin,
    capacidadPasajeros: data.capacidadPasajeros,
    capacidadCarga: data.capacidadCarga,
    soatVencimiento: data.soatVencimiento,
    tecnomecanicaVencimiento: data.tecnomecanicaVencimiento,
    seguroVencimiento: data.seguroVencimiento,
    estado:
      typeof data.estado === "boolean" ? String(data.estado) : data.estado,
  };
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      formData.append(k, String(v));
    }
  });
  return formData;
}

export const vehiculoService = {
  // Listar vehículos
  async getVehiculos() {
    return await apiClient.get("/vehiculos");
  },

  // Obtener detalle por ID
  async getVehiculoById(idVehiculo) {
    return await apiClient.get(`/vehiculos/${idVehiculo}`);
  },

  // Crear vehículo (requiere foto)
  async createVehiculo(data, file) {
    if (!file) throw new Error("La foto del vehículo es obligatoria");
    const formData = buildVehiculoFormData(
      { ...data, estado: data?.estado ?? true },
      file
    );
    return await apiClient.post("/vehiculos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Actualizar datos del vehículo (sin foto)
  async updateVehiculo(idVehiculo, data) {
    return await apiClient.put(`/vehiculos/${idVehiculo}`, data);
  },

  // Actualizar solo la foto
  async updateFoto(idVehiculo, file) {
    if (!file) throw new Error("Archivo de foto requerido");
    const formData = new FormData();
    formData.append("foto", file);
    return await apiClient.post(`/vehiculos/${idVehiculo}/foto`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Eliminar vehículo
  async deleteVehiculo(idVehiculo) {
    return await apiClient.delete(`/vehiculos/${idVehiculo}`);
  },
};

export default vehiculoService;
