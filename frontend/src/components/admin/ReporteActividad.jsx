import { useMemo, useState } from "react";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { Search, FileDown, ClipboardList, Images } from "lucide-react";
import { obtenerReporteActividad, descargarReportePdf } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { formatearFecha } from "../../utils/fecha";
import { resolverUrlImagen } from "../../utils/imagenes";

const MAX_FOTOS = 10;

/** Busca una actividad por ID o nombre (sobre la lista ya cargada) y arma su reporte. */
export default function ReporteActividad({ actividades }) {
  const [query, setQuery] = useState("");
  const [seleccionada, setSeleccionada] = useState(null);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState(false);

  const resultados = useMemo(() => {
    const texto = query.trim().toLowerCase();
    if (texto.length < 2) return [];
    return actividades
      .filter((a) => a.id.toLowerCase() === texto || a.nombre.toLowerCase().includes(texto))
      .slice(0, 8);
  }, [query, actividades]);

  const seleccionar = async (actividad) => {
    setSeleccionada(actividad);
    setQuery("");
    setReporte(null);
    setCargando(true);
    try {
      const data = await obtenerReporteActividad(actividad.id);
      setReporte(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo cargar el reporte."));
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPdf = async () => {
    if (!seleccionada) return;
    setDescargando(true);
    try {
      const blob = await descargarReportePdf(seleccionada.id);
      const nombreArchivo = `reporte-${seleccionada.nombre.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
      saveAs(blob, nombreArchivo);
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo generar el PDF."));
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="card">
      <h2 className="mb-1 font-semibold text-ink">Reporte de actividad</h2>
      <p className="mb-4 text-sm text-ink/50">Busca una actividad por su ID o nombre para generar su reporte.</p>

      <div className="relative max-w-md">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Buscar por nombre o ID de actividad"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {resultados.length > 0 && (
          <ul className="animate-materialize absolute z-20 mt-2 max-h-64 w-full origin-top overflow-auto rounded-xl border border-ink/10 bg-paper shadow-card">
            {resultados.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => seleccionar(a)}
                  className="flex w-full flex-col items-start px-4 py-2.5 text-left text-sm transition-[background-color,transform] duration-150 active:scale-[0.98] hover:bg-paper-100"
                >
                  <span className="font-medium text-ink">{a.nombre}</span>
                  <span className="font-mono text-xs text-ink/40">{a.id}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.trim().length >= 2 && resultados.length === 0 && (
          <p className="mt-2 text-xs text-ink/40">Sin coincidencias.</p>
        )}
      </div>

      {cargando && <p className="mt-6 text-sm text-ink/40">Generando reporte…</p>}

      {reporte && !cargando && (
        <div className="animate-materialize mt-6 space-y-6 border-t border-ink/10 pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/40">Actividad</p>
              <h3 className="text-lg font-semibold text-ink">{reporte.actividad.nombre}</h3>
              <p className="text-xs text-ink/40">
                {formatearFecha(reporte.actividad.fecha, { dateStyle: "long" })}
              </p>
              {reporte.actividad.descripcion && (
                <p className="mt-2 max-w-lg text-sm text-ink/60">{reporte.actividad.descripcion}</p>
              )}
            </div>
            <button onClick={handleDescargarPdf} disabled={descargando} className="btn-primary shrink-0">
              <FileDown size={18} />
              {descargando ? "Generando PDF…" : "Descargar PDF"}
            </button>
          </div>

          {/* Sección 1: Resumen */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-ink/50">
              <ClipboardList size={16} />
              <h4 className="text-sm font-semibold uppercase tracking-wide">Resumen</h4>
            </div>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Asistencia total", reporte.resumen.total],
                ["Miembros", reporte.resumen.miembros],
                ["No miembros", reporte.resumen.no_miembros],
                ["Estaca más frecuentada", reporte.resumen.estaca_mas_frecuentada || "—"],
              ].map(([etiqueta, valor]) => (
                <div key={etiqueta} className="rounded-xl border border-ink/10 p-4">
                  <dt className="text-xs text-ink/40">{etiqueta}</dt>
                  <dd className="mt-1 text-lg font-semibold text-ink">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Sección 2: Fotos */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-ink/50">
              <Images size={16} />
              <h4 className="text-sm font-semibold uppercase tracking-wide">
                Fotos ({reporte.fotos.length}/{MAX_FOTOS})
              </h4>
            </div>
            {reporte.fotos.length === 0 ? (
              <p className="text-sm text-ink/40">Esta actividad no tiene fotos adjuntas.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {reporte.fotos.map((f) => (
                  <div key={f.id} className="aspect-square overflow-hidden rounded-xl border border-ink/10">
                    <img src={resolverUrlImagen(f.url)} alt={f.descripcion || ""} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
