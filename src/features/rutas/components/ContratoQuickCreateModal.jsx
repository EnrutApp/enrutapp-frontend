import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';

import { useEffect, useMemo, useState } from 'react';

import Modal from '../../../shared/components/modal/Modal';
import { turnoService } from '../../turnos/api/turnoService';
import userService from '../../usuarios/api/userService';
import contratosService from '../../contratos/api/contratosService';
import { generateContratoPdf } from '../../contratos/utils/contratoPdf';
import { ROUTES } from '../../../routes';

const emptyPasajero = () => ({ idUsuario: '' });

const toIsoDate = value => {
    if (!value) return '';
    try {
        return new Date(value).toISOString().slice(0, 10);
    } catch (_) {
        return '';
    }
};

const getTurnoLabel = turno => {
    const fecha = turno?.fecha
        ? new Date(turno.fecha).toLocaleDateString('es-ES')
        : '';
    const hora = turno?.hora || '';
    const placa = turno?.vehiculo?.placa || '';
    const origen =
        turno?.ruta?.origen?.ubicacion?.nombreUbicacion ||
        turno?.ruta?.origen?.ubicacion?.nombre ||
        '';
    const destino =
        turno?.ruta?.destino?.ubicacion?.nombreUbicacion ||
        turno?.ruta?.destino?.ubicacion?.nombre ||
        '';

    const bits = [fecha, hora].filter(Boolean).join(' ');
    const ruta = [origen, destino].filter(Boolean).join(' → ');

    return [bits, placa && `(${placa})`, ruta].filter(Boolean).join(' ');
};

const ContratoQuickCreateModal = ({ isOpen, onClose, ruta, navigate }) => {
    const [loadingTurnos, setLoadingTurnos] = useState(true);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [saving, setSaving] = useState(false);
    const [turnos, setTurnos] = useState([]);
    const [selectedTurnoId, setSelectedTurnoId] = useState('');

    const [clientes, setClientes] = useState([]);
    const [titularClienteId, setTitularClienteId] = useState('');
    const [pasajeros, setPasajeros] = useState([emptyPasajero()]);

    useEffect(() => {
        if (!isOpen) {
            setLoadingTurnos(true);
            setLoadingClientes(true);
            setSaving(false);
            setTurnos([]);
            setSelectedTurnoId('');
            setClientes([]);
            setTitularClienteId('');
            setPasajeros([emptyPasajero()]);
            return;
        }

        const loadClientes = async () => {
            setLoadingClientes(true);
            try {
                const res = await userService.getClientes();
                const data = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
                const mapped = data
                    .map(u => ({
                        idUsuario: u.idUsuario,
                        name: u.nombre,
                        document: u.numDocumento || '',
                        estado: !!u.estado,
                        raw: u,
                    }))
                    .filter(c => c.estado);
                setClientes(mapped);
            } catch (e) {
                console.error('Error cargando clientes:', e);
                setClientes([]);
            } finally {
                setLoadingClientes(false);
            }
        };

        const loadTurnos = async () => {
            setLoadingTurnos(true);
            try {
                const resp = await turnoService.getTurnos();
                const data = Array.isArray(resp) ? resp : resp?.data || [];

                const rutaId = ruta?.idRuta;
                const filtered = rutaId
                    ? data.filter(t =>
                        String(t?.idRuta || t?.ruta?.idRuta || '') === String(rutaId)
                    )
                    : data;

                setTurnos(filtered);

                if (filtered.length === 1) {
                    setSelectedTurnoId(filtered[0]?.idTurno || '');
                }
            } catch (e) {
                console.error('Error cargando turnos para contrato:', e);
                setTurnos([]);
            } finally {
                setLoadingTurnos(false);
            }
        };

        loadClientes();
        loadTurnos();
    }, [isOpen, ruta?.idRuta]);

    const selectedTurno = useMemo(() => {
        return (
            turnos.find(t => String(t?.idTurno) === String(selectedTurnoId)) || null
        );
    }, [turnos, selectedTurnoId]);

    const titular = useMemo(() => {
        return (
            clientes.find(c => String(c.idUsuario) === String(titularClienteId)) ||
            null
        );
    }, [clientes, titularClienteId]);

    const updatePasajero = (idx, patch) => {
        setPasajeros(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...patch };
            return next;
        });
    };

    const addPasajero = () => setPasajeros(prev => [...prev, emptyPasajero()]);

    const removePasajero = idx => {
        setPasajeros(prev => {
            const next = prev.filter((_, i) => i !== idx);
            return next.length ? next : [emptyPasajero()];
        });
    };

    const validate = () => {
        if (!selectedTurnoId) return 'Selecciona un turno/viaje';
        if (!titularClienteId) return 'Selecciona el cliente titular';
        if (!titular?.document) return 'El cliente titular no tiene documento';
        return null;
    };

    const handleSubmit = async () => {
        const err = validate();
        if (err) {
            alert(err);
            return;
        }

        const turno = selectedTurno;
        if (!turno) {
            alert('No se encontró el turno seleccionado');
            return;
        }

        const origen =
            turno?.ruta?.origen?.ubicacion?.nombreUbicacion ||
            turno?.ruta?.origen?.ubicacion?.nombre ||
            '';
        const destino =
            turno?.ruta?.destino?.ubicacion?.nombreUbicacion ||
            turno?.ruta?.destino?.ubicacion?.nombre ||
            '';

        const placa = turno?.vehiculo?.placa || '';
        const tipoVehiculo = turno?.vehiculo?.tipoVehiculo?.nombreTipoVehiculo || '';
        const capacidadPasajeros = Number(turno?.vehiculo?.capacidadPasajeros ?? 0);

        const fechaIso = toIsoDate(turno?.fecha);

        if (!placa || !origen || !destino || !fechaIso) {
            alert('Faltan datos del turno (placa/origen/destino/fecha)');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                idTurno: selectedTurnoId,
                titularNombre: (titular?.name || '').trim(),
                titularDocumento: (titular?.document || '').trim(),
                placa,
                tipoVehiculo,
                capacidadPasajeros,
                origen,
                destino,
                fechaOrigen: fechaIso,
                fechaDestino: fechaIso,
                pasajeros: (pasajeros || [])
                    .map(p => {
                        const c = clientes.find(
                            it => String(it.idUsuario) === String(p.idUsuario)
                        );
                        return {
                            nombre: (c?.name || '').trim(),
                            documento: (c?.document || '').trim(),
                        };
                    })
                    .filter(p => p.nombre),
            };

            const pdfBytes = await generateContratoPdf({
                data: payload,
                debug: import.meta.env.VITE_PDF_DEBUG === 'true',
            });

            const pdfFile = new File([pdfBytes], `contrato-${payload.placa}.pdf`, {
                type: 'application/pdf',
            });

            const resp = await contratosService.create({ data: payload, pdfFile });
            const contrato = resp?.data || resp;

            const idContrato = contrato?.idContrato;
            if (idContrato) {
                onClose?.();
                navigate(
                    ROUTES.ADMIN.CONTRATOS_DETALLE.replace(':idContrato', idContrato)
                );
                return;
            }

            onClose?.();
            navigate(ROUTES.ADMIN.CONTRATOS);
        } catch (e2) {
            console.error('Error creando contrato (quick):', e2);

            const statusCode = e2?.statusCode;
            const message = e2?.message || 'No se pudo crear el contrato';

            if (statusCode === 409 && selectedTurnoId) {
                try {
                    const existingResp = await contratosService.list({
                        idTurno: selectedTurnoId,
                    });
                    const existing = Array.isArray(existingResp)
                        ? existingResp?.[0]
                        : existingResp?.data?.[0];

                    const idContrato = existing?.idContrato;
                    if (idContrato) {
                        alert(message);
                        onClose?.();
                        navigate(
                            ROUTES.ADMIN.CONTRATOS_DETALLE.replace(':idContrato', idContrato)
                        );
                        return;
                    }
                } catch (_) {
                    // Si falla buscar el existente, cae al alert normal.
                }
            }

            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (saving) return;
        onClose?.();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="h4 font-medium text-primary">Crear contrato</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-secondary p-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
                        disabled={saving}
                    >
                        <md-icon className="text-xl flex items-center justify-center">
                            close
                        </md-icon>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                            Turno / viaje <span className="text-red text-sm">*</span>
                        </label>
                        {loadingTurnos ? (
                            <div className="content-box-outline-3-small p-3">
                                <div className="flex items-center gap-3">
                                    <md-linear-progress indeterminate></md-linear-progress>
                                    <span className="text-secondary">Cargando turnos...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="select-wrapper w-full">
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select
                                    value={selectedTurnoId}
                                    onChange={e => setSelectedTurnoId(e.target.value)}
                                    className="select-filter w-full px-4 input bg-surface border rounded-lg"
                                    disabled={saving}
                                >
                                    <option value="">
                                        {turnos.length
                                            ? 'Selecciona un turno'
                                            : 'No hay turnos para esta ruta'}
                                    </option>
                                    {turnos.map(t => (
                                        <option key={t.idTurno} value={t.idTurno}>
                                            {getTurnoLabel(t)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Titular (cliente) <span className="text-red text-sm">*</span>
                            </label>
                            {loadingClientes ? (
                                <div className="content-box-outline-3-small p-3">
                                    <div className="flex items-center gap-3">
                                        <md-linear-progress indeterminate></md-linear-progress>
                                        <span className="text-secondary">Cargando clientes...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="select-wrapper w-full">
                                    <md-icon className="text-sm">arrow_drop_down</md-icon>
                                    <select
                                        value={titularClienteId}
                                        onChange={e => setTitularClienteId(e.target.value)}
                                        className="select-filter w-full px-4 input bg-surface border rounded-lg"
                                        disabled={saving}
                                    >
                                        <option value="">Selecciona un cliente</option>
                                        {clientes.map(c => (
                                            <option key={c.idUsuario} value={c.idUsuario}>
                                                {c.name}
                                                {c.document ? ` - ${c.document}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Documento titular
                            </label>
                            <input
                                value={(titular?.document || '').trim()}
                                readOnly
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-colors border-border"
                                placeholder="Se completa automáticamente"
                            />
                        </div>
                    </div>

                    <div className="content-box-outline-3-small">
                        <div className="flex justify-between items-center mb-3">
                            <span className="subtitle1 text-primary font-light">
                                Pasajeros
                            </span>
                            <md-filled-button
                                className="btn-search-compact"
                                type="button"
                                onClick={addPasajero}
                                disabled={saving}
                            >
                                Añadir pasajero
                            </md-filled-button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {pasajeros.map((p, idx) => {
                                const pasajeroCliente = clientes.find(
                                    c => String(c.idUsuario) === String(p.idUsuario)
                                );

                                return (
                                    <div
                                        key={idx}
                                        className="content-box-outline-8-small p-3 grid grid-cols-1 md:grid-cols-6 gap-3 items-center"
                                    >
                                        <div className="md:col-span-3">
                                            <label className="block text-xs text-secondary mb-1">
                                                Pasajero (cliente)
                                            </label>
                                            <div className="select-wrapper w-full">
                                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                                <select
                                                    value={p.idUsuario}
                                                    onChange={e =>
                                                        updatePasajero(idx, { idUsuario: e.target.value })
                                                    }
                                                    className="select-filter w-full px-3 input bg-surface border rounded-lg"
                                                    disabled={saving || loadingClientes}
                                                >
                                                    <option value="">Selecciona un cliente</option>
                                                    {clientes.map(c => (
                                                        <option key={c.idUsuario} value={c.idUsuario}>
                                                            {c.name}
                                                            {c.document ? ` - ${c.document}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-secondary mb-1">
                                                Documento
                                            </label>
                                            <input
                                                value={(pasajeroCliente?.document || '').trim()}
                                                readOnly
                                                placeholder="Se completa automáticamente"
                                                className="w-full px-3 py-2 bg-fill border border-border rounded-lg text-primary placeholder-secondary focus:outline-none"
                                            />
                                        </div>

                                        <div className="md:col-span-1 flex gap-2 items-end justify-end">
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm-2 font-medium flex items-center gap-1"
                                                onClick={() => removePasajero(idx)}
                                                disabled={saving || pasajeros.length === 1}
                                                title="Quitar pasajero"
                                            >
                                                <md-icon className="text-sm">remove</md-icon>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {selectedTurno ? (
                        <div className="content-box-outline-3-small">
                            <span className="subtitle1 text-primary font-light">
                                Datos del viaje
                            </span>
                            <div className="flex flex-col gap-2 mt-2 text-secondary text-sm">
                                <div>
                                    <span className="text-secondary">Ruta: </span>
                                    <span className="text-primary">
                                        {(selectedTurno?.ruta?.origen?.ubicacion?.nombreUbicacion ||
                                            selectedTurno?.ruta?.origen?.ubicacion?.nombre ||
                                            '-') +
                                            ' → ' +
                                            (selectedTurno?.ruta?.destino?.ubicacion?.nombreUbicacion ||
                                                selectedTurno?.ruta?.destino?.ubicacion?.nombre ||
                                                '-')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-secondary">Placa: </span>
                                    <span className="text-primary">
                                        {selectedTurno?.vehiculo?.placa || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="btn px-5 text-secondary"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <md-filled-button
                        className="btn-add px-5"
                        onClick={handleSubmit}
                        disabled={saving || loadingTurnos || loadingClientes}
                    >
                        <md-icon slot="icon" className="text-sm text-on-primary">
                            save
                        </md-icon>
                        {saving ? 'Guardando...' : 'Guardar y generar PDF'}
                    </md-filled-button>
                </div>
            </div>
        </Modal>
    );
};

export default ContratoQuickCreateModal;
