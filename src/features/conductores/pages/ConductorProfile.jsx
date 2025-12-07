import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/switch/switch.js';
import '@material/web/progress/linear-progress.js';
import { useState, useEffect } from 'react';
import DeleteModal from '../../../shared/components/modal/deleteModal/DeleteModal';
import EditConductorModal from '../components/editConductorModal/EditConductorModal';
import AddConductorModalNew from '../components/addConductorModal/AddConductorModalNew';
import { conductorService } from '../api/conductorService';
import { obtenerCategoriasLicencia } from '../../../shared/services/categoriasLicenciaApi';
import apiClient from '../../../shared/services/apiService';
import Avvvatars from 'avvvatars-react';
import { resolveAssetUrl } from '../../../shared/utils/url';
import Modal from '../../../shared/components/modal/Modal';
import DriverTrackingModal from '../../tracking/components/DriverTrackingModal';

const ConductorProfile = ({ conductor, isOpen, onClose, onConductorUpdated }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [conductorToDelete, setConductorToDelete] = useState(null);
    const [fullConductor, setFullConductor] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState('');
    const [loadingCategoria, setLoadingCategoria] = useState(false);
    const [isContactoModalOpen, setIsContactoModalOpen] = useState(false);
    const [contactoForm, setContactoForm] = useState({ correo: '', telefono: '' });
    const [loadingContacto, setLoadingContacto] = useState(false);
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && conductor?.idConductor) {
            conductorService
                .getConductorById(conductor.idConductor)
                .then(res => {
                    if (res && res.data) {
                        setFullConductor(res.data);
                    } else {
                        setFullConductor(res);
                    }
                })
                .catch(() => setFullConductor(conductor));
        } else {
            setFullConductor(null);
        }
    }, [isOpen, conductor]);

    if (!isOpen || !conductor) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'No registrada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isExpired = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isNearExpiry = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        return date >= today && date <= thirtyDaysFromNow;
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200);
    };

    const handleDeleteClick = conductor => {
        setConductorToDelete(conductor);
        setIsDeleteModalOpen(true);
    };

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handleEditConfirm = updatedConductor => {
        setFullConductor(updatedConductor);
        setIsEditModalOpen(false);
        if (onConductorUpdated) {
            onConductorUpdated(updatedConductor);
        }
    };

    const handleEditCancel = () => {
        setIsEditModalOpen(false);
    };

    const handleAddClick = () => {
        setIsAddModalOpen(true);
    };

    const handleAddConfirm = () => {
        setIsAddModalOpen(false);
        if (onConductorUpdated) {
            window.location.reload();
        }
    };

    const handleAddCancel = () => {
        setIsAddModalOpen(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            await conductorService.deleteConductor(conductorToDelete.idConductor);
            setIsDeleteModalOpen(false);
            setConductorToDelete(null);
            onClose();
            if (onConductorUpdated) {
                window.location.reload();
            }
        } catch (error) {
            alert(
                'Error al eliminar el conductor: ' +
                (error.message || 'Error desconocido')
            );
            setIsDeleteModalOpen(false);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setConductorToDelete(null);
    };

    const handleCategoriaClick = async () => {
        setIsCategoriaModalOpen(true);
        setSelectedCategoria(conductorData.idCategoriaLicencia || '');

        try {
            const res = await obtenerCategoriasLicencia();
            setCategorias(res.data || res || []);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            setCategorias([]);
        }
    };

    const handleCategoriaConfirm = async () => {
        if (!selectedCategoria) {
            alert('Por favor selecciona una categoría');
            return;
        }

        setLoadingCategoria(true);
        try {
            const response = await conductorService.updateConductor(conductorData.idConductor, {
                idCategoriaLicencia: selectedCategoria
            });

            // Actualizar el conductor con los nuevos datos
            const updatedConductor = response.data || response;
            setFullConductor(updatedConductor);
            setIsCategoriaModalOpen(false);

            if (onConductorUpdated) {
                onConductorUpdated(updatedConductor);
            }
        } catch (error) {
            alert('Error al actualizar la categoría: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoadingCategoria(false);
        }
    };

    const handleCategoriaCancel = () => {
        setIsCategoriaModalOpen(false);
        setSelectedCategoria('');
    };

    const handleContactoClick = () => {
        setIsContactoModalOpen(true);
        setContactoForm({
            correo: usuarioData.correo || '',
            telefono: usuarioData.telefono || ''
        });
    };

    const handleContactoConfirm = async () => {
        if (!contactoForm.telefono?.trim()) {
            alert('El teléfono es obligatorio');
            return;
        }

        setLoadingContacto(true);
        try {
            // Actualizar el teléfono usando PUT /usuarios/:id
            await apiClient.put(`/usuarios/${usuarioData.idUsuario}`, {
                telefono: contactoForm.telefono.trim()
            });

            // Recargar los datos del conductor para reflejar los cambios
            const response = await conductorService.getConductorById(conductorData.idConductor);
            const updatedConductor = response.data || response;
            setFullConductor(updatedConductor);
            setIsContactoModalOpen(false);

            if (onConductorUpdated) {
                onConductorUpdated(updatedConductor);
            }
        } catch (error) {
            console.error('Error al actualizar el contacto:', error);
            alert('Error al actualizar el contacto: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoadingContacto(false);
        }
    };

    const handleContactoCancel = () => {
        setIsContactoModalOpen(false);
        setContactoForm({ correo: '', telefono: '' });
    };

    const conductorData = fullConductor || conductor;
    const usuarioData = conductorData.usuario || {};

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
                    <h2 className="h4 font-medium text-primary">Perfil de Conductor</h2>
                </div>
                <div className="flex gap-2">
                    <div>
                        <md-filled-tonal-button
                            className="px-4 py-2"
                            onClick={() => setIsTrackingModalOpen(true)}
                        >
                            <md-icon slot="icon" className="text-sm">
                                my_location
                            </md-icon>
                            Ver ubicación
                        </md-filled-tonal-button>
                    </div>
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
                            Agregar conductor
                        </md-filled-button>
                    </div>
                </div>
            </div>

            {/* Header con foto y nombre */}
            <div className="bg-primary text-on-primary content-box-small-2 flex justify-between gap-4">
                <div>
                    <h1 className="h3 text-on-primary">
                        {usuarioData.nombre || 'Sin nombre'}
                    </h1>
                    <span className="subtitle1 font-medium text-on-primary">
                        {usuarioData.numDocumento || 'Sin documento'}
                    </span>
                </div>
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-background">
                    {usuarioData.foto ? (
                        <img
                            src={resolveAssetUrl(usuarioData.foto)}
                            alt="Foto de perfil"
                            className="rounded-lg w-20 h-20 object-cover"
                        />
                    ) : (
                        <Avvvatars
                            value={usuarioData.nombre || 'Conductor'}
                            size={80}
                            radius={12}
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-3 flex-1">
                {/* Estado del conductor */}
                <div className="flex flex-col">
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1 text-primary font-light">
                            Estado del conductor
                        </span>
                        <div className="flex mt-1">
                            <button
                                className={`btn font-medium btn-lg flex items-center ${conductorData.estado || usuarioData.estado ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {conductorData.estado || usuarioData.estado ? 'Activo' : 'Inactivo'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="content-box-outline-3">
                    <div className="flex flex-col gap-1">
                        <span className="subtitle1 text-primary font-light">Contacto</span>
                        <span className="subtitle1 text-secondary">
                            Correo: {usuarioData.correo || 'No registrado'}
                        </span>
                        <span className="subtitle1 text-secondary">
                            Teléfono: {usuarioData.telefono || 'No registrado'}
                        </span>
                        <div className="flex gap-2 flex-wrap mt-2">
                            <md-filled-button
                                className="btn-add px-5"
                                onClick={handleContactoClick}
                            >
                                <md-icon slot="icon" className="text-lg text-on-primary">
                                    contact_page
                                </md-icon>
                                Actualizar contacto
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

                {/* Información de licencia */}
                <div className="content-box-outline-3-small">
                    <span className="subtitle1 text-primary font-light">
                        Información de licencia
                    </span>
                    <div className="flex flex-col gap-2 mt-2">
                        {/* Estado de la licencia */}
                        <div className="flex justify-between items-center content-box-outline-8-small">
                            <div className="flex items-center gap-2">
                                <div>
                                    <span className="subtitle1 text-primary">
                                        Estado de licencia
                                    </span>
                                    <p className="subtitle2 text-secondary">
                                        {conductorData.fechaVencimientoLicencia
                                            ? `Vence: ${formatDate(conductorData.fechaVencimientoLicencia)}`
                                            : 'Sin registrar'}
                                    </p>
                                </div>
                            </div>
                            {conductorData.fechaVencimientoLicencia && (
                                <>
                                    {isExpired(conductorData.fechaVencimientoLicencia) && (
                                        <span className="btn font-medium btn-lg flex items-center btn-red">
                                            Vencida
                                        </span>
                                    )}
                                    {isNearExpiry(conductorData.fechaVencimientoLicencia) &&
                                        !isExpired(conductorData.fechaVencimientoLicencia) && (
                                            <span className="btn font-medium btn-lg flex items-center btn-yellow">
                                                Próxima a vencer
                                            </span>
                                        )}
                                    {!isNearExpiry(conductorData.fechaVencimientoLicencia) &&
                                        !isExpired(conductorData.fechaVencimientoLicencia) && (
                                            <span className="btn font-medium btn-lg flex items-center btn-green">
                                                Vigente
                                            </span>
                                        )}
                                </>
                            )}
                        </div>

                        {/* Detalles de licencia */}
                        <div className="grid grid-cols gap-2">
                            <div className="p-4 content-box-outline-3-small rounded-lg">
                                <span className="subtitle1 text-primary">
                                    Número de licencia
                                </span>
                                <p className="subtitle2 text-secondary">
                                    {conductorData.numeroLicencia || usuarioData.numDocumento || '-'}
                                </p>

                                <div
                                    className="flex flex-col md:flex-row gap-6 mt-4 p-4 rounded-xl"
                                    style={{ background: 'var(--border)' }}
                                >
                                    <div className="flex flex-col gap-2 flex-1">
                                        <span className="subtitle1 font-medium">Categoría</span>
                                        <span className="body2 text-secondary">
                                            {conductorData.categoriaLicencia?.nombreCategoria || '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <md-filled-button
                                            className="btn-add px-5"
                                            onClick={handleCategoriaClick}
                                        >
                                            <md-icon slot="icon" className="text-lg text-on-primary">
                                                steering_wheel_heat
                                            </md-icon>
                                            Actualizar categoria
                                        </md-filled-button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Ubicación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1">Ciudad</span>
                        <span className="subtitle1 text-secondary mt-1">
                            {usuarioData.ciudad?.nombreCiudad || 'No registrada'}
                        </span>
                    </div>
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1">Dirección</span>
                        <span className="subtitle1 text-secondary mt-1">
                            {usuarioData.direccion || 'No registrada'}
                        </span>
                    </div>
                </div>

                {/* Observaciones */}
                {conductorData.observaciones && (
                    <div className="content-box-outline-3-small">
                        <span className="subtitle1 text-primary font-light">
                            Observaciones
                        </span>
                        <span className="subtitle1 text-secondary mt-1">
                            {conductorData.observaciones}
                        </span>
                    </div>
                )}

                {/* Fechas de registro */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                    {conductorData.createdAt && (
                        <div className="content-box-outline-3-small">
                            <span className="subtitle1 text-primary font-light">
                                Fecha de registro
                            </span>
                            <span className="subtitle1 text-secondary mt-1">
                                {new Date(conductorData.createdAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    )}

                    {conductorData.updatedAt && (
                        <div className="content-box-outline-3-small">
                            <span className="subtitle1 text-primary font-light">
                                Última actualización
                            </span>
                            <span className="subtitle1 text-secondary mt-1">
                                {new Date(conductorData.updatedAt).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Botón eliminar */}
                <div>
                    <button
                        className="btn btn-red font-medium flex text-red items-center"
                        onClick={e => {
                            e.stopPropagation();
                            handleDeleteClick(conductor);
                        }}
                    >
                        <md-icon className="text-sm">delete</md-icon>
                        Eliminar conductor
                    </button>
                </div>
            </div>

            {/* Modal para cambiar categoría */}
            <Modal
                isOpen={isCategoriaModalOpen}
                onClose={handleCategoriaCancel}
                size='sm'
            >
                <main className="relative">
                    {loadingCategoria && (
                        <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
                            <md-linear-progress indeterminate></md-linear-progress>
                        </div>
                    )}

                    <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <div className="flex items-center gap-1 mb-4">
                            <button
                                type="button"
                                onClick={handleCategoriaCancel}
                                className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
                                disabled={loadingCategoria}
                            >
                                <md-icon className="text-xl flex items-center justify-center">
                                    close
                                </md-icon>
                            </button>
                        </div>

                        <div className="px-8 md:px-20">
                            <div className="leading-tight mb-6">
                                <h2 className="h2 font-medium text-primary">Actualizar categoría</h2>
                                <p className="h5 text-secondary font-medium">
                                    Selecciona la nueva categoría de licencia
                                </p>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-1">
                                    <label className="subtitle1 text-primary font-medium">
                                        Categoría de licencia <span className="text-red">*</span>
                                    </label>
                                    <div className="select-wrapper w-full">
                                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                                        <select
                                            value={selectedCategoria}
                                            onChange={(e) => setSelectedCategoria(e.target.value)}
                                            className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors border-border"
                                            disabled={loadingCategoria}
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            {categorias.map((cat) => (
                                                <option key={cat.idCategoriaLicencia} value={cat.idCategoriaLicencia}>
                                                    {cat.nombreCategoria}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCategoriaCancel}
                                        className="btn btn-secondary w-1/2"
                                        disabled={loadingCategoria}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCategoriaConfirm}
                                        className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                                        disabled={loadingCategoria || !selectedCategoria}
                                    >
                                        {loadingCategoria && (
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        )}
                                        {loadingCategoria ? 'Actualizando...' : 'Actualizar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </Modal>

            {/* Modal para actualizar contacto */}
            <Modal
                isOpen={isContactoModalOpen}
                onClose={handleContactoCancel}
                size='sm'
            >
                <main className="relative">
                    {loadingContacto && (
                        <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
                            <md-linear-progress indeterminate></md-linear-progress>
                        </div>
                    )}

                    <div className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <div className="flex items-center gap-1 mb-4">
                            <button
                                type="button"
                                onClick={handleContactoCancel}
                                className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
                                disabled={loadingContacto}
                            >
                                <md-icon className="text-xl flex items-center justify-center">
                                    close
                                </md-icon>
                            </button>
                        </div>

                        <div className="px-8 md:px-20">
                            <div className="leading-tight mb-6">
                                <h2 className="h2 font-medium text-primary">Actualizar contacto</h2>
                                <p className="h5 text-secondary font-medium">
                                    Actualiza el teléfono de contacto
                                </p>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-1">
                                    <label className="subtitle1 text-primary font-medium">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={contactoForm.correo}
                                        className="w-full px-4 py-3 input bg-surface border border-border rounded-lg text-secondary cursor-not-allowed opacity-75"
                                        disabled
                                        readOnly
                                    />
                                    <span className="text-xs text-secondary">
                                        El correo no se puede modificar desde aquí
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="subtitle1 text-primary font-medium">
                                        Teléfono <span className="text-red">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={contactoForm.telefono}
                                        onChange={(e) => setContactoForm({ ...contactoForm, telefono: e.target.value })}
                                        placeholder="Número de teléfono"
                                        className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        disabled={loadingContacto}
                                    />
                                </div>

                                <div className="flex justify-between items-center gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleContactoCancel}
                                        className="btn btn-secondary w-1/2"
                                        disabled={loadingContacto}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleContactoConfirm}
                                        className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                                        disabled={loadingContacto || !contactoForm.telefono?.trim()}
                                    >
                                        {loadingContacto && (
                                            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        )}
                                        {loadingContacto ? 'Actualizando...' : 'Actualizar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                itemType="conductor"
                itemName={conductorToDelete?.usuario?.nombre}
            />

            <EditConductorModal
                isOpen={isEditModalOpen}
                onClose={handleEditCancel}
                conductor={fullConductor || conductor}
                onUpdateConductor={handleEditConfirm}
            />

            <AddConductorModalNew
                isOpen={isAddModalOpen}
                onClose={handleAddCancel}
                onConductorCreated={handleAddConfirm}
            />

            <DriverTrackingModal
                isOpen={isTrackingModalOpen}
                onClose={() => setIsTrackingModalOpen(false)}
                conductor={conductorData}
                driverId={conductorData?.idConductor}
            />
        </div>
    );
};

export default ConductorProfile;
