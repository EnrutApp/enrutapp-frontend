import apiClient from '../../../shared/services/apiService';

export const contratosService = {
  async list(params = {}) {
    const searchParams = new URLSearchParams();
    if (params?.idTurno) searchParams.set('idTurno', params.idTurno);
    if (params?.placa) searchParams.set('placa', params.placa);

    const qs = searchParams.toString();
    return apiClient.get(`/contratos${qs ? `?${qs}` : ''}`);
  },

  async getById(idContrato) {
    return apiClient.get(`/contratos/${idContrato}`);
  },

  async create({ data, pdfFile }) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (pdfFile) formData.append('pdf', pdfFile);

    return apiClient.post('/contratos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async downloadPdf(idContrato) {
    return apiClient.get(`/contratos/${idContrato}/pdf`, {
      responseType: 'blob',
    });
  },
};

export default contratosService;
