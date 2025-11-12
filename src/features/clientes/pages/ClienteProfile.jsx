import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useEffect, useState } from 'react';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import EditUserModal from '../../usuarios/components/editUserModal/EditUserModal';
import userService from '../../usuarios/api/userService';
import Avvvatars from 'avvvatars-react';

const ClienteProfile = ({ cliente, isOpen, onClose, onClienteUpdated }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [fullCliente, setFullCliente] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && cliente) {
      const base = cliente.raw || cliente;
      const id = base.idUsuario || cliente.idUsuario;
      if (id) {
        userService
          .getUserById(id)
          .then(res => {
            if (res && res.data) setFullCliente(res.data);
            else setFullCliente(res);
          })
          .catch(() => setFullCliente(base));
      } else {
        setFullCliente(base);
      }
    } else {
      setFullCliente(null);
    }
  }, [isOpen, cliente]);

  if (!isOpen || !cliente) return null;

  const base = cliente.raw || cliente;
  const nombre = fullCliente?.nombre ?? base.nombre ?? base.name ?? 'Cliente';
  const numDocumento =
    fullCliente?.numDocumento ?? base.numDocumento ?? base.document ?? '-';
  const correo = fullCliente?.correo ?? base.correo ?? base.email ?? '-';
  const telefono = fullCliente?.telefono ?? base.telefono ?? base.phone ?? '-';
  const direccion =
    fullCliente?.direccion ?? base.direccion ?? base.address ?? '-';
  const ciudad =
    fullCliente?.ciudad?.nombreCiudad ??
    base.ciudad?.nombreCiudad ??
    base.city ??
    '-';
  const estadoBool =
    typeof fullCliente?.estado === 'boolean'
      ? fullCliente.estado
      : (base.estado ?? base.status === 'Activo');
  const estadoLabel = estadoBool ? 'Activo' : 'Inactivo';
  const rol = fullCliente?.rol?.nombreRol ?? base.rol?.nombreRol ?? 'Cliente';
  const foto = fullCliente?.foto || base.foto || base.fotoUrl || null;
  const fotoUrl = foto
    ? foto.startsWith?.('http')
      ? foto
      : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${foto}`
    : null;
  const idUsuario = fullCliente?.idUsuario ?? base.idUsuario;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleDeleteClick = () => {
    setClienteToDelete({ idUsuario, nombre });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(idUsuario);
      setIsDeleteModalOpen(false);
      setClienteToDelete(null);
      onClose();

      if (onClienteUpdated) onClienteUpdated({ idUsuario, deleted: true });
      else window.location.reload();
    } catch (error) {
      alert('Error al eliminar el cliente: ' + (error?.message || ''));
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setClienteToDelete(null);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = updatedUser => {
    setFullCliente(updatedUser);
    setIsEditModalOpen(false);
    if (onClienteUpdated) onClienteUpdated(updatedUser);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  return (
    <div
      className={`flex flex-col gap-4 overflow-auto ${isClosing ? 'profile-exit' : 'profile-enter'}`}
      style={{
        background: 'var(--background)',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <button
            onClick={handleClose}
            className="text-secondary p-2 mr-2 btn-search rounded-full hover:text-primary transition-colors cursor-pointer"
          >
            <md-icon className="text-xl flex items-center justify-center">
              arrow_back
            </md-icon>
          </button>
          <h2 className="h4 font-medium text-primary">Perfil de Cliente</h2>
        </div>
        <div className="flex gap-2">
          <div>
            <md-filled-button
              className="btn-add px-6 py-2"
              onClick={handleEditClick}
            >
              <md-icon slot="icon" className="text-sm text-on-primary">
                edit
              </md-icon>
              Editar datos
            </md-filled-button>
          </div>
        </div>
      </div>

      <div className="bg-primary text-on-primary content-box-small-2 flex justify-between gap-4">
        <div>
          <h1 className="h3 text-on-primary">{nombre}</h1>
          <span className="subtitle1 font-medium text-on-primary">
            {numDocumento}
          </span>
        </div>
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto cliente"
              className="rounded-lg w-20 h-20 object-cover"
            />
          ) : (
            <Avvvatars value={nombre} size={80} radius={12} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Estado del cliente
            </span>
            <div className="flex mt-1">
              <button
                className={`btn font-medium btn-lg flex items-center ${estadoBool ? 'btn-primary' : 'btn-secondary'}`}
              >
                {estadoLabel}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Rol</span>
            <span className="subtitle1 text-secondary mt-1">{rol}</span>
          </div>
        </div>

        <div className="content-box-outline-3-small">
          <span className="subtitle1 text-primary font-light">Permisos</span>
          <div className="flex mt-1">
            <button className="btn btn-primary font-medium btn-lg flex items-center">
              Ver permisos
            </button>
          </div>
        </div>

        <div className="content-box-outline-3">
          <div className="flex flex-col gap-1">
            <span className="subtitle1 text-primary font-light">Contacto</span>
            <span className="subtitle1 text-secondary">Correo: {correo}</span>
            <span className="subtitle1 text-secondary">
              Teléfono: {telefono}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            <div className="content-box-outline-3-small">
              <span className="subtitle1">Ciudad</span>
              <span className="subtitle1 text-secondary mt-1">{ciudad}</span>
            </div>
            <div className="content-box-outline-3-small">
              <span className="subtitle1">Dirección</span>
              <span className="subtitle1 text-secondary mt-1">{direccion}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            className="cursor-pointer font-medium flex text-red items-center"
            onClick={e => {
              e.stopPropagation();
              handleDeleteClick();
            }}
          >
            <md-icon className="text-sm">delete</md-icon>
            Eliminar cliente
          </button>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="cliente"
        itemName={clienteToDelete?.nombre}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleEditCancel}
        onConfirm={handleEditConfirm}
        user={fullCliente || base}
      />
    </div>
  );
};

export default ClienteProfile;
