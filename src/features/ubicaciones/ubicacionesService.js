import api from "../../shared/services/apiService";

const ubicacionesService = {
  async getAll() {
    const res = await api.get("/ubicaciones");
    return res;
  },

  async getById(id) {
    const res = await api.get(`/ubicaciones/${id}`);
    return res;
  },

  async create(data) {
    const res = await api.post("/ubicaciones", data);
    return res;
  },

  async update(id, data) {
    const res = await api.put(`/ubicaciones/${id}`, data);
    return res;
  },

  async remove(id) {
    const res = await api.delete(`/ubicaciones/${id}`);
    return res;
  },
};

export default ubicacionesService;
