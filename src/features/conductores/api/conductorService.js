import apiClient from "../../../shared/services/apiService";

function buildConductorFormData(data, file) {
  const formData = new FormData();
  if (file) formData.append("foto", file);
  
  const fields = {
    idConductor: data.idConductor,
    nombre: data.nombre,
    apellido: data.apellido,
    cedula: data.cedula,
    telefono: data.telefono,
    correo: data.correo,
    licencia: data.licencia,
    estado: typeof data.estado === "boolean" ? String(data.estado) : data.estado,
  };
  
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      formData.append(k, String(v));
    }
  });
  
  return formData;
}

export const conductorService = {
  async getConductores() {
    return await apiClient.get("/conductores");
  },

  async getConductorById(idConductor) {
    return await apiClient.get(`/conductores/${idConductor}`);
  },

  async createConductor(data, file = null) {
    const formData = buildConductorFormData(
      { ...data, estado: data?.estado ?? true },
      file
    );
    return await apiClient.post("/conductores", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async updateConductor(idConductor, data) {
    return await apiClient.put(`/conductores/${idConductor}`, data);
  },

  async updateFoto(idConductor, file) {
    if (!file) throw new Error("Archivo de foto requerido");
    const formData = new FormData();
    formData.append("foto", file);
    return await apiClient.post(`/conductores/${idConductor}/foto`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async deleteConductor(idConductor) {
    return await apiClient.delete(`/conductores/${idConductor}`);
  },
};

export default conductorService;
