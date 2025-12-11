import React, { useState } from 'react';
import Modal from '../../../shared/components/modal/Modal';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import pasajesService from '../../pasajes/api/pasajesService';

const AddPasajeModal = ({ isOpen, onClose, onSuccess, viaje }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombrePasajero: '',
    documentoPasajero: '',
    asiento: '',
    precio: viaje?.ruta?.precioBase || 0,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await pasajesService.create({
        idViaje: viaje.idViaje,
        ...formData,
        precio: Number(formData.precio),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creando pasaje:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Vender Pasaje</h2>
        <div className="flex flex-col gap-4">
          <md-outlined-text-field
            label="Nombre Pasajero"
            name="nombrePasajero"
            value={formData.nombrePasajero}
            onKeyup={e =>
              handleChange({
                target: { name: 'nombrePasajero', value: e.target.value },
              })
            }
            className="w-full"
          ></md-outlined-text-field>

          <md-outlined-text-field
            label="Documento"
            name="documentoPasajero"
            value={formData.documentoPasajero}
            onKeyup={e =>
              handleChange({
                target: { name: 'documentoPasajero', value: e.target.value },
              })
            }
            className="w-full"
          ></md-outlined-text-field>

          <div className="flex gap-4">
            <md-outlined-text-field
              label="Asiento"
              name="asiento"
              value={formData.asiento}
              onKeyup={e =>
                handleChange({
                  target: { name: 'asiento', value: e.target.value },
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
              {loading ? 'Guardando...' : 'Vender'}
            </md-filled-button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddPasajeModal;
