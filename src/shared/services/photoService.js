import apiClient from "./apiService";

export const photoService = {
  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.patch("/auth/foto", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },
  deleteProfilePhoto: async () => {
    const response = await apiClient.delete("/auth/foto");
    return response;
  },
};

export default photoService;
