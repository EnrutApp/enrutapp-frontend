import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemType = 'elemento',
  isPlural = false,
}) => {
  const getPronoun = () => {
    const feminineSingular = ['ubicación', 'ruta', 'encomienda', 'reserva'];
    const femininePlural = ['ubicaciones', 'rutas', 'encomiendas', 'reservas'];

    const masculineSingular = [
      'rol',
      'usuario',
      'vehículo',
      'cliente',
      'conductor',
      'turno',
    ];
    const masculinePlural = [
      'roles',
      'usuarios',
      'vehículos',
      'clientes',
      'conductores',
      'turnos',
    ];

    const itemTypeLower = itemType.toLowerCase();

    if (isPlural) {
      if (femininePlural.includes(itemTypeLower)) {
        return 'estas';
      } else if (masculinePlural.includes(itemTypeLower)) {
        return 'estos';
      }
      return 'estos';
    } else {
      if (feminineSingular.includes(itemTypeLower)) {
        return 'esta';
      } else if (masculineSingular.includes(itemTypeLower)) {
        return 'este';
      }
      return 'este';
    }
  };

  const pronoun = getPronoun();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-center justify-center mb-4 mt-3">
          <md-icon className="text-blue">delete</md-icon>
        </div>

        <div className="text-center mb-6">
          <h2 className="h4 font-medium text-primary">Eliminar {itemType}</h2>
          <p className="text-secondary subtitle1 font-light">
            ¿Estás seguro(a) que quieres <br /> eliminar {pronoun} {itemType}?
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-5 text-blue cursor-pointer" onClick={onClose}>
            Cancelar
          </button>
          <md-filled-button className="btn-red px-5 w-32" onClick={onConfirm}>
            Eliminar
          </md-filled-button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
