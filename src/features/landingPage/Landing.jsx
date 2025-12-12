import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "@material/web/icon/icon.js";

// Importar componentes
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import DestinySection from "./components/DestinySection";
import DestinosCarousel from "./components/DestinosCarousel";
import AboutSection from "./components/AboutSection";
import BenefitsSection from "./components/BenefitsSection";
import Footer from "./components/Footer";
import ubicacionesService from "../ubicaciones/api/ubicacionesService";

// Obtener fecha de hoy en formato local correcto (no UTC)
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Validar formulario de búsqueda
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Objeto con errores
 */
const validateSearchForm = (formData, requireUbicacionIds = false) => {
  const errors = {};

  // Validar origen
  if (requireUbicacionIds) {
    if (!formData.origenId) {
      errors.origen = "Selecciona un origen válido";
    }
  } else {
    if (!formData.origen || !formData.origen.trim()) {
      errors.origen = "La ciudad de origen es requerida";
    } else if (formData.origen.trim().length < 2) {
      errors.origen = "La ciudad de origen debe tener al menos 2 caracteres";
    }
  }

  // Validar destino
  if (requireUbicacionIds) {
    if (!formData.destinoId) {
      errors.destino = "Selecciona un destino válido";
    }
  } else {
    if (!formData.destino || !formData.destino.trim()) {
      errors.destino = "La ciudad de destino es requerida";
    } else if (formData.destino.trim().length < 2) {
      errors.destino = "La ciudad de destino debe tener al menos 2 caracteres";
    }
  }

  // Validar que origen y destino sean diferentes
  if (requireUbicacionIds) {
    if (formData.origenId && formData.destinoId && formData.origenId === formData.destinoId) {
      errors.destino = "Origen y destino no pueden ser la misma ubicación";
    }
  } else {
    if (
      formData.origen?.trim() &&
      formData.destino?.trim() &&
      formData.origen.trim().toLowerCase() ===
      formData.destino.trim().toLowerCase()
    ) {
      errors.destino = "Origen y destino no pueden ser la misma ciudad";
    }
  }

  // Validar fecha
  if (!formData.fecha) {
    errors.fecha = "La fecha es requerida";
  } else if (isPastDate(formData.fecha)) {
    errors.fecha = "No puedes seleccionar una fecha en el pasado";
  }

  return errors;
};

/**
 * Verificar si una fecha es anterior a hoy
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {boolean} True si la fecha es pasada
 */
const isPastDate = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Crear fecha ignorando zona horaria (tratando string como local)
  const [year, month, day] = dateString.split("-").map(Number);
  const selected = new Date(year, month - 1, day);
  selected.setHours(0, 0, 0, 0);

  return selected < today;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    origenId: "",
    destinoId: "",
    fecha: getTodayDate(),
    tipoViaje: "Hoy",
  });
  const [errors, setErrors] = useState({});

  const [ubicacionesItems, setUbicacionesItems] = useState([]);
  const [ubicacionesReady, setUbicacionesReady] = useState(false);

  // Helpers memorizado
  const clearError = useCallback(
    (field) => setErrors((prev) => ({ ...prev, [field]: undefined })),
    []
  );

  const scrollToSection = useCallback((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleNavigateLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  // Manejar búsqueda
  const handleBuscar = useCallback(
    (e) => {
      e.preventDefault();

      // Validar formulario
      const newErrors = validateSearchForm(formData, ubicacionesItems.length > 0);
      setErrors(newErrors);

      // Si hay errores, no proceder
      if (Object.keys(newErrors).length > 0) {
        return;
      }

      // Si las validaciones pasaron, navegar a búsqueda

      const queryParams = new URLSearchParams({
        origen: formData.origen,
        destino: formData.destino,
        fecha: formData.fecha,
        tipoViaje: formData.tipoViaje,
      });

      if (formData.origenId) queryParams.set('origenId', formData.origenId);
      if (formData.destinoId) queryParams.set('destinoId', formData.destinoId);

      navigate(`/busqueda?${queryParams.toString()}`);
    },
    [formData, ubicacionesItems.length, navigate]
  );

  // Manejar tipo de viaje
  const handleTipoViaje = useCallback((tipo) => {
    const fechaBase = new Date();
    if (tipo === "Mañana") fechaBase.setDate(fechaBase.getDate() + 1);
    const fechaISO = fechaBase.toISOString().split("T")[0];

    setFormData((prev) => ({ ...prev, tipoViaje: tipo, fecha: fechaISO }));
    clearError("fecha");
  }, [clearError]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadUbicaciones = async () => {
      try {
        const res = await ubicacionesService.getAll();
        const data = Array.isArray(res) ? res : res?.data || [];

        const mapped = data
          .map((u) => ({
            idUbicacion: u.idUbicacion || u.id,
            city: u.nombreUbicacion || u.nombre,
            department: u.direccion || '',
            estado: u.estado !== undefined ? u.estado : u.activo,
          }))
          .filter((u) => u.idUbicacion && u.city)
          .filter((u) => u.estado !== false);

        if (mounted) {
          setUbicacionesItems(mapped);
          setUbicacionesReady(true);
        }
      } catch (_) {
        if (mounted) {
          setUbicacionesItems([]);
          setUbicacionesReady(true);
        }
      }
    };

    loadUbicaciones();
    return () => {
      mounted = false;
    };
  }, []);


  const handleFormChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Si intenta seleccionar fecha pasada desde el input de fecha, bloqueamos
      if (name === "fecha" && isPastDate(value)) {
        setErrors((prev) => ({ ...prev, fecha: "No puedes seleccionar una fecha pasada" }));
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));
      clearError(name);

      // si cambian origen/destino, limpiar error de coincidencia
      if ((name === "origen" && formData.destino) || (name === "destino" && formData.origen)) {
        setErrors((prev) => ({ ...prev, destino: undefined }));
      }
    },
    [formData.destino, formData.origen, isPastDate, clearError]
  );

  const today = getTodayDate();

  return (
    <div className="bg-white text-gray-900 font-sans overflow-x-hidden">
      <Navbar scrolled={scrolled} scrollToSection={scrollToSection} handleNavigateLogin={handleNavigateLogin} />

      <HeroSection
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        clearError={clearError}
        handleBuscar={handleBuscar}
        handleTipoViaje={handleTipoViaje}
        today={today}
        ubicacionesItems={ubicacionesItems}
        ubicacionesReady={ubicacionesReady}
        scrollToSection={scrollToSection}
      />

      <DestinySection setFormData={setFormData} scrollToSection={scrollToSection}>
        <DestinosCarousel setFormData={setFormData} scrollToSection={scrollToSection} />
      </DestinySection>

      <AboutSection scrollToSection={scrollToSection} />
      <BenefitsSection />
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default LandingPage;