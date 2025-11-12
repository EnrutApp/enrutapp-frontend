import Modal from '../../../../shared/components/modal/Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';

const ForceDeleteUbicacionModal = ({
  isOpen,
  onClose,
  onConfirm,
  ubicacionNombre,
  rutasInfo,
}) => {
  if (!isOpen || !rutasInfo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-center mb-4 mt-3">
          <md-icon className="text-yellow-2">warning</md-icon>
        </div>

        <div className="text-center mb-6">
          <h2 className="h4 font-medium text-primary">Eliminar</h2>
          <p className="text-secondary h5 font-light">
            Esta ubicación tiene{' '}
            <span className="font-medium text-primary">
              {rutasInfo.totalRutas}ruta(s) <br />
              activa(s)
            </span>{' '}
            asociadas.
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-4">
            {rutasInfo.rutas && rutasInfo.rutas.length > 0 ? (
              <div className="mb-4">
                <div className="content-box-outline-7-small max-h-48 overflow-y-auto">
                  <p className="text-xs text-secondary mb-3 ml-2 ">
                    Se eliminarán las siguientes {rutasInfo.totalRutas} ruta(s):
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {rutasInfo.rutas.map((ruta, index) => (
                      <li
                        key={ruta.idRuta || index}
                        className="content-box-outline-4-small p-2"
                      >
                        <div className="text-xs text-secondary flex items-center">
                          <span className="font-medium text-primary mr-2 min-w-[60px]">
                            Ruta {index + 1}:
                          </span>
                          <span className="font-medium truncate">
                            {ruta.origen}
                          </span>
                          <md-icon className="text-base text-secondary mx-1 flex-shrink-0">
                            arrow_right
                          </md-icon>
                          <span className="font-medium truncate">
                            {ruta.destino}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-secondary">
                {rutasInfo.totalRutas} ruta(s) activa(s)
              </p>
            )}
            <p className="text-secondary text-center subtitle2 font-light">
              Si eliminas esta ubicación, se eliminarán también todas las rutas
              asociadas a esta ubicación.
            </p>
          </div>
        </div>

        <div className="text-center mb-6"></div>

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

export default ForceDeleteUbicacionModal;
