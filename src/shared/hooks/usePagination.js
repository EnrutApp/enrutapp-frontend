import { useState, useEffect } from "react";

const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState] = useState(itemsPerPage);

  // Calcular valores de paginación
  const totalPages = Math.ceil(data.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = startIndex + itemsPerPageState;
  const currentData = data.slice(startIndex, endIndex);
  const showPagination = totalPages > 1;

  // Función para cambiar de página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll suave hacia arriba para mostrar nuevos resultados
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Resetear a página 1 cuando cambian los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  // Navegación global con teclado
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if (showPagination) {
        if (event.key === "ArrowLeft" && currentPage > 1) {
          event.preventDefault();
          handlePageChange(currentPage - 1);
        } else if (event.key === "ArrowRight" && currentPage < totalPages) {
          event.preventDefault();
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [currentPage, totalPages, showPagination]);

  return {
    currentPage,
    totalPages,
    currentData,
    showPagination,
    handlePageChange,
    startIndex,
    endIndex: Math.min(endIndex, data.length),
    totalItems: data.length,
  };
};

export default usePagination;
