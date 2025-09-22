import Modal from '../Modal'
import '@material/web/icon/icon.js'
import '@material/web/button/filled-button.js';

const DeleteModal = ({ isOpen, onClose, onConfirm, itemType = "elemento", itemName = "" }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                    <md-icon className="text-blue">delete</md-icon>
                </div>

                <div className="text-center mb-6">
                    <h2 className="h4 font-medium text-primary">
                        Eliminar {itemType}
                    </h2>
                    <p className="text-secondary subtitle1 font-light">
                        ¿Estás seguro(a) que quieres <br /> eliminar este {itemType}?
                        {itemName && (
                            <span className="block mt-2 font-medium text-primary subtitle2">
                                {itemName}
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button className="btn px-5 text-blue" onClick={onClose}>
                        Cancelar
                    </button>
                    <md-filled-button className="btn-red px-5" onClick={onConfirm}>
                        Eliminar
                    </md-filled-button>

                </div>
            </div>
        </Modal>
    )
}

export default DeleteModal
