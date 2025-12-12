import React, { useState, useEffect } from 'react';
import Modal from '../../../../shared/components/modal/Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/switch/switch.js';
import '@material/web/progress/linear-progress.js';
import roleService from '../../api/roleService';

const ManagePermissionsModal = ({ isOpen, onClose, roleData }) => {
  const [permissions, setPermissions] = useState({});
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && roleData) {
      loadData();
    }
  }, [isOpen, roleData]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const allPermsRes = await roleService.getAllPermissions();
      if (allPermsRes.success) {
        setPermissions(allPermsRes.data);
      }

      const rolePermsRes = await roleService.getRolePermissions(roleData.idRol);
      if (rolePermsRes.success) {
        const assignedIds = rolePermsRes.data.map(p => p.idPermiso);
        setUserPermissions(assignedIds);
      }
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError('Error al cargar permisos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = permisoId => {
    setUserPermissions(prev => {
      if (prev.includes(permisoId)) {
        return prev.filter(id => id !== permisoId);
      } else {
        return [...prev, permisoId];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await roleService.updateRolePermissions(
        roleData.idRol,
        userPermissions
      );
      if (res.success) {
        onClose();
      } else {
        setError(res.message || 'Error al guardar permisos');
      }
    } catch (err) {
      console.error('Error saving permissions:', err);
      setError('Error al guardar. Verifique su conexión.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <main className="relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-1 mb-4">
            <button
              type="button"
              onClick={onClose}
              className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
              disabled={loading || saving}
            >
              <md-icon className="text-xl flex items-center justify-center">
                close
              </md-icon>
            </button>
          </div>

          <div className="px-8 md:px-20">
            <div className="leading-tight mb-6">
              <h2 className="h2 font-medium text-primary">
                Gestionar Permisos
              </h2>
              <p className="h5 text-secondary font-medium">
                Configura los accesos para el rol{' '}
                <span className="text-primary font-semibold">
                  {roleData?.nombreRol}
                </span>
              </p>
            </div>

            {error && (
              <div className="bg-red/10 border border-red/30 rounded-lg p-3 mb-6 flex items-center gap-2">
                <md-icon className="text-red">error</md-icon>
                <p className="text-red text-sm">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-6 mb-8">
              {Object.keys(permissions).length === 0 && !loading ? (
                <p className="text-secondary text-center py-4">
                  No hay permisos definidos en el sistema.
                </p>
              ) : (
                Object.entries(permissions).map(([modulo, perms]) => (
                  <div
                    key={modulo}
                    className="border border-border rounded-xl overflow-hidden"
                  >
                    <div className="bg-fill px-4 py-3 border-b border-border">
                      <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                        <md-icon className="text-secondary">folder</md-icon>
                        {modulo}
                      </h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-3">
                      {perms.map(perm => (
                        <div
                          key={perm.idPermiso}
                          className="flex items-center justify-between p-2 hover:bg-fill/50 rounded-lg transition-colors"
                        >
                          <div className="flex flex-col pr-4">
                            <span className="text-sm font-medium text-primary">
                              {perm.nombre}
                            </span>
                            {perm.descripcion && (
                              <span className="text-xs text-secondary">
                                {perm.descripcion}
                              </span>
                            )}
                          </div>
                          <md-switch
                            selected={userPermissions.includes(perm.idPermiso)}
                            onClick={() => handleToggle(perm.idPermiso)}
                            touch-target="wrapper"
                            disabled={loading || saving}
                          ></md-switch>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center gap-2 pt-2 pb-6">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary w-1/2"
                disabled={loading || saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                disabled={loading || saving}
              >
                {saving && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </Modal>
  );
};

export default ManagePermissionsModal;
