import '@material/web/icon/icon.js';
import '@material/web/progress/linear-progress.js';
import { useEffect, useRef, useState } from 'react';
import { catalogService } from '../../../../shared/services/catalogService';
import { resolveAssetUrl } from '../../../../shared/utils/url';

import '@material/web/switch/switch.js';

export default function EditVehiculoModal({
  isOpen,
  onClose,
  vehiculo,
  onUpdateVehiculo,
  onUpdateFoto,
}) {
  const [form, setForm] = useState({});
  const [tipos, setTipos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [updatingFoto, setUpdatingFoto] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileRef = useRef(null);

  const formatDateForInput = dateString => {
    if (!dateString) return '';

    if (
      typeof dateString === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
      return dateString;
    }

    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen) {
      setLoadingCatalogs(true);

      const hasExternalOwner =
        !vehiculo?.idPropietario && !!vehiculo?.propietarioExternoNombre;

      setForm({
        idVehiculo: vehiculo?.idVehiculo,
        idTipoVehiculo:
          vehiculo?.tipoVehiculo?.idTipoVehiculo ||
          vehiculo?.idTipoVehiculo ||
          '',
        idMarcaVehiculo:
          vehiculo?.marcaVehiculo?.idMarcaVehiculo ||
          vehiculo?.idMarcaVehiculo ||
          '',
        idPropietario: vehiculo?.idPropietario || '',
        isExternalOwner: hasExternalOwner,
        propietarioExternoNombre: vehiculo?.propietarioExternoNombre || '',
        propietarioExternoDocumento:
          vehiculo?.propietarioExternoDocumento || '',
        propietarioExternoTelefono: vehiculo?.propietarioExternoTelefono || '',
        placa: vehiculo?.placa || '',
        tipoPlaca: vehiculo?.tipoPlaca || 'BLANCA',
        linea: vehiculo?.linea || vehiculo?.name || '',
        modelo: vehiculo?.modelo || vehiculo?.model || '',
        color: vehiculo?.color || '',
        vin: vehiculo?.vin || '',
        capacidadPasajeros: vehiculo?.capacidadPasajeros || '',
        capacidadCarga: vehiculo?.capacidadCarga || '',
        soatVencimiento: formatDateForInput(vehiculo?.soatVencimiento),
        tecnomecanicaVencimiento: formatDateForInput(
          vehiculo?.tecnomecanicaVencimiento
        ),
        seguroVencimiento: formatDateForInput(vehiculo?.seguroVencimiento),
        estado:
          typeof vehiculo?.estado === 'boolean'
            ? vehiculo.estado
            : vehiculo?.status === 'Activo',
      });

      if (vehiculo?.fotoUrl) {
        const fotoUrl = resolveAssetUrl(vehiculo.fotoUrl);
        setPreviewUrl(fotoUrl);
      }

      (async () => {
        try {
          const [t, m, c] = await Promise.all([
            catalogService.getTiposVehiculo(),
            catalogService.getMarcasVehiculo(),
            catalogService.getConductores(),
          ]);
          setTipos(Array.isArray(t?.data) ? t.data : t);
          setMarcas(Array.isArray(m?.data) ? m.data : m);
          setConductores(Array.isArray(c?.data) ? c.data : c);
        // eslint-disable-next-line unused-imports/no-unused-vars, no-empty
        } catch (e) {
        } finally {
          setLoadingCatalogs(false);
        }
      })();
    } else {
      setForm({});
      setError(null);
      setFieldErrors({});
      setSuccess(false);
      setPreviewUrl(null);
    }
  }, [isOpen, vehiculo]);

  const validateField = (name, value, currentForm = form) => {
    let error = null;
    switch (name) {
      case 'file':
        if (!value) error = 'La foto del vehículo es obligatoria';
        else if (value.size > 5 * 1024 * 1024)
          error = 'El archivo no debe superar 5MB';
        else if (
          !['image/jpeg', 'image/png', 'image/webp'].includes(value.type)
        )
          error = 'Formato no válido (JPG, PNG, WEBP)';
        break;
      case 'idTipoVehiculo':
        if (!value) error = 'Selecciona un tipo de vehículo';
        break;
      case 'idMarcaVehiculo':
        if (!value) error = 'Selecciona una marca';
        break;
      case 'placa':
        if (!value?.trim()) error = 'La placa es obligatoria';
        else if (value.trim().length < 5) error = 'Mínimo 5 caracteres';
        break;
      case 'tipoPlaca':
        if (!value) error = 'Selecciona el tipo de placa';
        break;
      case 'vin':
        if (value && value.trim().length < 17)
          error = 'El VIN debe tener 17 caracteres';
        break;
      case 'propietarioExternoNombre':
        if (currentForm.isExternalOwner && !value?.trim())
          error = 'El nombre es obligatorio';
        else if (currentForm.isExternalOwner && value.trim().length < 2)
          error = 'Mínimo 2 caracteres';
        break;
      case 'propietarioExternoDocumento':
        if (currentForm.isExternalOwner && !value?.trim())
          error = 'El documento es obligatorio';
        else if (currentForm.isExternalOwner && value.trim().length < 5)
          error = 'Mínimo 5 dígitos';
        break;
      case 'propietarioExternoTelefono':
        if (currentForm.isExternalOwner && !value?.trim())
          error = 'El teléfono es obligatorio';
        else if (currentForm.isExternalOwner && value.trim().length < 10)
          error = 'Mínimo 10 dígitos';
        break;
      case 'idPropietario':
        if (!currentForm.isExternalOwner && !value)
          error = 'Selecciona un conductor';
        break;
      case 'linea':
        if (!value?.trim()) error = 'La línea es obligatoria';
        else if (value.trim().length < 2) error = 'Mínimo 2 caracteres';
        break;
      case 'modelo':
        if (!value?.toString().trim()) error = 'El modelo es obligatorio';
        else {
          const year = parseInt(value, 10);
          if (year < 1900 || year > 2100) error = 'Rango válido: 1900-2100';
          else if (value.toString().length < 4) error = 'Debe tener 4 dígitos';
        }
        break;
      case 'color':
        if (!value?.trim()) error = 'El color es obligatorio';
        else if (value.trim().length < 3) error = 'Mínimo 3 caracteres';
        break;
      case 'capacidadPasajeros':
        if (!value?.toString().trim()) error = 'Obligatorio';
        else {
          const num = parseInt(value, 10);
          if (num < 1 || num > 100) error = 'Máx 100 pasajeros';
        }
        break;
      case 'capacidadCarga':
        if (value?.toString().trim()) {
          const num = parseInt(value, 10);
          if (num < 1 || num > 50000) error = 'Máx 50000 kg';
        }
        break;
      case 'soatVencimiento':
      case 'tecnomecanicaVencimiento':
      case 'seguroVencimiento':
        if (value) {
          const selectedDate = new Date(value);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          const nextYear = new Date(tomorrow);
          nextYear.setFullYear(nextYear.getFullYear() + 1);

          if (selectedDate < tomorrow)
            error = 'Debe ser una fecha futura (desde mañana en adelante)';
          else if (selectedDate > nextYear)
            error = 'La fecha no puede superar un año desde hoy';
        }
        break;
    }
    return error;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'placa' || name === 'vin') {
      newValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (
      name === 'linea' ||
      name === 'propietarioExternoNombre' ||
      name === 'color'
    ) {
      newValue = value.replace(/[0-9]/g, '');
    } else if (
      name === 'modelo' ||
      name === 'capacidadPasajeros' ||
      name === 'capacidadCarga' ||
      name === 'propietarioExternoDocumento' ||
      name === 'propietarioExternoTelefono'
    ) {
      newValue = value.replace(/\D/g, '');
    }

    if (name === 'propietarioExternoTelefono' && newValue.length > 10) return;
    if (name === 'propietarioExternoDocumento' && newValue.length > 15) return;
    if (name === 'modelo' && newValue.length > 4) return;
    if (name === 'capacidadPasajeros' && newValue.length > 3) return;
    if (name === 'capacidadCarga' && newValue.length > 5) return;
    if (name === 'placa' && newValue.length > 6) return;
    if (name === 'vin' && newValue.length > 17) return;

    setForm(prev => ({ ...prev, [name]: newValue }));

    const fieldError = validateField(name, newValue, form);
    if (fieldError !== null || fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value, form);
    if (fieldError) {
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleSwitchChange = e => {
    const isExternal = e.target.selected;
    setForm(prev => ({
      ...prev,
      isExternalOwner: isExternal,
      idPropietario: isExternal ? '' : prev.idPropietario,
      propietarioExternoNombre: !isExternal
        ? ''
        : prev.propietarioExternoNombre,
      propietarioExternoDocumento: !isExternal
        ? ''
        : prev.propietarioExternoDocumento,
      propietarioExternoTelefono: !isExternal
        ? ''
        : prev.propietarioExternoTelefono,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(false);

    const fieldsToValidate = [
      'idTipoVehiculo',
      'idMarcaVehiculo',
      'placa',
      'tipoPlaca',
      'vin',
      'linea',
      'modelo',
      'color',
      'capacidadPasajeros',
      'capacidadCarga',
      'soatVencimiento',
      'tecnomecanicaVencimiento',
      'seguroVencimiento',
    ];
    if (form.isExternalOwner) {
      fieldsToValidate.push(
        'propietarioExternoNombre',
        'propietarioExternoDocumento',
        'propietarioExternoTelefono'
      );
    } else {
      fieldsToValidate.push('idPropietario');
    }

    let hasErrors = false;
    const newErrors = {};
    for (const f of fieldsToValidate) {
      const err = validateField(f, form[f], form);
      if (err) {
        newErrors[f] = err;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setFieldErrors(newErrors);
      setError('Por favor corrige los errores resaltados en el formulario');
      setUpdating(false);
      return;
    }

    try {
      await onUpdateVehiculo?.(form.idVehiculo, {
        idTipoVehiculo: form.idTipoVehiculo,
        idMarcaVehiculo: form.idMarcaVehiculo,
        idPropietario: form.isExternalOwner ? null : form.idPropietario || null,
        propietarioExternoNombre: form.isExternalOwner
          ? form.propietarioExternoNombre
          : null,
        propietarioExternoDocumento: form.isExternalOwner
          ? form.propietarioExternoDocumento
          : null,
        propietarioExternoTelefono: form.isExternalOwner
          ? form.propietarioExternoTelefono
          : null,
        placa: form.placa,
        tipoPlaca: form.tipoPlaca,
        linea: form.linea,
        modelo: Number(form.modelo),
        color: form.color,
        vin: form.vin || undefined,
        capacidadPasajeros: Number(form.capacidadPasajeros),
        capacidadCarga: form.capacidadCarga
          ? Number(form.capacidadCarga)
          : undefined,
        soatVencimiento: form.soatVencimiento || undefined,
        tecnomecanicaVencimiento: form.tecnomecanicaVencimiento || undefined,
        seguroVencimiento: form.seguroVencimiento || undefined,
        estado: form.estado,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al actualizar el vehículo');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangeFoto = () => fileRef.current?.click();

  const handleFileChange = async e => {
    const f = e.target.files?.[0];
    if (!f) return;

    const fileError = validateField('file', f, form);
    if (fileError) {
      setError(fileError);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setUpdatingFoto(true);
    setError(null);

    const tempUrl = URL.createObjectURL(f);
    setPreviewUrl(tempUrl);

    try {
      await onUpdateFoto?.(form.idVehiculo, f);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.message || 'Error al actualizar la foto');
      if (vehiculo?.fotoUrl) {
        const fotoUrl = resolveAssetUrl(vehiculo.fotoUrl);
        setPreviewUrl(fotoUrl);
      }
    } finally {
      setUpdatingFoto(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <main className="p-6 list-enter max-h-[90vh] overflow-y-auto scrollbar-hide rounded-xl shadow-lg">
        {(updating || updatingFoto || loadingCatalogs) && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="flex items-center gap-1 mb-4">
          <button
            type="button"
            onClick={onClose}
            className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
            disabled={updating || updatingFoto}
          >
            <md-icon className="text-xl flex items-center justify-center">
              close
            </md-icon>
          </button>
        </div>

        <div className="px-8 md:px-20">
          <div className="leading-tight mb-5">
            <h2 className="h2 font-medium text-primary">Editar vehículo</h2>
            <p className="h5 text-secondary font-medium">
              Actualiza la información o cambia su foto
            </p>
          </div>

          <div className="bg-fill rounded-xl p-4 border border-border mb-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="subtitle1 font-semibold text-primary">
                Foto del vehículo
              </h3>
            </div>

            {previewUrl ? (
              <div className="relative group mb-3">
                <div className="relative overflow-hidden rounded-xl border border-border shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Foto del vehículo"
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {updatingFoto && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <md-icon className="text-white text-4xl animate-pulse">
                          cloud_upload
                        </md-icon>
                        <p className="text-white font-medium">
                          Actualizando foto...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-64 bg-surface rounded-lg border-2 border-dashed border-border flex items-center justify-center mb-3">
                <div className="text-center">
                  <md-icon className="text-6xl text-secondary mb-2">
                    image
                  </md-icon>
                  <p className="text-secondary">Sin foto</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-primary flex items-center gap-2"
                onClick={handleChangeFoto}
                disabled={updating || updatingFoto}
              >
                <md-icon className="text-sm">image</md-icon>
                {previewUrl ? 'Cambiar foto' : 'Agregar foto'}
              </button>
              {updatingFoto && (
                <span className="text-sm text-secondary">
                  Subiendo imagen...
                </span>
              )}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {loadingCatalogs ? (
              <div className="flex flex-col items-center justify-center gap-3 p-6">
                <md-linear-progress
                  indeterminate
                  class="w-full"
                ></md-linear-progress>
                <p className="text-secondary text-sm">Cargando...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="subtitle1 text-primary font-medium">
                      Tipo de vehículo <span className="text-red">*</span>
                    </label>
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        name="idTipoVehiculo"
                        value={form.idTipoVehiculo || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`select-filter w-full px-4 py-3 input bg-fill border rounded-lg text-primary focus:outline-none transition-colors ${fieldErrors.idTipoVehiculo ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                      >
                        <option value="">Selecciona un tipo</option>
                        {tipos?.map(t => (
                          <option
                            key={t.idTipoVehiculo}
                            value={t.idTipoVehiculo}
                          >
                            {t.nombreTipoVehiculo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="subtitle1 text-primary font-medium">
                      Marca <span className="text-red">*</span>
                    </label>
                    <div className="select-wrapper w-full">
                      <md-icon className="text-sm">arrow_drop_down</md-icon>
                      <select
                        name="idMarcaVehiculo"
                        value={form.idMarcaVehiculo || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`select-filter w-full px-4 py-3 input bg-fill border rounded-lg text-primary focus:outline-none transition-colors ${fieldErrors.idMarcaVehiculo ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                      >
                        <option value="">Selecciona una marca</option>
                        {marcas?.map(m => (
                          <option
                            key={m.idMarcaVehiculo}
                            value={m.idMarcaVehiculo}
                          >
                            {m.nombreMarca}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="subtitle1 text-primary font-medium">
                      Placa
                    </label>
                    <input
                      name="placa"
                      value={form.placa || ''}
                      readOnly
                      className="w-full px-4 py-3 input bg-surface border border-border rounded-lg text-secondary uppercase cursor-not-allowed outline-none"
                    />
                    <p className="text-xs text-secondary">
                      La placa no se puede modificar
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="subtitle1 text-primary font-medium">
                      VIN
                    </label>
                    <input
                      name="vin"
                      value={form.vin || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary uppercase placeholder-text-secondary focus:outline-none transition-all ${fieldErrors.vin ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                      placeholder="Aquí el VIN del vehículo"
                      maxLength={17}
                    />
                    {fieldErrors.vin && (
                      <span className="text-xs text-red-500">
                        {fieldErrors.vin}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    Tipo de placa <span className="text-red">*</span>
                  </label>
                  <div className="select-wrapper w-full">
                    <md-icon className="text-sm">arrow_drop_down</md-icon>
                    <select
                      name="tipoPlaca"
                      value={form.tipoPlaca || 'BLANCA'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`select-filter w-full px-4 py-3 input bg-fill border rounded-lg text-primary focus:outline-none transition-colors ${fieldErrors.tipoPlaca ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                    >
                      <option value="BLANCA">Placa blanca</option>
                      <option value="AMARILLA">Placa amarilla</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="subtitle1 text-primary font-medium">
                        Propietario
                      </p>
                      <p className="text-xs text-secondary">
                        ¿El propietario es un conductor registrado?
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${form.isExternalOwner ? 'text-primary font-medium' : 'text-secondary'}`}
                      >
                        No
                      </span>
                      <md-switch
                        selected={!form.isExternalOwner}
                        // eslint-disable-next-line unused-imports/no-unused-vars
                        onClick={e => {
                          handleSwitchChange({
                            target: { selected: !form.isExternalOwner },
                          });
                        }}
                        touch-target="wrapper"
                      ></md-switch>
                      <span
                        className={`text-sm ${!form.isExternalOwner ? 'text-primary font-medium' : 'text-secondary'}`}
                      >
                        Sí
                      </span>
                    </div>
                  </div>

                  {!form.isExternalOwner ? (
                    <div className="flex flex-col gap-2 fade-in">
                      <label className="subtitle1 text-primary font-medium">
                        Conductor Propietario{' '}
                        <span className="text-red">*</span>
                      </label>
                      <div className="select-wrapper w-full">
                        <md-icon className="text-sm">arrow_drop_down</md-icon>
                        <select
                          name="idPropietario"
                          value={form.idPropietario || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`select-filter w-full px-4 py-3 input bg-fill border rounded-lg text-primary focus:outline-none transition-colors ${fieldErrors.idPropietario ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        >
                          <option value="">Selecciona un conductor</option>
                          {conductores?.map(c => (
                            <option key={c.idUsuario} value={c.idUsuario}>
                              {c.usuario?.nombre || c.nombre || 'Conductor'} -{' '}
                              {c.numeroLicencia}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 fade-in">
                      <div className="flex flex-col gap-2">
                        <label className="subtitle1 text-primary font-medium">
                          Nombre Propietario <span className="text-red">*</span>
                        </label>
                        <input
                          name="propietarioExternoNombre"
                          value={form.propietarioExternoNombre || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-all ${fieldErrors.propietarioExternoNombre ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                          placeholder="Nombre completo"
                        />
                        {fieldErrors.propietarioExternoNombre && (
                          <span className="text-xs text-red-500">
                            {fieldErrors.propietarioExternoNombre}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="subtitle1 text-primary font-medium">
                            Documento <span className="text-red">*</span>
                          </label>
                          <input
                            name="propietarioExternoDocumento"
                            value={form.propietarioExternoDocumento || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-all ${fieldErrors.propietarioExternoDocumento ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                            placeholder="CC / NIT"
                          />
                          {fieldErrors.propietarioExternoDocumento && (
                            <span className="text-xs text-red-500">
                              {fieldErrors.propietarioExternoDocumento}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="subtitle1 text-primary font-medium">
                            Teléfono <span className="text-red">*</span>
                          </label>
                          <input
                            name="propietarioExternoTelefono"
                            value={form.propietarioExternoTelefono || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-all ${fieldErrors.propietarioExternoTelefono ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                            placeholder="Número de contacto"
                          />
                          {fieldErrors.propietarioExternoTelefono && (
                            <span className="text-xs text-red-500">
                              {fieldErrors.propietarioExternoTelefono}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    Línea <span className="text-red">*</span>
                  </label>
                  <input
                    name="linea"
                    value={form.linea || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-all ${fieldErrors.linea ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                    placeholder="Aquí la línea del vehículo"
                  />
                  {fieldErrors.linea && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.linea}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    Modelo <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="modelo"
                    value={form.modelo || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-all ${fieldErrors.modelo ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                    placeholder="Aquí el modelo del vehículo"
                    maxLength="4"
                  />
                  {fieldErrors.modelo && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.modelo}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    Color <span className="text-red">*</span>
                  </label>
                  <input
                    name="color"
                    value={form.color || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 input bg-fill border rounded-lg text-primary placeholder-text-secondary focus:outline-none transition-all ${fieldErrors.color ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'}`}
                    placeholder="Aquí el color del vehículo"
                  />
                  {fieldErrors.color && (
                    <span className="text-xs text-red-500">
                      {fieldErrors.color}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    Capacidad pasajeros <span className="text-red">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleChange({
                          target: { name: 'capacidadPasajeros', value: '4' },
                        })
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        form.capacidadPasajeros === '4' ||
                        form.capacidadPasajeros === 4
                          ? 'bg-primary text-on-primary'
                          : 'bg-fill border border-border text-secondary hover:bg-border'
                      }`}
                    >
                      4
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleChange({
                          target: { name: 'capacidadPasajeros', value: '5' },
                        })
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition-all ${
                        form.capacidadPasajeros === '5' ||
                        form.capacidadPasajeros === 5
                          ? 'bg-primary text-on-primary'
                          : 'bg-fill border border-border text-secondary hover:bg-border'
                      }`}
                    >
                      5
                    </button>
                    <input
                      type="text"
                      name="capacidadPasajeros"
                      value={
                        form.capacidadPasajeros
                          ? `${form.capacidadPasajeros} pasajeros`
                          : ''
                      }
                      onChange={e => {
                        const value = e.target.value.replace(/[^\d]/g, '');
                        handleChange({
                          target: { name: 'capacidadPasajeros', value },
                        });
                      }}
                      className="flex-1 px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Otra cantidad"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    Capacidad de carga
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="capacidadCarga"
                      value={
                        form.capacidadCarga ? `${form.capacidadCarga} kg` : ''
                      }
                      onChange={e => {
                        const value = e.target.value.replace(/[^\d.]/g, '');
                        handleChange({
                          target: { name: 'capacidadCarga', value },
                        });
                      }}
                      className="w-full px-4 py-3 pr-12 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Aquí la capacidad de carga del vehículo"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary subtitle2">
                      kg
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    SOAT vence
                  </label>
                  <input
                    type="date"
                    name="soatVencimiento"
                    value={form.soatVencimiento || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all date-secondary"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    Tecnomecánica vence
                  </label>
                  <input
                    type="date"
                    name="tecnomecanicaVencimiento"
                    value={form.tecnomecanicaVencimiento || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all date-secondary"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="subtitle1 text-primary font-medium">
                    Seguro vence
                  </label>
                  <input
                    type="date"
                    name="seguroVencimiento"
                    value={form.seguroVencimiento || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all date-secondary"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red/10 border border-red/30 rounded-lg text-red mb-4">
                <md-icon className="text-lg">error</md-icon>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green/10 border border-green/30 rounded-lg text-green mb-4">
                <md-icon className="text-lg">check_circle</md-icon>
                <span className="text-sm font-medium">
                  ¡Vehículo actualizado exitosamente!
                </span>
              </div>
            )}

            <div className="flex justify-between items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary w-1/2"
                disabled={updating}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary py-3 font-medium text-subtitle1 w-1/2 flex items-center justify-center gap-2"
                disabled={updating || loadingCatalogs}
              >
                {updating && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {updating ? 'Actualizando...' : 'Actualizar vehículo'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </Modal>
  );
}
