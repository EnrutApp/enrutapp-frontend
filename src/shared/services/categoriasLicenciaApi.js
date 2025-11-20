import apiClient from './apiService';

/**
 * API para gestionar categorías de licencia de conducción
 */

/**
 * Obtener todas las categorías de licencia activas
 * @returns {Promise<Array>} Lista de categorías de licencia
 */
export const obtenerCategoriasLicencia = async () => {
  try {
    const response = await apiClient.get('/categorias-licencia');
    return response;
  } catch (error) {
    console.error('Error al obtener categorías de licencia:', error);
    throw error;
  }
};

/**
 * Obtener una categoría de licencia por ID
 * @param {string} id - ID de la categoría
 * @returns {Promise<Object>} Categoría de licencia
 */
export const obtenerCategoriaLicenciaPorId = async id => {
  try {
    const response = await apiClient.get(`/categorias-licencia/${id}`);
    return response;
  } catch (error) {
    console.error('Error al obtener categoría de licencia:', error);
    throw error;
  }
};

/**
 * Crear una nueva categoría de licencia
 * @param {Object} data - Datos de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
export const crearCategoriaLicencia = async data => {
  try {
    const response = await apiClient.post('/categorias-licencia', data);
    return response;
  } catch (error) {
    console.error('Error al crear categoría de licencia:', error);
    throw error;
  }
};

/**
 * Actualizar una categoría de licencia
 * @param {string} id - ID de la categoría
 * @param {Object} data - Datos actualizados
 * @returns {Promise<Object>} Categoría actualizada
 */
export const actualizarCategoriaLicencia = async (id, data) => {
  try {
    const response = await apiClient.put(`/categorias-licencia/${id}`, data);
    return response;
  } catch (error) {
    console.error('Error al actualizar categoría de licencia:', error);
    throw error;
  }
};

/**
 * Eliminar una categoría de licencia
 * @param {string} id - ID de la categoría
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const eliminarCategoriaLicencia = async id => {
  try {
    const response = await apiClient.delete(`/categorias-licencia/${id}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar categoría de licencia:', error);
    throw error;
  }
};

/**
 * Servicio para categorías de licencia (objeto con métodos)
 */
export const categoriasLicenciaService = {
  getCategorias: obtenerCategoriasLicencia,
  getCategoriaById: obtenerCategoriaLicenciaPorId,
  createCategoria: crearCategoriaLicencia,
  updateCategoria: actualizarCategoriaLicencia,
  deleteCategoria: eliminarCategoriaLicencia,
};

export default categoriasLicenciaService;
