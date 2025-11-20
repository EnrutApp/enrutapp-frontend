import '@material/web/icon/icon.js';
import './styles/styles.css';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPagination = true,
  className = '',
}) => {
  const handleKeyDown = (event, page) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPageChange(page);
    }
  };

  if (!showPagination || totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={`sticky bottom-4 flex justify-center z-40 pagination ${className}`}
      role="navigation"
      aria-label="Navegación de páginas"
    >
      <div className="bg-surface-container/90 backdrop-blur-xl border border-border rounded-full shadow-xl px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label={`Ir a página anterior ${currentPage > 1 ? currentPage - 1 : ''}`}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
              currentPage === 1
                ? 'text-secondary/50 cursor-not-allowed opacity-40'
                : 'text-primary hover:bg-surface-container-high/60 hover:text-primary hover:scale-105 active:scale-95'
            }`}
          >
            <md-icon className="text-lg btn-pagination rounded-full">
              chevron_left
            </md-icon>
          </button>

          <div className="flex items-center gap-2 px-2 py-1 bg-surface-container-high/40 rounded-full">
            <span className="text-primary text-sm font-medium">
              {currentPage} de {totalPages}
            </span>
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label={`Ir a página siguiente ${currentPage < totalPages ? currentPage + 1 : ''}`}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200 ${
              currentPage === totalPages
                ? 'text-secondary/50 cursor-not-allowed opacity-40'
                : 'text-primary hover:bg-surface-container-high/60 hover:text-primary hover:scale-105 active:scale-95'
            }`}
          >
            <md-icon className="text-lg btn-pagination rounded-full">
              chevron_right
            </md-icon>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Pagination;
