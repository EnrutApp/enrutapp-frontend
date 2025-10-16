import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js'
import RolProfile from './pages/RolProfile';
import Pagination from '../../shared/components/pagination/Pagination';
import usePagination from '../../shared/hooks/usePagination';
import DeleteModal from '../../shared/components/modal/deleteModal/DeleteModal';
import SwitchModal from '../../shared/components/modal/switchModal/SwitchModal';
import AddModal from '../../shared/components/modal/addModal/AddModal';
import EditModal from '../../shared/components/modal/editModal/EditModal';
import roleService from '../../shared/services/roleService';
import { useEffect, useMemo, useState } from 'react';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedRole, setSelectedRole] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [roleToSwitch, setRoleToSwitch] = useState(null);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchRoles = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await roleService.getRoles();
            if (res.success) {
                const raw = Array.isArray(res.data) ? res.data : [];
                // mapear a estructura vieja usada por RolProfile si aún espera roleName/status
                const mapped = raw.map(r => ({
                    ...r,
                    roleName: r.nombreRol,
                    status: r.estado ? 'Activo' : 'Inactivo',
                    description: r.descripcion,
                    activo: r.estado,
                }));
                setRoles(mapped);
            } else {
                setError(res.error || 'Error al cargar roles');
            }
        } catch (err) {
            setError(err?.response?.data?.error || 'Error al cargar roles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const activeCount = useMemo(() => roles.filter(r => r.activo !== false).length, [roles]);
    const inactiveCount = useMemo(() => roles.filter(r => r.activo === false).length, [roles]);

    const {
        currentPage,
        totalPages,
        currentData: currentRoles,
        showPagination,
        handlePageChange,
        startIndex,
        totalItems
    } = usePagination(roles, 4);

    const handleOpenProfile = (role) => {
        // normalizar nombreRol si viene roleName
        if (role.roleName && !role.nombreRol) {
            role = { ...role, nombreRol: role.roleName };
        }
        setSelectedRole(role);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setSelectedRole(null);
    };

    const handleDeleteClick = (role) => {
        if (role.nombreRol === 'Administrador') return; // protección
        setRoleToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;
        try {
            await roleService.deleteRole(roleToDelete.idRol);
            await fetchRoles();
        } catch (err) {
            alert(err?.response?.data?.error || 'Error al eliminar rol');
        } finally {
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setRoleToDelete(null);
    };

    const handleSwitchClick = (role) => {
        setRoleToSwitch(role);
        setIsSwitchModalOpen(true);
    };

    const handleSwitchConfirm = async () => {
        if (!roleToSwitch) return;
        try {
            await roleService.updateRole(roleToSwitch.idRol, { activo: roleToSwitch.activo === false });
            await fetchRoles();
        } catch (err) {
            alert(err?.response?.data?.error || 'Error al cambiar estado');
        } finally {
            setIsSwitchModalOpen(false);
            setRoleToSwitch(null);
        }
    };

    const handleSwitchCancel = () => {
        setIsSwitchModalOpen(false);
        setRoleToSwitch(null);
    };

    const handleAddSuccess = () => {
        fetchRoles();
    };

    const handleOpenEdit = (role) => {
        setSelectedRole(role);
        setIsEditOpen(true);
    };

    return (
        <section>
            {!isProfileOpen ? (
                <>
                    <div className="list-enter">
                        <div className='flex justify-between items-center'>
                            <h1 className="h4 font-medium">Roles</h1>

                            <div className='flex gap-2'>
                                <div>
                                    <md-filled-button className="btn-search-minimal px-6 py-2">
                                        <md-icon slot="icon" className="text-sm text-secondary">search</md-icon>
                                        Buscar
                                    </md-filled-button>
                                </div>
                                <div>
                                    <md-filled-button className="btn-add px-5" onClick={() => setIsAddOpen(true)}>
                                        <md-icon slot="icon" className="text-sm text-on-primary">add</md-icon>
                                        Agregar un rol
                                    </md-filled-button>
                                </div>
                            </div>
                        </div>

                        {error && <div className='mt-3 text-sm text-red-600'>{error}</div>}

                        <div className='flex mt-4 gap-2'>
                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Totales</span>
                                    <h2 className='h4 text-primary font-bold'>{roles.length}</h2>
                                </div>
                            </div>

                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Activos</span>
                                    <h2 className='h4 text-primary font-bold'>{activeCount}</h2>
                                </div>
                            </div>

                            <div className='content-box-outline-3-small'>
                                <div className='flex flex-col'>
                                    <span className='subtitle2 font-light'>Inactivos</span>
                                    <h2 className='h4 text-primary font-bold'>{inactiveCount}</h2>
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-between items-center mt-6 mb-4'>
                            <span className='text-sm text-secondary'>
                                {loading ? 'Cargando roles...' : `Mostrando ${startIndex + 1}-${Math.min(startIndex + 4, roles.length)} de ${roles.length} roles`}
                            </span>
                            {showPagination && (
                                <span className='text-xs text-secondary'>
                                    Página {currentPage} de {totalPages}
                                </span>
                            )}
                        </div>

                        <div className='mt-3'>
                            {currentRoles.map((role, index) => (
                                <div
                                    key={role.idRol || index}
                                    className={`content-box-outline-4-small ${index > 0 ? 'mt-2' : ''} ${role.activo === false ? 'opacity-60' : ''}`}
                                    onClick={() => handleOpenProfile(role)}
                                >
                                    <div className='flex justify-between items-center'>
                                        <div>
                                            <h1 className='h4'>{role.nombreRol}</h1>
                                            <div className='flex gap-1'>
                                                <button className={`btn font-medium btn-lg flex items-center ${role.activo !== false ? 'btn-primary' : 'btn-secondary'}`}>
                                                    {role.activo !== false ? 'Activo' : 'Inactivo'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            {role.nombreRol === 'Administrador' ? (
                                                <div
                                                    className='btn btn-secondary btn-lg font-medium flex items-center opacity-50 cursor-not-allowed'
                                                    title='No se puede deshabilitar un Administrador'
                                                >
                                                    Administrador
                                                </div>
                                            ) : (
                                                <button
                                                    className={`btn btn-lg font-medium flex items-center ${role.activo !== false ? 'btn-outline' : 'btn-secondary'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSwitchClick(role);
                                                    }}
                                                >
                                                    {role.activo !== false ? 'Deshabilitar' : 'Habilitar'}
                                                </button>
                                            )}
                                            <button
                                                className='btn btn-secondary btn-lg font-medium flex items-center'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(role);
                                                }}
                                                disabled={role.nombreRol === 'Administrador'}
                                            >
                                                <md-icon className="text-sm">delete</md-icon>
                                            </button>

                                            <button
                                                className='btn btn-primary btn-lg font-medium flex items-center'
                                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(role); }}
                                            >
                                                <md-icon className="text-sm">edit</md-icon>
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        showPagination={showPagination}
                    />
                </>
            ) : (
                <RolProfile
                    role={selectedRole}
                    isOpen={isProfileOpen}
                    onClose={handleCloseProfile}
                    onAdd={() => { setIsAddOpen(true); }}
                    onEdit={(r) => { setIsEditOpen(true); setSelectedRole(r); }}
                />
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="rol"
                itemName={roleToDelete?.nombreRol}
            />

            <SwitchModal
                isOpen={isSwitchModalOpen}
                onClose={handleSwitchCancel}
                onConfirm={handleSwitchConfirm}
                itemType="rol"
                itemName={roleToSwitch?.nombreRol}
                isCurrentlyActive={roleToSwitch?.activo !== false}
            />

            <AddModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                itemType="rol"
                onConfirm={handleAddSuccess}
            />

            <EditModal
                isOpen={isEditOpen}
                onClose={() => { setIsEditOpen(false); setSelectedRole(null); }}
                onConfirm={fetchRoles}
                itemType="rol"
                itemData={selectedRole}
            />
        </section>
    )
}

export default Roles