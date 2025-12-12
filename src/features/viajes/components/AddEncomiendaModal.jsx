import React, { useState } from 'react';
import Modal from '../../../shared/components/modal/Modal';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import encomiendasService from '../../encomiendas/api/encomiendasService';

const AddEncomiendaModal = ({ isOpen, onClose, onSuccess, viaje }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    remitenteNombre: '',
    remitenteTel: '',
    destinatarioNombre: '',
    destinatarioTel: '',
    descripcion: '',
    precio: '',
    peso: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await encomiendasService.create({
        idViaje: viaje.idViaje,
        ...formData,
        precio: Number(formData.precio),
        peso: Number(formData.peso),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creando encomienda:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary mb-4">
          Nueva Encomienda
        </h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <md-outlined-text-field
              label="Nombre Remitente"
              name="remitenteNombre"
              value={formData.remitenteNombre}
              onKeyup={e =>
                handleChange({
                  target: { name: 'remitenteNombre', value: e.target.value },
                })
              }
              className="w-full"
            ></md-outlined-text-field>
            <md-outlined-text-field
              label="Tel Remitente"
              name="remitenteTel"
              value={formData.remitenteTel}
              onKeyup={e =>
                handleChange({
                  target: { name: 'remitenteTel', value: e.target.value },
                })
              }
              className="w-full"
            ></md-outlined-text-field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <md-outlined-text-field
              label="Nombre Destinatario"
              name="destinatarioNombre"
              value={formData.destinatarioNombre}
              onKeyup={e =>
                handleChange({
                  target: { name: 'destinatarioNombre', value: e.target.value },
                })
              }
              className="w-full"
            ></md-outlined-text-field>
            <md-outlined-text-field
              label="Tel Destinatario"
              name="destinatarioTel"
              value={formData.destinatarioTel}
              onKeyup={e =>
                handleChange({
                  target: { name: 'destinatarioTel', value: e.target.value },
                })
              }
              className="w-full"
            ></md-outlined-text-field>
          </div>

          <md-outlined-text-field
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onKeyup={e =>
              handleChange({
                target: { name: 'descripcion', value: e.target.value },
              })
            }
            className="w-full"
          ></md-outlined-text-field>

          <div className="flex gap-4">
            <md-outlined-text-field
              label="Peso (kg)"
              type="number"
              name="peso"
              value={formData.peso}
              onKeyup={e =>
                handleChange({
                  target: { name: 'peso', value: e.target.value },
                })
              }
              className="w-1/2"
            ></md-outlined-text-field>
            <md-outlined-text-field
              label="Precio"
              type="number"
              name="precio"
              value={formData.precio}
              onKeyup={e =>
                handleChange({
                  target: { name: 'precio', value: e.target.value },
                })
              }
              className="w-1/2"
            ></md-outlined-text-field>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="text-secondary px-4">
              Cancelar
            </button>
            <md-filled-button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar'}
            </md-filled-button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddEncomiendaModal;
