import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmContext = createContext(null);

/**
 * Reemplaza al confirm() nativo del navegador por un modal propio y
 * consistente con el resto de la app — atenúa el fondo para enfocar la
 * decisión (en vez de bloquearla de golpe con un diálogo del sistema),
 * se puede cancelar con Escape o tocando fuera, y el foco entra al panel
 * apenas aparece.
 */
export function ConfirmProvider({ children }) {
  const [opciones, setOpciones] = useState(null);
  const resolverRef = useRef(null);
  const panelRef = useRef(null);

  const confirmar = useCallback((opts) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOpciones(opts);
    });
  }, []);

  const cerrar = useCallback((resultado) => {
    resolverRef.current?.(resultado);
    resolverRef.current = null;
    setOpciones(null);
  }, []);

  useEffect(() => {
    if (!opciones) return undefined;

    panelRef.current?.focus();
    const bodyOverflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") cerrar(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = bodyOverflowPrevio;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [opciones, cerrar]);

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}

      {opciones && (
        <div
          className="animate-scrim fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => cerrar(false)}
        >
          <div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            tabIndex={-1}
            className="card animate-materialize w-full max-w-sm outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-ink/70" />
              <h2 id="confirm-title" className="font-semibold text-ink">
                {opciones.titulo}
              </h2>
            </div>
            <p className="mb-5 text-sm text-ink/60">{opciones.mensaje}</p>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => cerrar(false)}>
                {opciones.cancelar || "Cancelar"}
              </button>
              <button className="btn-primary" onClick={() => cerrar(true)} autoFocus>
                {opciones.confirmar || "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/** confirmAction({ titulo, mensaje, confirmar?, cancelar? }) => Promise<boolean> */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
  return ctx;
}
