import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';

const DeleteWithDependenciesModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  dependencies = [],
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-center mb-4 mt-3">
          <md-icon className="text-yellow-2">warning</md-icon>
        </div>

        <div className="text-center mb-6">
          <h2 className="h4 font-medium text-primary">Eliminar</h2>
          <p className="text-secondary h5 font-light">
            Este rol tiene{' '}
            <span className="font-medium text-primary">
              {dependencies.length} usuario(s)
            </span>{' '}
            asignados.
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-4">
            {dependencies.length > 0 ? (
              <div className="mb-4">
                <div className="content-box-outline-7-small max-h-48 overflow-y-auto">
                  <p className="text-xs text-secondary mb-3 ml-2 ">
                    Se eliminarán los siguientes usuario(s):
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {dependencies.map((dep, index) => (
                      <li
                        key={index}
                        className="content-box-outline-4-small p-2"
                      >
                        <div className="text-xs text-secondary flex items-center">
                          <span className="font-medium text-primary mr-2 min-w-[60px]">
                            Usuario {index + 1}:
                          </span>
                          <span className="font-medium truncate">{dep}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-secondary">
                {dependencies.length} usuario(s) asignados
              </p>
            )}
            <p className="text-secondary text-center subtitle2 font-light">
              Si eliminas este rol, se eliminarán también todos los usuarios
              asignados.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-5 text-blue cursor-pointer" onClick={onClose}>
            Cancelar
          </button>
          <md-filled-button className="btn-red px-5 w-32" onClick={onConfirm}>
            Eliminar todo
          </md-filled-button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteWithDependenciesModal;
