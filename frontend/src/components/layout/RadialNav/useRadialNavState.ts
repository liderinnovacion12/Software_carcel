import { useCallback, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export interface NavModule {
  path: string;
  label: string;
  icon: string;
  implemented: boolean;
}

export const NAV_MODULES: NavModule[] = [
  { path: "/", label: "Inicio", icon: "⌂", implemented: true },
  { path: "/personas", label: "Personas", icon: "◉", implemented: true },
  { path: "/casos", label: "Casos", icon: "⚖", implemented: false },
  { path: "/alertas", label: "Alertas", icon: "⚠", implemented: false },
  { path: "/documentos", label: "Documentos", icon: "☷", implemented: false },
  { path: "/establecimientos", label: "Establecimientos", icon: "⌂◼", implemented: false },
  { path: "/analitica", label: "Analitica", icon: "▲", implemented: false },
  { path: "/deteccion", label: "Deteccion", icon: "◈", implemented: false },
  { path: "/administracion", label: "Administracion", icon: "⚙", implemented: false },
];

export function useRadialNavState() {
  const [expanded, setExpanded] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  const activePath = location.pathname === "/" ? "/" : `/${location.pathname.split("/")[1]}`;

  const open = useCallback(() => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setExpanded(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimeout.current = setTimeout(() => setExpanded(false), 200);
  }, []);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const close = useCallback(() => setExpanded(false), []);

  const moveFocus = useCallback((direction: 1 | -1) => {
    setFocusedIndex((prev) => {
      const next = (prev + direction + NAV_MODULES.length) % NAV_MODULES.length;
      return next;
    });
  }, []);

  return {
    expanded,
    open,
    scheduleClose,
    toggle,
    close,
    activePath,
    focusedIndex,
    setFocusedIndex,
    moveFocus,
  };
}
