import Modal from '../../../../shared/components/modal/Modal';
import userService from '../../../usuarios/api/userService';
import EditUserModal from '../../../usuarios/components/editUserModal/EditUserModal';
import catalogService from '../../../../shared/services/catalogService';
import EditPhotoModal from '../editPhotoModal/EditPhotoModal';
import Avvvatars from 'avvvatars-react';
import photoService from '../../api/photoService';
import LogoutModal from '../logoutModal/LogoutModal';
import ChangePasswordModal from '../changePasswordModal/ChangePasswordModal';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useAuth } from '../../../../shared/context/AuthContext';
import { useState, useRef } from 'react';
import { resolveAssetUrl } from '../../../../shared/utils/url';

const ProfileModal = ({ isOpen, onClose }) => {
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleEditUserClick = async () => {
    setCitiesLoading(true);
    try {
      const res = await catalogService.getCities();
      setCities(res.data || []);
    } catch {
      setCities([]);
    } finally {
      setCitiesLoading(false);
      setIsEditUserModalOpen(true);
    }
  };

  const handleEditUserSave = async data => {
    setEditUserLoading(true);
    try {
      await userService.updateUser(data);
      await refreshAuth();
      setIsEditUserModalOpen(false);
    } catch {
    } finally {
      setEditUserLoading(false);
    }
  };
  const { user, logout, refreshAuth } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const [isEditPhotoModalOpen, setIsEditPhotoModalOpen] = useState(false);

  const handleEditPhotoClick = () => {
    setIsEditPhotoModalOpen(true);
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleDeletePhoto = async () => {
    try {
      await photoService.deleteProfilePhoto();
      await refreshAuth();
      setIsEditPhotoModalOpen(false);
    } catch {}
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await photoService.uploadProfilePhoto(file);
      await refreshAuth();
      setIsEditPhotoModalOpen(false);
    } catch {
    } finally {
      setUploading(false);
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
        <div className="flex items-center gap-1 mb-4">
          <button
            onClick={onClose}
            className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
          >
            <md-icon className="text-xl flex items-center justify-center">
              close
            </md-icon>
          </button>
          <h2 className="h4 font-medium text-primary">Perfil de Usuario</h2>
        </div>
        <div className="flex flex-col items-center gap-2.5">
          <div className="bg-background content-box-small flex items-center">
            <div className="border-6 border-border rounded-full relative">
              {user?.foto ? (
                <img
                  src={resolveAssetUrl(user.foto)}
                  alt="Foto de perfil"
                  className="rounded-full w-20 h-20 object-cover"
                />
              ) : (
                <Avvvatars value={user?.nombre || 'Usuario'} size={80} />
              )}
              <div
                className="absolute -bottom-2 -right-1 px-2 btn-primary rounded-full border-background hover:opacity-80 transition-all cursor-pointer"
                id="profile-photo-menu-anchor"
                onClick={handleEditPhotoClick}
                style={{ opacity: uploading ? 0.5 : 1 }}
              >
                <md-icon className="text-on-primary text-sm">edit</md-icon>
              </div>
            </div>
            <h1 className="h3">{user?.nombre || 'Usuario sin nombre'}</h1>
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-primary text-on-primary rounded-full caption font-medium">
                {user?.rol?.nombreRol || 'Rol no definido'}
              </span>
            </div>
          </div>

          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Email:</span>
            <span className="subtitle1 text-secondary mt-1">
              {user?.correo || 'Email no disponible'}
            </span>
          </div>

          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Documento:
            </span>
            <span className="subtitle1 text-secondary mt-1">
              {user?.numDocumento || 'Documento no disponible'}
              {user?.tipoDocumento?.nombreTipoDoc &&
                ` (${user.tipoDocumento.nombreTipoDoc})`}
            </span>
          </div>

          <div className="content-box-outline-3-small">
            <div className="flex gap-2">
              <span className="subtitle1 text-primary font-light">
                Teléfono:
              </span>
              <span className="subtitle1 text-secondary">
                {user?.telefono || 'Teléfono no disponible'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="subtitle1 text-primary font-light">
                Dirección:
              </span>
              <span className="subtitle1 text-secondary">
                {user?.direccion || 'Dirección no disponible'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="subtitle1 text-primary font-light">Ciudad:</span>
              <span className="subtitle1 text-secondary">
                {user?.ciudad?.nombreCiudad || 'Ciudad no disponible'}
              </span>
            </div>
            <div className="flex justify-end">
              <button
                className="btn-secondary btn-sm cursor-pointer"
                onClick={handleEditUserClick}
              >
                Editar
              </button>
            </div>
          </div>

          <div className="content-box-outline-3-small">
            <div className="flex flex-col">
              <div className="flex flex-col">
                <span className="ubtitle1 text-primary font-light">
                  Contraseña
                </span>
                <span className="subtitle1 text-secondary">
                  Cambia tu contraseña actual
                </span>
              </div>
              <div className="flex justify-end">
                <md-filled-button
                  className="btn search-input"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  <md-icon slot="icon">lock</md-icon>
                  Cambiar contraseña
                </md-filled-button>
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary w-full text-red"
            onClick={handleLogoutClick}
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
      />
      <EditPhotoModal
        isOpen={isEditPhotoModalOpen}
        onClose={() => setIsEditPhotoModalOpen(false)}
        user={user}
        uploading={uploading}
        fileInputRef={fileInputRef}
        handleAddPhoto={handleAddPhoto}
        handleDeletePhoto={handleDeletePhoto}
        handleFileChange={handleFileChange}
      />
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        user={user}
        onSave={handleEditUserSave}
        loading={editUserLoading}
        cities={cities}
        citiesLoading={citiesLoading}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </Modal>
  );
};

export default ProfileModal;
