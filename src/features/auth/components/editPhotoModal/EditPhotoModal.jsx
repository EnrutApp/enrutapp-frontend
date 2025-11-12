import Modal from '../../../../shared/components/modal/Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';

const EditPhotoModal = ({
  isOpen,
  onClose,
  user,
  uploading,
  fileInputRef,
  handleAddPhoto,
  handleDeletePhoto,
  handleFileChange,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="h4 font-medium text-primary">Editar foto</h2>
          <p className="text-secondary subtitle1 font-light">
            Aqui podras editar tu foto de perfil.
          </p>
        </div>

        <div className="text-center mb-6">
          <button
            className="w-full btn btn-primary"
            onClick={handleAddPhoto}
            disabled={uploading}
          >
            <md-icon className="mr-2 text-base">add_photo_alternate</md-icon>
            Agregar foto
          </button>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {user?.foto && (
            <button
              className="w-full btn btn-secondary text-red mt-3"
              onClick={handleDeletePhoto}
              disabled={uploading}
            >
              <md-icon className="mr-2 text-base text-red">delete</md-icon>
              Eliminar foto
            </button>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button className="btn px-5 text-blue" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditPhotoModal;
