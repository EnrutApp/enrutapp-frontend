import { useEffect, useRef } from "react";

/**
 * Hook que añade la clase "in-view" al elemento referenciado
 * cuando entra al viewport, disparando las animaciones CSS de la landing.
 *
 * @param {IntersectionObserverInit} options - Opciones del IntersectionObserver
 * @returns {React.RefObject} ref que se asigna al elemento a animar
 */
const useInView = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
};

export default useInView;
