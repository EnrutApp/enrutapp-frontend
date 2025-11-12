import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '@material/web/icon/icon.js';

const SortableParadaItem = ({ parada, index, onRemove, loading }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(parada.idUbicacion || index) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div
        ref={setNodeRef}
        style={style}
        className="content-box-outline-8-small p-3 flex items-center "
      >
        <div className="flex items-center justify-between">
          <md-icon
            {...attributes}
            {...listeners}
            className="text-secondary text-lg cursor-move hover:text-primary transition-colors"
          >
            drag_handle
          </md-icon>
          <span className="text-xs font-medium text-secondary bg-primary/20 px-2 py-1 rounded">
            {index + 1}
          </span>
          <span className="text-sm text-secondary font-medium truncate">
            {parada.nombreUbicacion || parada.nombre}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-outline-2 text-red hover:opacity-75 transition-opacity p-1"
        disabled={loading}
      >
        <md-icon className="text-base">delete</md-icon>
      </button>
    </div>
  );
};

export default SortableParadaItem;
