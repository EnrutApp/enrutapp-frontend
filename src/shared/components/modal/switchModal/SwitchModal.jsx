import Modal from '../Modal'
import '@material/web/icon/icon.js'
import '@material/web/button/filled-button.js';

const SwitchModal = ({ isOpen, onClose, onConfirm, itemType = "elemento", itemName = "", isCurrentlyActive = true }) => {
    const action = isCurrentlyActive ? "deshabilitar" : "habilitar";
    const actionCapitalized = isCurrentlyActive ? "Deshabilitar" : "Habilitar";

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                    <md-icon className="text-blue">priority_high</md-icon>
                </div>

                <div className="text-center mb-6">
                    <h2 className="h4 font-medium text-primary">
                        ¿Quieres {action} {itemType}?
                    </h2>
                    <p className="text-secondary subtitle1 font-light">
                        ¿Estás seguro(a) que quieres <br /> {action} {itemName ? `a ${itemName}` : `este ${itemType}`}?
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button className="btn px-5 text-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                    <md-filled-button className="btn-add px-5" onClick={onConfirm}>
                        {actionCapitalized}
                    </md-filled-button>
                </div>
            </div>
        </Modal>
    )
}

export default SwitchModal
