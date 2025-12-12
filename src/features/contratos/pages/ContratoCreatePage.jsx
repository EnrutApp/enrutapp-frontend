import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ROUTES } from '../../../routes';
import { turnoService } from '../../turnos/api/turnoService';
import pasajesService from '../../pasajes/api/pasajesService';
import userService from '../../usuarios/api/userService';
import contratosService from '../api/contratosService';
import { generateContratoPdf } from '../utils/contratoPdf';

const emptyPasajero = () => ({ idUsuario: '' });

const ContratoCreatePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const idTurnoFromQuery = searchParams.get('idTurno') || '';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [loadingClientes, setLoadingClientes] = useState(true);
    const [clientes, setClientes] = useState([]);
    const [titularClienteId, setTitularClienteId] = useState('');
    const [pasajeros, setPasajeros] = useState([emptyPasajero()]);

    const [turnos, setTurnos] = useState([]);
    const [selectedTurnoId, setSelectedTurnoId] = useState(idTurnoFromQuery);
    const selectedTurno = useMemo(
        () => turnos.find(t => t.idTurno === selectedTurnoId) || null,
        [turnos, selectedTurnoId]
    );

    const [form, setForm] = useState({
        placa: '',
        tipoVehiculo: '',
        capacidadPasajeros: '',

        origen: '',
        destino: '',

        fechaOrigen: '',
        fechaDestino: '',

        // Los pasajeros se gestionan por selección de clientes.
    });

    const titular = useMemo(() => {
        return clientes.find(c => String(c.idUsuario) === String(titularClienteId)) || null;
    }, [clientes, titularClienteId]);

    const loadTurnos = async () => {
        setLoading(true);
        try {
            const resp = await turnoService.getTurnos();
            const data = Array.isArray(resp) ? resp : resp?.data || [];
            setTurnos(data);
        } catch (e) {
            console.error('Error cargando turnos:', e);
            setTurnos([]);
        } finally {
            setLoading(false);
        }
    };

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

    const prefillFromTurno = async turno => {
        if (!turno) return;

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
        const capacidadPasajeros = String(turno?.vehiculo?.capacidadPasajeros ?? '');

        const fechaIso = turno?.fecha ? new Date(turno.fecha).toISOString().slice(0, 10) : '';

        let pasajerosFromPasajes = [];
        try {
            const resp = await pasajesService.getByTurno(turno.idTurno);
            const data = Array.isArray(resp) ? resp : resp?.data || [];
            pasajerosFromPasajes = data.map(p => ({
                documento: p?.documentoPasajero || '',
            }));
        } catch (e) {
            pasajerosFromPasajes = [];
        }

        setForm(prev => ({
            ...prev,
            placa,
            tipoVehiculo,
            capacidadPasajeros,
            origen,
            destino,
            fechaOrigen: prev.fechaOrigen || fechaIso,
            fechaDestino: prev.fechaDestino || fechaIso,
        }));

        // Prefill pasajeros y titular a partir de pasajes (si existe cliente con ese documento).
        if (clientes.length && pasajerosFromPasajes.length) {
            const matched = pasajerosFromPasajes
                .map(p => {
                    const cliente = clientes.find(c => String(c.document) === String(p.documento));
                    if (!cliente) return null;
                    return { idUsuario: cliente.idUsuario };
                })
                .filter(Boolean);

            if (matched.length) {
                setPasajeros(matched);
                if (!titularClienteId) {
                    setTitularClienteId(matched[0].idUsuario);
                }
            }
        }
    };

    useEffect(() => {
        loadClientes();
        loadTurnos();
    }, []);

    useEffect(() => {
        if (!selectedTurnoId) return;
        const turno = turnos.find(t => t.idTurno === selectedTurnoId);
        if (turno) prefillFromTurno(turno);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTurnoId, turnos.length, clientes.length]);

    const updateField = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const updatePasajero = (idx, patch) => {
        setPasajeros(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], ...patch };
            return next;
        });
    };

    const addPasajero = () => {
        setPasajeros(prev => [...prev, emptyPasajero()]);
    };

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
        if (!form.placa.trim()) return 'La placa es obligatoria';
        if (!form.origen.trim() || !form.destino.trim()) return 'Origen y destino son obligatorios';
        if (!form.fechaOrigen || !form.fechaDestino) return 'Las fechas son obligatorias';
        return null;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const err = validate();
        if (err) {
            alert(err);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                idTurno: selectedTurnoId,
                titularNombre: (titular?.name || '').trim(),
                titularDocumento: (titular?.document || '').trim(),
                placa: form.placa.trim(),
                tipoVehiculo: form.tipoVehiculo.trim(),
                capacidadPasajeros: Number(form.capacidadPasajeros || 0),
                origen: form.origen.trim(),
                destino: form.destino.trim(),
                fechaOrigen: form.fechaOrigen,
                fechaDestino: form.fechaDestino,
                pasajeros: (pasajeros || [])
                    .map(p => {
                        const c = clientes.find(it => String(it.idUsuario) === String(p.idUsuario));
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
                navigate(
                    ROUTES.ADMIN.CONTRATOS_DETALLE.replace(':idContrato', idContrato)
                );
            } else {
                navigate(ROUTES.ADMIN.CONTRATOS);
            }
        } catch (e2) {
            console.error('Error creando contrato:', e2);

            const statusCode = e2?.statusCode;
            const message = e2?.message || 'No se pudo crear el contrato';

            // Si ya existe contrato para este turno (idTurno unique), navega al existente.
            if (statusCode === 409 && selectedTurnoId) {
                try {
                    const existingResp = await contratosService.list({ idTurno: selectedTurnoId });
                    const existing = Array.isArray(existingResp)
                        ? existingResp?.[0]
                        : existingResp?.data?.[0];

                    const idContrato = existing?.idContrato;
                    if (idContrato) {
                        alert(message);
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

    return (
        <section className="list-enter">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="h4 font-medium">Nuevo contrato</h1>
                    <p className="subtitle2 text-secondary mt-1">
                        Genera el contrato para un turno/viaje (requerido para placa blanca)
                    </p>
                </div>
                <div className="flex gap-2">
                    <md-filled-button
                        className="btn-search-minimal px-5"
                        onClick={() => navigate(ROUTES.ADMIN.CONTRATOS)}
                        disabled={saving}
                    >
                        Volver
                    </md-filled-button>
                    <md-filled-button
                        className="btn-add px-5"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        <md-icon slot="icon" className="text-sm text-on-primary">
                            save
                        </md-icon>
                        {saving ? 'Guardando...' : 'Guardar y generar PDF'}
                    </md-filled-button>
                </div>
            </div>

            {loading ? (
                <div
                    className="flex items-center justify-center w-full content-box-outline-2-small"
                    style={{ height: 'calc(78vh - 0px)' }}
                >
                    <div className="flex flex-col items-center gap-3" style={{ width: 260 }}>
                        <md-icon className="text-secondary mb-2">description</md-icon>
                        <span className="text-secondary">Cargando datos...</span>
                        <md-linear-progress indeterminate></md-linear-progress>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="content-box-outline-2-small p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Turno / Viaje *</label>
                            <div className="select-wrapper w-full">
                                <md-icon className="text-sm">arrow_drop_down</md-icon>
                                <select
                                    value={selectedTurnoId}
                                    onChange={e => setSelectedTurnoId(e.target.value)}
                                    className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors border-border"
                                >
                                    <option value="">Selecciona un turno</option>
                                    {turnos.map(t => {
                                        const label = `${new Date(t.fecha).toLocaleDateString('es-ES')} ${t.hora || ''} - ${t.vehiculo?.placa || 'Sin placa'} - ${t.ruta?.origen?.ubicacion?.nombreUbicacion || 'Origen'} → ${t.ruta?.destino?.ubicacion?.nombreUbicacion || 'Destino'}`;
                                        return (
                                            <option key={t.idTurno} value={t.idTurno}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            {selectedTurno && selectedTurno.vehiculo?.tipoPlaca && (
                                <span className="text-xs text-secondary mt-1">
                                    Tipo de placa: {selectedTurno.vehiculo.tipoPlaca}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Placa *</label>
                            <input
                                value={form.placa}
                                onChange={e => updateField('placa', e.target.value.toUpperCase())}
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors border-border"
                                placeholder="ABC123"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Titular (cliente) *</label>
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
                                        className="select-filter w-full px-4 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors border-border"
                                        disabled={saving}
                                    >
                                        <option value="">Selecciona un cliente</option>
                                        {clientes.map(c => (
                                            <option key={c.idUsuario} value={c.idUsuario}>
                                                {c.name}{c.document ? ` - ${c.document}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Documento titular</label>
                            <input
                                value={(titular?.document || '').trim()}
                                readOnly
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-colors border-border"
                                placeholder="Se completa automáticamente"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Tipo de vehículo</label>
                            <input
                                value={form.tipoVehiculo}
                                onChange={e => updateField('tipoVehiculo', e.target.value)}
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors border-border"
                                placeholder="Bus / Van / Automóvil"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Capacidad (pasajeros)</label>
                            <input
                                type="number"
                                min={0}
                                value={form.capacidadPasajeros}
                                onChange={e => updateField('capacidadPasajeros', e.target.value)}
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors border-border"
                                placeholder="0"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Origen *</label>
                            <input
                                value={form.origen}
                                onChange={e => updateField('origen', e.target.value)}
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors border-border"
                                placeholder="Ciudad / Terminal"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Destino *</label>
                            <input
                                value={form.destino}
                                onChange={e => updateField('destino', e.target.value)}
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors border-border"
                                placeholder="Ciudad / Terminal"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Fecha de origen *</label>
                            <input
                                type="date"
                                value={form.fechaOrigen}
                                onChange={e => updateField('fechaOrigen', e.target.value)}
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors border-border"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="subtitle1 text-primary font-medium">Fecha de destino *</label>
                            <input
                                type="date"
                                value={form.fechaDestino}
                                onChange={e => updateField('fechaDestino', e.target.value)}
                                className="w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors border-border"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center">
                            <h2 className="h5 font-medium text-primary">Pasajeros</h2>
                            <md-filled-button
                                type="button"
                                className="btn-add px-5"
                                onClick={addPasajero}
                                disabled={saving}
                            >
                                <md-icon slot="icon" className="text-sm text-on-primary">
                                    person_add
                                </md-icon>
                                Agregar pasajero
                            </md-filled-button>
                        </div>

                        <div className="mt-3 w-full overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-secondary text-[12px]">
                                        <th className="py-2 pr-3">Cliente</th>
                                        <th className="py-2 pr-3">Documento</th>
                                        <th className="py-2 pr-3">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pasajeros.map((p, idx) => {
                                        const pasajeroCliente = clientes.find(c => String(c.idUsuario) === String(p.idUsuario));
                                        return (
                                            <tr key={idx} className="border-t border-border">
                                                <td className="py-2 pr-3">
                                                    <div className="select-wrapper w-full">
                                                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                                                        <select
                                                            value={p.idUsuario}
                                                            onChange={e => updatePasajero(idx, { idUsuario: e.target.value })}
                                                            className="select-filter w-full px-3 input bg-fill border rounded-lg text-primary focus:outline-none focus:border-primary transition-colors border-border"
                                                            disabled={saving || loadingClientes}
                                                        >
                                                            <option value="">Selecciona un cliente</option>
                                                            {clientes.map(c => (
                                                                <option key={c.idUsuario} value={c.idUsuario}>
                                                                    {c.name}{c.document ? ` - ${c.document}` : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="py-2 pr-3">
                                                    <input
                                                        value={(pasajeroCliente?.document || '').trim()}
                                                        readOnly
                                                        className="w-full px-3 py-2 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors border-border"
                                                        placeholder="Se completa automáticamente"
                                                    />
                                                </td>
                                                <td className="py-2 pr-3">
                                                    <md-filled-button
                                                        type="button"
                                                        className="btn-search-minimal"
                                                        onClick={() => removePasajero(idx)}
                                                        disabled={saving}
                                                    >
                                                        Quitar
                                                    </md-filled-button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-xs text-secondary mt-2">
                            El PDF se genera con el template de 3 páginas y una lista simple de pasajeros (ajustable).
                        </p>
                    </div>
                </form>
            )}
        </section>
    );
};

export default ContratoCreatePage;
