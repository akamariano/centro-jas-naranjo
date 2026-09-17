import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { CameraOff } from "lucide-react";

const READER_ID = "cjn-qr-reader";

/** Escáner de cámara para el Modo A del check-in híbrido. */
export default function QRScanner({ onScan, activo }) {
  const bloqueadoRef = useRef(false);
  const [error, setError] = useState("");

  // Encadena arranque/detención en una sola cola: en desarrollo (React.StrictMode)
  // el efecto se monta/desmonta/remonta de inmediato, y si start()/stop() se
  // disparan en paralelo la cámara queda "colgada" (luz encendida) y el layout
  // del lector se rompe. Serializar todo por esta promesa lo evita sin importar
  // qué tan rápido se repita el ciclo montar/desmontar.
  const colaRef = useRef(Promise.resolve());

  useEffect(() => {
    if (!activo) return undefined;

    let cancelado = false;
    let instancia = null;

    colaRef.current = colaRef.current.then(async () => {
      if (cancelado) return;
      instancia = new Html5Qrcode(READER_ID, { verbose: false });
      try {
        await instancia.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (bloqueadoRef.current) return;
            bloqueadoRef.current = true;
            onScan(decodedText);
            // Evita registros duplicados por el mismo cuadro de video
            setTimeout(() => {
              bloqueadoRef.current = false;
            }, 2000);
          },
          () => {} // errores de decodificación por cuadro: se ignoran (son constantes)
        );
      } catch (_err) {
        if (!cancelado) setError("No se pudo acceder a la cámara. Revisa los permisos del navegador.");
      }
    });

    return () => {
      cancelado = true;
      colaRef.current = colaRef.current.then(async () => {
        if (!instancia) return;
        if (instancia.getState() === Html5QrcodeScannerState.SCANNING) {
          await instancia.stop().catch(() => {});
        }
        try {
          instancia.clear();
        } catch (_err) {
          // nada que limpiar
        }
      });
    };
  }, [activo, onScan]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-ink/10 bg-paper-100 p-8 text-center text-sm text-ink/60">
        <CameraOff size={24} />
        {error}
      </div>
    );
  }

  return <div id={READER_ID} className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-paper/15" />;
}
