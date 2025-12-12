import { useState, useEffect } from 'react';

const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  const showPagination = totalPages > 1;

  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, itemsPerPage]);

  useEffect(() => {
    const handleGlobalKeyDown = event => {
      if (showPagination) {
        if (event.key === 'ArrowLeft' && currentPage > 1) {
          event.preventDefault();
          handlePageChange(currentPage - 1);
        } else if (event.key === 'ArrowRight' && currentPage < totalPages) {
          event.preventDefault();
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
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
