import { useState, useEffect, useRef } from 'react';
import apiClient from '../../../../shared/services/apiService';
import ubicacionesService from '../../../ubicaciones/api/ubicacionesService';
import GoogleMapComponent from '../../../../shared/components/map/components/GoogleMapComponent';
import Modal from '../../../../shared/components/modal/Modal';
import UbicacionAddQuick from '../../../ubicaciones/components/ubicacionAddModal/UbicacionAddQuick';
import ParadaModal from './ParadaModal';
import SortableParadaItem from './SortableParadaItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import '@material/web/icon/icon.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/linear-progress.js';

const AddRutaModal = ({ isOpen, onClose, onConfirm, itemData }) => {
  const isEditMode = !!itemData;
  const ruta = itemData;

  const [formData, setFormData] = useState({
    idUbicacionOrigen: '',
    idUbicacionDestino: '',
    distancia: '',
    precioBase: '',
    observaciones: '',
    tiempo: '',
    estado: 'Activa',
  });

  const [ubicaciones, setUbicaciones] = useState([]);
  const [origenSeleccionado, setOrigenSeleccionado] = useState(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEstadoVacioVisible, setIsEstadoVacioVisible] = useState(true);
  const [isUbicacionModalOpen, setIsUbicacionModalOpen] = useState(false);
  const [isParadaModalOpen, setIsParadaModalOpen] = useState(false);
  const [tipoUbicacion, setTipoUbicacion] = useState(null);
  const [paradas, setParadas] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        idUbicacionOrigen: '',
        idUbicacionDestino: '',
        distancia: '',
        precioBase: '',
        observaciones: '',
        tiempo: '',
        estado: 'Activa',
      });
      setOrigenSeleccionado(null);
      setDestinoSeleccionado(null);
      setParadas([]);
      setError(null);
      setSuccess(false);
      setIsEstadoVacioVisible(true);

      datosCargadosRef.current = false;
    }
  }, [isOpen]);

  const datosCargadosRef = useRef(false);

  useEffect(() => {
    if (isOpen && isEditMode && ruta) {
      const rutaId = ruta.idRuta;
      const ultimaRutaId = datosCargadosRef.current;

      if (
        ultimaRutaId === rutaId &&
        origenSeleccionado &&
        destinoSeleccionado
      ) {
        return;
      }

      datosCargadosRef.current = rutaId;

      const precioFormateado = ruta.precioBase
        ? Number(ruta.precioBase).toLocaleString('es-CO')
        : '';

      setFormData({
        idUbicacionOrigen:
          ruta.origen?.idUbicacion || ruta.origen?.ubicacion?.idUbicacion || '',
        idUbicacionDestino:
          ruta.destino?.idUbicacion ||
          ruta.destino?.ubicacion?.idUbicacion ||
          '',
        distancia: ruta.distancia || '',
        precioBase: precioFormateado,
        observaciones: ruta.observaciones || '',
        tiempo: ruta.tiempoEstimado || '',
        estado: ruta.estado || 'Activa',
      });

      setOrigenSeleccionado(prev => {
        if (prev && ubicaciones.length > 0) {
          const origenId =
            ruta.origen?.idUbicacion || ruta.origen?.ubicacion?.idUbicacion;
          if (origenId && prev.idUbicacion === origenId) {
            return prev;
          }
        }

        if (ubicaciones.length > 0) {
          const origenId =
            ruta.origen?.idUbicacion || ruta.origen?.ubicacion?.idUbicacion;
          const origen = origenId
            ? ubicaciones.find(u => u.idUbicacion === origenId)
            : null;
          return origen || ruta.origen?.ubicacion || null;
        }
        return ruta.origen?.ubicacion || null;
      });

      setDestinoSeleccionado(prev => {
        if (prev && ubicaciones.length > 0) {
          const destinoId =
            ruta.destino?.idUbicacion || ruta.destino?.ubicacion?.idUbicacion;
          if (destinoId && prev.idUbicacion === destinoId) {
            return prev;
          }
        }

        if (ubicaciones.length > 0) {
          const destinoId =
            ruta.destino?.idUbicacion || ruta.destino?.ubicacion?.idUbicacion;
          const destino = destinoId
            ? ubicaciones.find(u => u.idUbicacion === destinoId)
            : null;
          return destino || ruta.destino?.ubicacion || null;
        }
        return ruta.destino?.ubicacion || null;
      });

      if (
        ruta.paradas &&
        Array.isArray(ruta.paradas) &&
        ruta.paradas.length > 0
      ) {
        const paradasUbicaciones = ruta.paradas
          .sort((a, b) => (a.orden || 0) - (b.orden || 0))
          .map(parada => {
            if (parada.ubicacion) {
              const ubicacionParada = parada.ubicacion;

              if (ubicaciones.length > 0) {
                const ubicacionCompleta = ubicaciones.find(
                  u => u.idUbicacion === ubicacionParada.idUbicacion
                );

                return (
                  ubicacionCompleta || {
                    ...ubicacionParada,

                    idUbicacion: ubicacionParada.idUbicacion,
                    nombreUbicacion:
                      ubicacionParada.nombreUbicacion || ubicacionParada.nombre,
                    direccion: ubicacionParada.direccion,
                    latitud: ubicacionParada.latitud,
                    longitud: ubicacionParada.longitud,
                    estado: ubicacionParada.estado,
                  }
                );
              }

              return {
                ...ubicacionParada,
                idUbicacion: ubicacionParada.idUbicacion,
                nombreUbicacion:
                  ubicacionParada.nombreUbicacion || ubicacionParada.nombre,
                direccion: ubicacionParada.direccion,
                latitud: ubicacionParada.latitud,
                longitud: ubicacionParada.longitud,
                estado: ubicacionParada.estado,
              };
            }

            if (parada.idUbicacion && ubicaciones.length > 0) {
              const ubicacionParada = ubicaciones.find(
                u => u.idUbicacion === parada.idUbicacion
              );
              return ubicacionParada;
            }
            return null;
          })
          .filter(Boolean);
        setParadas(paradasUbicaciones);
      } else {
        setParadas([]);
      }
    } else if (isOpen && !isEditMode) {
      setParadas([]);
      setOrigenSeleccionado(null);
      setDestinoSeleccionado(null);
    }
  }, [isOpen, isEditMode, ruta?.idRuta]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUbicaciones = async () => {
      try {
        const data = await ubicacionesService.getAll();

        const ubicacionesMapeadas = data.map(u => ({
          idUbicacion: u.idUbicacion,
          nombreUbicacion: u.nombreUbicacion,
          direccion: u.direccion,
          latitud: u.latitud ? Number(u.latitud) : null,
          longitud: u.longitud ? Number(u.longitud) : null,
          estado: true,
        }));

        setUbicaciones(ubicacionesMapeadas);
      } catch (error) {
        console.error('Error fetching ubicaciones:', error);
        setError('No se pudieron cargar las ubicaciones');
      }
    };

    fetchUbicaciones();
  }, [isOpen]);

  const handleUbicacionAdded = async nuevaUbicacion => {
    try {
      const data = await ubicacionesService.getAll();

      const ubicacionesMapeadas = data.map(u => ({
        idUbicacion: u.idUbicacion,
        nombreUbicacion: u.nombreUbicacion,
        direccion: u.direccion,
        latitud: u.latitud ? Number(u.latitud) : null,
        longitud: u.longitud ? Number(u.longitud) : null,
        estado: true,
      }));

      setUbicaciones(ubicacionesMapeadas);

      if (nuevaUbicacion && tipoUbicacion) {
        const idUbicacion = nuevaUbicacion.idUbicacion || nuevaUbicacion.id;

        if (idUbicacion) {
          const ubicacionCreada = ubicacionesMapeadas.find(
            u => u.idUbicacion === idUbicacion
          );

          if (ubicacionCreada) {
            if (tipoUbicacion === 'origen') {
              setFormData(prev => ({
                ...prev,
                idUbicacionOrigen: ubicacionCreada.idUbicacion,
              }));
              setOrigenSeleccionado(ubicacionCreada);

              if (destinoSeleccionado) {
                setIsEstadoVacioVisible(false);
              }
            } else if (tipoUbicacion === 'destino') {
              setFormData(prev => ({
                ...prev,
                idUbicacionDestino: ubicacionCreada.idUbicacion,
              }));
              setDestinoSeleccionado(ubicacionCreada);

              if (origenSeleccionado) {
                setIsEstadoVacioVisible(false);
              }
            } else if (tipoUbicacion === 'parada') {
              if (paradas.length < 5) {
                setParadas(prev => [...prev, ubicacionCreada]);
              } else {
                setError('Máximo 5 paradas permitidas');
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating ubicaciones list:', error);
    }
    setIsUbicacionModalOpen(false);
    setTipoUbicacion(null);
  };

  const handleParadaAdded = async ubicacion => {
    setIsParadaModalOpen(false);

    try {
      const response = await apiClient.get('/rutas/ubicaciones');
      const data = response?.data || response || [];

      const ubicacionesMapeadas = data.map(u => ({
        idUbicacion: u.idUbicacion,
        nombreUbicacion: u.nombreUbicacion,
        direccion: u.direccion,
        latitud: u.latitud,
        longitud: u.longitud,
        estado: true,
      }));

      setUbicaciones(prevUbicaciones => {
        return ubicacionesMapeadas;
      });

      const idBuscado = ubicacion.idUbicacion || ubicacion.id;
      const ubicacionActualizada =
        ubicacionesMapeadas.find(u => u.idUbicacion === idBuscado) || ubicacion;

      setParadas(prevParadas => {
        if (prevParadas.length >= 5) {
          setError('Máximo 5 paradas permitidas');
          return prevParadas;
        }

        const yaExiste = prevParadas.some(
          p => p.idUbicacion === ubicacionActualizada.idUbicacion
        );
        if (!yaExiste) {
          setError(null);
          return [...prevParadas, ubicacionActualizada];
        } else {
          setError('Esta ubicación ya está agregada como parada');
          return prevParadas;
        }
      });
    } catch (error) {
      setError('Error al agregar la parada');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = event => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setParadas(items => {
        const oldIndex = items.findIndex((item, idx) => {
          const itemId = String(item.idUbicacion || idx);
          return itemId === String(active.id);
        });
        const newIndex = items.findIndex((item, idx) => {
          const itemId = String(item.idUbicacion || idx);
          return itemId === String(over.id);
        });

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  const handleOrigenChange = e => {
    const idUbicacion = e.target.value;
    console.log('Origen seleccionado ID:', idUbicacion);
    console.log('Ubicaciones disponibles:', ubicaciones);

    setFormData(prev => ({ ...prev, idUbicacionOrigen: idUbicacion }));

    const ubicacion = ubicaciones.find(
      u => String(u.idUbicacion) === String(idUbicacion)
    );
    console.log('Ubicación encontrada para origen:', ubicacion);
    setOrigenSeleccionado(ubicacion || null);

    if (ubicacion && destinoSeleccionado) {
      setIsEstadoVacioVisible(false);
    }
  };

  const handleDestinoChange = e => {
    const idUbicacion = e.target.value;
    console.log('Destino seleccionado ID:', idUbicacion);
    console.log('Ubicaciones disponibles:', ubicaciones);

    setFormData(prev => ({ ...prev, idUbicacionDestino: idUbicacion }));

    const ubicacion = ubicaciones.find(
      u => String(u.idUbicacion) === String(idUbicacion)
    );
    console.log('Ubicación encontrada para destino:', ubicacion);
    setDestinoSeleccionado(ubicacion || null);

    if (ubicacion && origenSeleccionado) {
      setIsEstadoVacioVisible(false);
    }
  };

  const handleRouteCalculated = routeData => {
    setFormData(prev => ({
      ...prev,
      distancia: routeData.distance,
      tiempo: routeData.durationFormatted,
    }));
    setError(null);

    setIsEstadoVacioVisible(false);
  };

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'precioBase') {
      const numericValue = value.replace(/[^\d]/g, '');

      if (numericValue) {
        const formattedValue = parseInt(numericValue, 10).toLocaleString(
          'es-CO'
        );
        setFormData({ ...formData, [name]: formattedValue });
      } else {
        setFormData({ ...formData, [name]: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const precioNumerico = formData.precioBase
        ? parseFloat(formData.precioBase.replace(/\./g, ''))
        : 0;

      if (
        !formData.precioBase ||
        isNaN(precioNumerico) ||
        precioNumerico <= 0
      ) {
        setError('Por favor ingresa un precio válido');
        return;
      }

      if (isEditMode) {
        if (!ruta) return;

        if (!formData.idUbicacionOrigen || !formData.idUbicacionDestino) {
          setError('Por favor selecciona origen y destino');
          return;
        }
        if (formData.idUbicacionOrigen === formData.idUbicacionDestino) {
          setError('El origen y destino no pueden ser el mismo');
          return;
        }

        setLoading(true);
        setError(null);

        let idOrigen;
        const origenId =
          formData.idUbicacionOrigen || origenSeleccionado?.idUbicacion;
        if (origenId) {
          const origenExistente = await apiClient.get(
            `/rutas/origen/por-ubicacion/${origenId}`
          );

          const origenData = origenExistente?.data || origenExistente;

          if (origenData && origenData.idOrigen) {
            idOrigen = origenData.idOrigen;
          } else {
            const nuevoOrigen = await apiClient.post('/rutas/origen', {
              idUbicacion: origenId,
              descripcion: `Origen: ${origenSeleccionado?.nombreUbicacion || 'Origen'}`,
            });
            const nuevoOrigenData = nuevoOrigen?.data || nuevoOrigen;
            idOrigen = nuevoOrigenData?.idOrigen;
          }
        }

        let idDestino;
        const destinoId =
          formData.idUbicacionDestino || destinoSeleccionado?.idUbicacion;
        if (destinoId) {
          const destinoExistente = await apiClient.get(
            `/rutas/destino/por-ubicacion/${destinoId}`
          );

          const destinoData = destinoExistente?.data || destinoExistente;

          if (destinoData && destinoData.idDestino) {
            idDestino = destinoData.idDestino;
          } else {
            const nuevoDestino = await apiClient.post('/rutas/destino', {
              idUbicacion: destinoId,
              descripcion: `Destino: ${destinoSeleccionado?.nombreUbicacion || 'Destino'}`,
            });
            const nuevoDestinoData = nuevoDestino?.data || nuevoDestino;
            idDestino = nuevoDestinoData?.idDestino;
          }
        }

        const dataToUpdate = {
          idOrigen,
          idDestino,
          distancia: parseFloat(formData.distancia),
          precioBase: precioNumerico,
          tiempoEstimado: String(formData.tiempo),
          observaciones: formData.observaciones || '',
          paradas: paradas.map(p => p.idUbicacion),
        };

        await apiClient.patch(`/rutas/${ruta.idRuta}`, dataToUpdate);
        setSuccess(true);
        setTimeout(() => {
          onConfirm?.();
          onClose();
        }, 1000);
      } else {
        if (!formData.idUbicacionOrigen || !formData.idUbicacionDestino) {
          setError('Por favor selecciona origen y destino');
          return;
        }
        if (formData.idUbicacionOrigen === formData.idUbicacionDestino) {
          setError('El origen y destino no pueden ser el mismo');
          return;
        }

        setLoading(true);
        setError(null);

        let idOrigen;
        const origenId =
          formData.idUbicacionOrigen || origenSeleccionado?.idUbicacion;
        if (origenId) {
          const origenExistente = await apiClient.get(
            `/rutas/origen/por-ubicacion/${origenId}`
          );

          const origenData = origenExistente?.data || origenExistente;

          if (origenData && origenData.idOrigen) {
            idOrigen = origenData.idOrigen;
          } else {
            const nuevoOrigen = await apiClient.post('/rutas/origen', {
              idUbicacion: origenId,
              descripcion: `Origen: ${origenSeleccionado?.nombreUbicacion || 'Origen'}`,
            });
            const nuevoOrigenData = nuevoOrigen?.data || nuevoOrigen;
            idOrigen = nuevoOrigenData?.idOrigen;
          }
        }

        let idDestino;
        const destinoId =
          formData.idUbicacionDestino || destinoSeleccionado?.idUbicacion;
        if (destinoId) {
          const destinoExistente = await apiClient.get(
            `/rutas/destino/por-ubicacion/${destinoId}`
          );

          const destinoData = destinoExistente?.data || destinoExistente;

          if (destinoData && destinoData.idDestino) {
            idDestino = destinoData.idDestino;
          } else {
            const nuevoDestino = await apiClient.post('/rutas/destino', {
              idUbicacion: destinoId,
              descripcion: `Destino: ${destinoSeleccionado?.nombreUbicacion || 'Destino'}`,
            });
            const nuevoDestinoData = nuevoDestino?.data || nuevoDestino;
            idDestino = nuevoDestinoData?.idDestino;
          }
        }

        const dataToSend = {
          idOrigen,
          idDestino,
          distancia: parseFloat(formData.distancia),
          precioBase: precioNumerico,
          tiempoEstimado: String(formData.tiempo),
          estado: 'Activa',
          observaciones: formData.observaciones || '',
          paradas: paradas.map(p => p.idUbicacion),
        };

        await apiClient.post('/rutas', dataToSend);
        setSuccess(true);
        setTimeout(() => {
          onConfirm?.();
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error('Error submitting ruta:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          (isEditMode
            ? 'Error al actualizar la ruta'
            : 'Error al crear la ruta')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <main className="relative overflow-hidden rounded-3xl">
        {loading && (
          <div className="absolute top-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden">
            <md-linear-progress indeterminate></md-linear-progress>
          </div>
        )}

        <div className="flex gap-0 h-[90vh]">
          <div className="w-[42%] p-6 flex flex-col">
            <div className="flex items-center gap-1 mb-4">
              <button
                type="button"
                onClick={onClose}
                className="text-secondary p-2 mr-2 btn-outline rounded-full hover:opacity-75 transition-colors cursor-pointer"
                disabled={loading}
              >
                <md-icon className="text-xl flex items-center justify-center">
                  close
                </md-icon>
              </button>
            </div>

            <div className="px-8 flex-1 flex flex-col overflow-y-auto">
              <div className="leading-tight mb-6">
                <h2 className="h2 font-medium text-primary">
                  {isEditMode ? 'Editar ruta' : 'Añadir ruta'}
                </h2>
              </div>
              {error && (
                <div className="bg-red/10 border border-red/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <md-icon className="text-red text-lg">error</md-icon>
                    <p className="text-red text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green/10 border border-green/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 justify-center">
                    <md-icon className="text-green text-lg">
                      check_circle
                    </md-icon>
                    <p className="text-green text-sm font-medium">
                      {isEditMode
                        ? '¡Ruta actualizada exitosamente!'
                        : '¡Ruta creada exitosamente!'}
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 flex-1"
              >
                <div>
                  <div className="flex items-center mb-1">
                    <label
                      className="block text-sm font-medium text-secondary flex-1"
                      htmlFor="idUbicacionOrigen"
                    >
                      Ubicación de Origen{' '}
                      <span className="text-red text-sm">*</span>
                    </label>
                    <md-filled-button
                      className="btn-search-compact shrink-0"
                      disabled={loading}
                      type="button"
                      onClick={() => {
                        setTipoUbicacion('origen');
                        setIsUbicacionModalOpen(true);
                      }}
                    >
                      Añadir ubicación
                    </md-filled-button>
                  </div>
                  <div className="select-wrapper w-full">
                    <md-icon className="text-sm">arrow_drop_down</md-icon>
                    <select
                      id="idUbicacionOrigen"
                      name="idUbicacionOrigen"
                      value={formData.idUbicacionOrigen}
                      onChange={handleOrigenChange}
                      className="select-filter w-full px-4 input bg-surface border rounded-lg"
                      required
                      disabled={loading}
                    >
                      <option value="">Selecciona el origen</option>
                      {ubicaciones
                        .filter(
                          u =>
                            !paradas.some(
                              p =>
                                String(p.idUbicacion) === String(u.idUbicacion)
                            ) &&
                            String(u.idUbicacion) !==
                              String(formData.idUbicacionDestino)
                        )
                        .map(ubicacion => (
                          <option
                            key={ubicacion.idUbicacion}
                            value={ubicacion.idUbicacion}
                          >
                            {ubicacion.nombreUbicacion} - {ubicacion.direccion}
                          </option>
                        ))}
                    </select>
                  </div>
                  {origenSeleccionado &&
                    (!origenSeleccionado.latitud ||
                      !origenSeleccionado.longitud) && (
                      <p className="text-red text-xs mt-1 flex items-center gap-1">
                        <md-icon className="text-sm">warning</md-icon>
                        Esta ubicación no tiene coordenadas válidas y no se
                        mostrará en el mapa.
                      </p>
                    )}
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <label
                      className="block text-sm font-medium text-secondary flex-1"
                      htmlFor="idUbicacionDestino"
                    >
                      Ubicación de Destino{' '}
                      <span className="text-red text-sm">*</span>
                    </label>
                    <md-filled-button
                      className="btn-search-compact shrink-0"
                      disabled={loading}
                      type="button"
                      onClick={() => {
                        setTipoUbicacion('destino');
                        setIsUbicacionModalOpen(true);
                      }}
                    >
                      Añadir ubicación
                    </md-filled-button>
                  </div>
                  <div className="select-wrapper w-full">
                    <md-icon className="text-sm">arrow_drop_down</md-icon>
                    <select
                      id="idUbicacionDestino"
                      name="idUbicacionDestino"
                      value={formData.idUbicacionDestino}
                      onChange={handleDestinoChange}
                      className="select-filter w-full px-4 input bg-surface border rounded-lg"
                      required
                      disabled={loading}
                    >
                      <option value="">Selecciona el destino</option>
                      {ubicaciones
                        .filter(
                          u =>
                            !paradas.some(
                              p =>
                                String(p.idUbicacion) === String(u.idUbicacion)
                            ) &&
                            String(u.idUbicacion) !==
                              String(formData.idUbicacionOrigen)
                        )
                        .map(ubicacion => (
                          <option
                            key={ubicacion.idUbicacion}
                            value={ubicacion.idUbicacion}
                          >
                            {ubicacion.nombreUbicacion} - {ubicacion.direccion}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      className="block text-sm font-medium text-secondary"
                      htmlFor="paradas"
                    >
                      Paradas{' '}
                      <span className="text-secondary text-xs">(Máximo 5)</span>
                    </label>
                    {paradas.length < 5 && (
                      <md-filled-button
                        className="btn-search-compact shrink-0"
                        disabled={loading}
                        type="button"
                        onClick={() => {
                          console.log('Intentando agregar parada');
                          console.log(
                            'origenSeleccionado:',
                            origenSeleccionado
                          );
                          console.log(
                            'destinoSeleccionado:',
                            destinoSeleccionado
                          );
                          console.log('formData:', formData);

                          const tieneOrigen =
                            origenSeleccionado || formData.idUbicacionOrigen;
                          const tieneDestino =
                            destinoSeleccionado || formData.idUbicacionDestino;

                          if (!tieneOrigen || !tieneDestino) {
                            setError(
                              'Primero debes seleccionar origen y destino'
                            );
                            return;
                          }
                          setError(null);
                          setIsParadaModalOpen(true);
                        }}
                      >
                        Añadir parada
                      </md-filled-button>
                    )}
                  </div>
                  {paradas.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={paradas.map((p, i) =>
                          String(p.idUbicacion || i)
                        )}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col gap-2 mt-2">
                          {paradas.map((parada, index) => (
                            <SortableParadaItem
                              key={parada.idUbicacion || index}
                              parada={parada}
                              index={index}
                              onRemove={() => {
                                const nuevasParadas = paradas.filter(
                                  (_, i) => i !== index
                                );
                                setParadas(nuevasParadas);
                              }}
                              loading={loading}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="content-box-outline-4-small p-4 mt-2 flex flex-col items-center justify-center gap-2 text-center">
                      <md-icon className="text-secondary text-2xl opacity-50">
                        location_on
                      </md-icon>
                      <p className="text-sm text-secondary font-medium">
                        No hay paradas agregadas
                      </p>
                      <p className="text-xs text-secondary opacity-75">
                        Las paradas son opcionales
                      </p>
                    </div>
                  )}
                </div>

                {origenSeleccionado && destinoSeleccionado && (
                  <div className="content-box-outline-2-small p-4">
                    <p className="text-secondary text-sm font-medium tracking-wide mb-3">
                      Información calculada
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="content-box-outline-4-small p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <md-icon className="text-primary text-lg">
                            straighten
                          </md-icon>
                          <p className="text-secondary text-xs font-medium uppercase">
                            Distancia
                          </p>
                        </div>
                        <p className="text-primary text-2xl font-bold">
                          {formData.distancia || '0'}
                          <span className="text-sm font-normal text-secondary ml-1">
                            km
                          </span>
                        </p>
                      </div>
                      <div className="content-box-outline-4-small p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <md-icon className="text-primary text-lg">
                            schedule
                          </md-icon>
                          <p className="text-secondary text-xs font-medium uppercase">
                            Tiempo
                          </p>
                        </div>
                        <p className="text-primary text-2xl font-bold">
                          {formData.tiempo || '0:00'}
                          <span className="text-sm font-normal text-secondary ml-1">
                            hrs
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className="block text-sm font-medium text-secondary mb-1"
                    htmlFor="precioBase"
                  >
                    Precio base <span className="text-red text-sm">*</span>
                  </label>
                  <input
                    id="precioBase"
                    type="text"
                    name="precioBase"
                    value={formData.precioBase}
                    onChange={handleChange}
                    placeholder="Aqui el precio base de la ruta"
                    className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-10"
                    required
                    disabled={loading}
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-secondary mb-1"
                    htmlFor="observaciones"
                  >
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Observaciones adicionales sobre la ruta..."
                    className="w-full px-4 py-3 input bg-fill border border-border rounded-lg text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none disabled:opacity-10"
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-3 mt-auto pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn px-5 text-secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <md-filled-button
                    className="btn-add w-full"
                    type="submit"
                    disabled={loading || success}
                  >
                    {loading
                      ? isEditMode
                        ? 'Actualizando...'
                        : 'Agregando...'
                      : success
                        ? isEditMode
                          ? 'Actualizado'
                          : 'Agregado'
                        : isEditMode
                          ? 'Actualizar ruta'
                          : 'Agregar ruta'}
                  </md-filled-button>
                </div>
              </form>
            </div>
          </div>

          <div className="w-[58%] relative overflow-hidden rounded-r-3xl">
            <GoogleMapComponent
              origen={origenSeleccionado}
              destino={destinoSeleccionado}
              paradas={paradas}
              onRouteCalculated={handleRouteCalculated}
              height="95vh"
              className="w-full"
            />
            {!origenSeleccionado &&
              !destinoSeleccionado &&
              paradas.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-r-3xl backdrop-blur-md z-20 transition-opacity duration-300 pointer-events-none">
                  <div className="content-box-outline-5-small max-w-md mx-auto">
                    <div className="flex flex-col items-center p-6">
                      <md-icon className="text-secondary text-3xl mb-4">
                        route
                      </md-icon>
                      <div className="flex flex-col items-center gap-2 text-center justify-center">
                        <h1 className="text-h5 text-primary font-semibold mb-1">
                          {isEditMode
                            ? 'Visualizando la ruta'
                            : 'Comienza agregando una ruta'}
                        </h1>
                        <p className="text-sm text-secondary font-normal">
                          {isEditMode
                            ? 'La ruta se mostrará en el mapa una vez que se carguen los datos.'
                            : 'Selecciona el origen y destino en el formulario a la izquierda para visualizar la ruta en el mapa.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </main>

      <UbicacionAddQuick
        isOpen={isUbicacionModalOpen}
        onClose={() => setIsUbicacionModalOpen(false)}
        onConfirm={handleUbicacionAdded}
      />
      <ParadaModal
        isOpen={isParadaModalOpen}
        onClose={() => setIsParadaModalOpen(false)}
        onConfirm={handleParadaAdded}
        ubicaciones={ubicaciones.filter(
          u =>
            !paradas.some(
              p => String(p.idUbicacion) === String(u.idUbicacion)
            ) &&
            String(u.idUbicacion) !== String(formData.idUbicacionOrigen) &&
            String(u.idUbicacion) !== String(formData.idUbicacionDestino)
        )}
        loading={loading}
      />
    </Modal>
  );
};

export default AddRutaModal;
