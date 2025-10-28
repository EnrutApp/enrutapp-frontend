import Modal from '../Modal';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import { useEffect, useRef, useState } from 'react';
import { catalogService } from '../../../services/catalogService';

export default function EditVehiculoModal({ isOpen, onClose, vehiculo, onUpdateVehiculo, onUpdateFoto }) {
    const [form, setForm] = useState({});
    const [tipos, setTipos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const fileRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setForm({
                idVehiculo: vehiculo?.idVehiculo,
                idTipoVehiculo: vehiculo?.tipoVehiculo?.idTipoVehiculo || vehiculo?.idTipoVehiculo || '',
                idMarcaVehiculo: vehiculo?.marcaVehiculo?.idMarcaVehiculo || vehiculo?.idMarcaVehiculo || '',
                placa: vehiculo?.placa || '',
                linea: vehiculo?.linea || vehiculo?.name || '',
                modelo: vehiculo?.modelo || vehiculo?.model || '',
                color: vehiculo?.color || '',
                vin: vehiculo?.vin || '',
                capacidadPasajeros: vehiculo?.capacidadPasajeros || '',
                capacidadCarga: vehiculo?.capacidadCarga || '',
                soatVencimiento: vehiculo?.soatVencimiento || '',
                tecnomecanicaVencimiento: vehiculo?.tecnomecanicaVencimiento || '',
                seguroVencimiento: vehiculo?.seguroVencimiento || '',
                estado: typeof vehiculo?.estado === 'boolean' ? vehiculo.estado : vehiculo?.status === 'Activo',
            });
            (async () => {
                try {
                    const [t, m] = await Promise.all([
                        catalogService.getTiposVehiculo(),
                        catalogService.getMarcasVehiculo(),
                    ]);
                    setTipos(Array.isArray(t?.data) ? t.data : t);
                    setMarcas(Array.isArray(m?.data) ? m.data : m);
                } catch (e) {
                    console.warn('No se pudieron cargar catálogos', e);
                }
            })();
        } else {
            setForm({});
            setError(null);
        }
    }, [isOpen, vehiculo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError(null);
        try {
            await onUpdateVehiculo?.(form.idVehiculo, {
                idTipoVehiculo: form.idTipoVehiculo,
                idMarcaVehiculo: form.idMarcaVehiculo,
                placa: form.placa,
                linea: form.linea,
                modelo: Number(form.modelo),
                color: form.color,
                vin: form.vin || undefined,
                capacidadPasajeros: Number(form.capacidadPasajeros),
                capacidadCarga: form.capacidadCarga ? Number(form.capacidadCarga) : undefined,
                soatVencimiento: form.soatVencimiento || undefined,
                tecnomecanicaVencimiento: form.tecnomecanicaVencimiento || undefined,
                seguroVencimiento: form.seguroVencimiento || undefined,
                estado: form.estado,
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Error al actualizar el vehículo');
        } finally {
            setUpdating(false);
        }
    };

    const handleChangeFoto = () => fileRef.current?.click();
    const handleFileChange = async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setUpdating(true);
        setError(null);
        try {
            await onUpdateFoto?.(form.idVehiculo, f);
        } catch (err) {
            setError(err.message || 'Error al actualizar la foto');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size='xl'>
            <main className='p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg'>
                <div className='flex items-center gap-1 mb-4'>
                    <button type='button' onClick={onClose} className='text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75'>
                        <md-icon className='text-xl'>close</md-icon>
                    </button>
                </div>
                <div className='px-20'>
                    <div className='leading-tight mb-5'>
                        <h2 className='h2 font-medium text-primary'>Editar vehículo</h2>
                        <p className='h5 text-secondary font-medium'>Actualiza la información o su foto</p>
                    </div>

                    <div className='mb-4'>
                        <label className='subtitle1 text-primary font-medium'>Foto</label>
                        <div className='flex items-center gap-3'>
                            <button type='button' className='btn btn-primary' onClick={handleChangeFoto} disabled={updating}>
                                <md-icon className='text-sm'>image</md-icon>
                                Cambiar foto
                            </button>
                            <input ref={fileRef} type='file' className='hidden' accept='image/*' onChange={handleFileChange} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Tipo</label>
                                <div className='select-wrapper w-full'>
                                    <md-icon className='text-sm'>arrow_drop_down</md-icon>
                                    <select name='idTipoVehiculo' value={form.idTipoVehiculo || ''} onChange={handleChange} className='select-filter w-full px-4 input bg-fill border rounded-lg'>
                                        <option value=''>Selecciona un tipo</option>
                                        {tipos?.map(t => <option key={t.idTipoVehiculo} value={t.idTipoVehiculo}>{t.nombreTipoVehiculo}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Marca</label>
                                <div className='select-wrapper w-full'>
                                    <md-icon className='text-sm'>arrow_drop_down</md-icon>
                                    <select name='idMarcaVehiculo' value={form.idMarcaVehiculo || ''} onChange={handleChange} className='select-filter w-full px-4 input bg-fill border rounded-lg'>
                                        <option value=''>Selecciona una marca</option>
                                        {marcas?.map(m => <option key={m.idMarcaVehiculo} value={m.idMarcaVehiculo}>{m.nombreMarca}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Placa</label>
                                <input name='placa' value={form.placa || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Línea</label>
                                <input name='linea' value={form.linea || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Modelo</label>
                                <input type='number' name='modelo' value={form.modelo || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Color</label>
                                <input name='color' value={form.color || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>VIN</label>
                                <input name='vin' value={form.vin || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Capacidad pasajeros</label>
                                <input type='number' name='capacidadPasajeros' value={form.capacidadPasajeros || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Capacidad carga (kg)</label>
                                <input type='number' step='0.01' name='capacidadCarga' value={form.capacidadCarga || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>SOAT vence</label>
                                <input type='date' name='soatVencimiento' value={form.soatVencimiento || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Tecnomecánica vence</label>
                                <input type='date' name='tecnomecanicaVencimiento' value={form.tecnomecanicaVencimiento || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='subtitle1 text-primary font-medium'>Seguro vence</label>
                                <input type='date' name='seguroVencimiento' value={form.seguroVencimiento || ''} onChange={handleChange} className='w-full px-4 input bg-fill border rounded-lg' />
                            </div>
                        </div>
                        {error && <div className='text-red mb-2'>{error}</div>}
                        <div className='flex justify-end gap-3'>
                            <button type='button' className='btn px-5 text-secondary' onClick={onClose}>Cancelar</button>
                            <md-filled-button className='btn-add px-24' type='submit' disabled={updating}>
                                {updating ? 'Actualizando...' : 'Actualizar'}
                            </md-filled-button>
                        </div>
                    </form>
                </div>
            </main>
        </Modal>
    );
}
