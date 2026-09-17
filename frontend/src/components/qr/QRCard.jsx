import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../layout/Logo.jsx";

/**
 * Carnet virtual descargable. El QR codifica únicamente el `codigo_corto`
 * (ej. "JAS-8F32"), que el admin valida y resuelve contra la base de datos
 * al escanear — el QR nunca es la fuente de verdad de los datos del usuario.
 */
export default function QRCard({ usuario }) {
  const cardRef = useRef(null);
  const [descargando, setDescargando] = useState(false);

  const handleDescargar = async () => {
    if (!cardRef.current) return;
    setDescargando(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 3, // alta resolución para impresión/lectura offline
      });
      canvas.toBlob((blob) => {
        if (blob) saveAs(blob, `carnet-${usuario.codigo_corto}.png`);
      }, "image/png");
    } catch (err) {
      toast.error("No se pudo generar la imagen del carnet.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    // La animación va en este wrapper, no en cardRef: así html2canvas siempre
    // captura el carnet en su estado final (sin blur/escala residual).
    <div className="animate-materialize flex flex-col items-center gap-5">
      <div
        ref={cardRef}
        className="w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-6 text-center shadow-card"
      >
        <Logo stacked iconClassName="h-12 w-auto" textClassName="text-sm" className="mb-4" />
        <p className="text-lg font-semibold text-ink">{usuario.nombre_completo}</p>
        {(usuario.barrio || usuario.estaca) && (
          <p className="mt-0.5 text-xs text-ink/50">
            {[usuario.barrio, usuario.estaca].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mx-auto my-5 flex w-fit items-center justify-center rounded-xl border border-ink/10 bg-white p-3">
          <QRCodeCanvas value={usuario.codigo_corto} size={200} fgColor="#0a0a0a" bgColor="#ffffff" level="M" />
        </div>

        <p className="font-mono text-sm tracking-widest text-ink/70">{usuario.codigo_corto}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-ink/30">Carnet de asistente</p>
      </div>

      <button onClick={handleDescargar} disabled={descargando} className="btn-primary w-full max-w-sm">
        <Download size={18} />
        {descargando ? "Generando imagen…" : "Descargar / Guardar QR"}
      </button>
    </div>
  );
}
