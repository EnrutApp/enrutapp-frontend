import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import { useState } from 'react';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import DeleteWithDependenciesModal from '../../../shared/components/modal/deleteModal/DeleteWithDependenciesModal';

const RolProfile = ({
  role,
  isOpen,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  onManagePermissions,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [
    isDeleteWithDependenciesModalOpen,
    setIsDeleteWithDependenciesModalOpen,
  ] = useState(false);
  const [dependenciesList, setDependenciesList] = useState([]);
  const [roleToDelete, setRoleToDelete] = useState(null);

  const PROTECTED_ROLES = ['Administrador', 'Conductor', 'Cliente', 'Usuario'];

  if (!isOpen || !role) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleDeleteClick = role => {
    const nombreRol = role.nombreRol || role.roleName;
    if (PROTECTED_ROLES.includes(nombreRol)) return;
    setRoleToDelete(role);

    if (role.usuarios && role.usuarios.length > 0) {
      setDependenciesList(role.usuarios.map(u => u.nombre || u.correo));
      setIsDeleteWithDependenciesModalOpen(true);
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteWithDependenciesConfirm = async () => {
    if (!roleToDelete) return;
    try {
      (await onDelete) && onDelete(roleToDelete, true);

      setIsDeleteWithDependenciesModalOpen(false);
      setRoleToDelete(null);
      setDependenciesList([]);
      handleClose();
    } catch (err) {
      setIsDeleteWithDependenciesModalOpen(false);
      setRoleToDelete(null);
      setDependenciesList([]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    try {
      (await onDelete) && onDelete(roleToDelete, false);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
      handleClose();
    } catch (err) {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
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
          <h2 className="h4 font-medium text-primary">Roles</h2>
        </div>
        <div className="flex gap-2">
          {!PROTECTED_ROLES.includes(role.nombreRol) && onManagePermissions && (
            <div>
              <md-filled-button
                className="btn-add px-6 py-2"
                onClick={() => onManagePermissions(role)}
              >
                <md-icon slot="icon" className="text-sm text-on-primary">
                  vpn_key
                </md-icon>
                Gestionar permisos
              </md-filled-button>
            </div>
          )}
          {!PROTECTED_ROLES.includes(role.nombreRol) && (
            <div>
              <md-filled-button
                className="btn-add px-6 py-2"
                onClick={() => onEdit && onEdit(role)}
              >
                <md-icon slot="icon" className="text-sm text-on-primary">
                  edit
                </md-icon>
                Editar rol
              </md-filled-button>
            </div>
          )}
          <div>
            <md-filled-button
              className="btn-add px-5"
              onClick={() => onAdd && onAdd()}
            >
              <md-icon slot="icon" className="text-sm text-on-primary">
                add
              </md-icon>
              Agregar un rol
            </md-filled-button>
          </div>
        </div>
      </div>

      <div className="bg-primary text-on-primary content-box-small">
        <h1 className="h3 text-on-primary">
          {role.nombreRol || role.roleName}
        </h1>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex flex-col">
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">
              Estado del rol
            </span>
            <div className="flex mt-1">
              <button
                className={`btn font-medium btn-lg flex items-center ${(role.estado ?? role.status === 'Activo') ? 'btn-primary' : 'btn-secondary'}`}
              >
                {(role.estado ?? role.status === 'Activo')
                  ? 'Activo'
                  : 'Inactivo'}
              </button>
            </div>
          </div>
        </div>

        {!PROTECTED_ROLES.includes(role.nombreRol) && (
          <div className="flex flex-col">
            <div className="content-box-outline-3-small">
              <span className="subtitle1 text-primary font-light">
                Descripción
              </span>
              <span className="subtitle1 text-secondary mt-1">
                {role.descripcion || role.description}
              </span>
              <div className="flex mt-1">
                <button
                  className="btn btn-primary font-medium btn-lg flex items-center"
                  onClick={() => onEdit && onEdit(role)}
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        )}

        {PROTECTED_ROLES.includes(role.nombreRol) && (
          <div className="flex flex-col">
            <div className="content-box-outline-3-small">
              <span className="subtitle1 text-primary font-light">
                Descripción
              </span>
              <span className="subtitle1 text-secondary mt-1">
                {role.descripcion || role.description}
              </span>
            </div>
          </div>
        )}

        {!PROTECTED_ROLES.includes(role.nombreRol) && (
          <div className="content-box-outline-3-small">
            <span className="subtitle1 text-primary font-light">Permisos</span>
            <div className="flex mt-1">
              <button
                className="btn btn-primary font-medium btn-lg flex items-center gap-2"
                onClick={() => onManagePermissions && onManagePermissions(role)}
              >
                <md-icon className="text-sm">vpn_key</md-icon>
                Gestionar permisos
              </button>
            </div>
          </div>
        )}

        <div>
          {PROTECTED_ROLES.includes(role.nombreRol) ? (
            <button
              className="btn btn-secondary btn-disabled font-medium flex text-secondary items-center opacity-50"
              title="No se puede eliminar un rol del sistema"
            >
              <md-icon className="text-sm">delete</md-icon>
              Eliminar rol
            </button>
          ) : (
            <button
              className="btn btn-red font-medium flex text-red items-center"
              onClick={e => {
                e.stopPropagation();
                handleDeleteClick(role);
              }}
            >
              <md-icon className="text-sm">delete</md-icon>
              Eliminar rol
            </button>
          )}
        </div>
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemType="rol"
        itemName={roleToDelete?.nombreRol || roleToDelete?.roleName}
      />

      <DeleteWithDependenciesModal
        isOpen={isDeleteWithDependenciesModalOpen}
        onClose={() => {
          setIsDeleteWithDependenciesModalOpen(false);
          setRoleToDelete(null);
          setDependenciesList([]);
        }}
        onConfirm={handleDeleteWithDependenciesConfirm}
        itemName={roleToDelete?.nombreRol || roleToDelete?.roleName}
        dependencies={dependenciesList}
      />
    </div>
  );
};

export default RolProfile;
