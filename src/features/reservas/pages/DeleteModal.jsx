import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';

const DeleteModal = ({ isOpen, onClose, onConfirm, itemType, itemName }) => {
  if (!isOpen) return null;

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        style={{
          background: 'var(--md-sys-color-surface, #fff)',
          color: 'var(--md-sys-color-on-surface, #000)',
        }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className="p-3 rounded-full"
            style={{
              background: 'rgba(211, 47, 47, 0.1)',
            }}
          >
            <md-icon style={{ color: '#d32f2f', fontSize: '24px' }}>
              delete
            </md-icon>
          </div>
          <div className="flex-1">
            <h2
              className="font-medium mb-2"
              style={{
                fontSize: '18px',
                color: 'var(--md-sys-color-on-surface, #000)',
              }}
            >
              Eliminar {itemType}
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--md-sys-color-on-surface-variant, #666)',
              }}
            >
              ¿Estás seguro/a de que quieres eliminar a este {itemType}?
              {itemName && (
                <span style={{ fontWeight: '500' }}> {itemName}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <md-text-button onClick={onClose}>Cerrar</md-text-button>
          <md-filled-button
            onClick={onConfirm}
            style={{
              '--md-filled-button-container-color': '#d32f2f',
              '--md-filled-button-label-text-color': '#fff',
            }}
          >
            Eliminar
          </md-filled-button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
