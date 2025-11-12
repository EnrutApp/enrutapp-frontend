import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useState, useEffect } from 'react';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import EditUserModal from '../components/editUserModal/EditUserModal';
import AddUserModal from '../components/addUserModal/AddUserModal';
import userService from '../api/userService';
import Avvvatars from 'avvvatars-react';
import { resolveAssetUrl } from '../../../shared/utils/url';

const UserProfile = ({ user, isOpen, onClose, onUserUpdated }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user?.idUsuario) {
      userService
        .getUserById(user.idUsuario)
        .then(res => {
          if (res && res.data) {
            setFullUser(res.data);
          } else {
            setFullUser(res);
          }
        })
        .catch(() => setFullUser(user));
    } else {
      setFullUser(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleDeleteClick = user => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = updatedUser => {
    setFullUser(updatedUser);
    setIsEditModalOpen(false);
    if (onUserUpdated) {
      onUserUpdated(updatedUser);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddConfirm = newUser => {
    setIsAddModalOpen(false);
  };

  const handleAddCancel = () => {
    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await userService.deleteUser(userToDelete.idUsuario);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      onClose();
      if (onUserUpdated) {
        window.location.reload();
      }
    } catch (error) {
      
      alert(
        'Error al eliminar el usuario: ' +
          (error.message || 'Error desconocido')
      );
      setIsDeleteModalOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
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
          <h2 className="h4 font-medium text-primary">Perfil de Usuario</h2>
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
          <div>
            <md-filled-button className="btn-add px-5" onClick={handleAddClick}>
              <md-icon slot="icon" className="text-sm text-on-primary">
                person_add
              </md-icon>
              Agregar un usuario
            </md-filled-button>
          </div>
        </div>
      </div>

      <div className="bg-primary text-on-primary content-box-small-2 flex justify-between gap-4">
        <div>
          <h1 className="h3 text-on-primary">
            {fullUser?.nombre || user.nombre}
          </h1>
          <span className="subtitle1 font-medium text-on-primary">
            {fullUser?.numDocumento || user.numDocumento}
          </span>
        </div>
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background">
          {fullUser?.foto ? (
            <img
              src={resolveAssetUrl(fullUser.foto)}
              alt="Foto de perfil"
              className="rounded-lg w-20 h-20 object-cover"
            />
          ) : (
            <Avvvatars
              value={fullUser?.nombre || user.nombre || 'Usuario'}
              size={80}
              radius={12}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Estado del usuario
            </span>
            <div className="flex mt-1">
              <button
                className={`btn font-medium btn-lg flex items-center ${fullUser?.estado ? 'btn-primary' : 'btn-secondary'}`}
              >
                {fullUser?.estado ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Rol</span>
            <span className="subtitle1 text-secondary mt-1">
              {fullUser?.rol?.nombreRol || user.rol?.nombreRol}
            </span>
          </div>
        </div>

        <div className="content-box-outline-3">
          <div className="flex flex-col gap-1">
            <span className="subtitle1 text-primary font-light">Contacto</span>
            <span className="subtitle1 text-secondary">
              Correo: {fullUser?.correo || user.correo}
            </span>
            <span className="subtitle1 text-secondary">
              Teléfono: {fullUser?.telefono || user.telefono}
            </span>
            <div className="flex gap-2 flex-wrap mt-2">
              <md-filled-button className="btn-add px-5">
                <md-icon slot="icon" className="text-lg text-on-primary">
                  mail
                </md-icon>
                Actualizar correo
              </md-filled-button>
            </div>
          </div>

          <div
            className="flex flex-col md:flex-row gap-6 mt-4 p-4 rounded-xl"
            style={{ background: 'var(--border)' }}
          >
            <div className="flex flex-col gap-2 flex-1">
              <span className="subtitle1 font-medium">Notificaciones</span>
              <span className="body2 text-secondary">
                El usuario recibirá notificaciones por correo sobre cambios
                importantes.
              </span>
            </div>
            <div className="flex items-center">
              <md-switch icons></md-switch>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="content-box-outline-3-small">
            <span className="subtitle1">Ciudad</span>
            <span className="subtitle1 text-secondary mt-1">
              {fullUser?.ciudad?.nombreCiudad || user?.ciudad?.nombreCiudad}
            </span>
          </div>
          <div className="content-box-outline-3-small">
            <span className="subtitle1">Dirección</span>
            <span className="subtitle1 text-secondary mt-1">
              {fullUser?.direccion || user.direccion}
            </span>
          </div>
        </div>

        <div>
          {fullUser?.rol?.nombreRol?.toLowerCase() === 'administrador' ||
          user?.rol?.nombreRol?.toLowerCase() === 'administrador' ? (
            <button
              className="btn btn-secondary font-medium flex text-secondary items-center opacity-50 btn-disabled"
              title="No se puede eliminar un administrador"
            >
              <md-icon className="text-sm">delete</md-icon>
              Eliminar usuario
            </button>
          ) : (
            <button
              className="btn btn-red font-medium flex text-red items-center"
              onClick={e => {
                e.stopPropagation();
                handleDeleteClick(user);
              }}
            >
              <md-icon className="text-sm">delete</md-icon>
              Eliminar usuario
            </button>
          )}
        </div>
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="usuario"
        itemName={userToDelete?.nombre}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleEditCancel}
        onConfirm={handleEditConfirm}
        itemData={fullUser || user}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={handleAddCancel}
        onConfirm={handleAddConfirm}
      />
    </div>
  );
};

export default UserProfile;
