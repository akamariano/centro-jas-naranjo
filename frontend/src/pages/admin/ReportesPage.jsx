import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ImagePlus, Trash2 } from "lucide-react";
import {
  listarActividades,
  listarAsistencias,
  listarFotos,
  subirFoto,
  eliminarFoto,
} from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { resolverUrlImagen } from "../../utils/imagenes";

const MAX_FOTOS = 10; // debe coincidir con MAX_FOTOS_REPORTE en el backend

export default function ReportesPage() {
  const [actividades, setActividades] = useState([]);
  const [actividadId, setActividadId] = useState("");
  const [filtros, setFiltros] = useState({ estaca: "", barrio: "", es_miembro: "" });
  const [asistencias, setAsistencias] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    listarActividades().then((lista) => {
      setActividades(lista);
      if (lista.length > 0) setActividadId(lista[0].id);
    });
  }, []);

  const cargarDatos = () => {
    if (!actividadId) return;
    setCargando(true);
    const params = {
      actividad_id: actividadId,
      estaca: filtros.estaca || undefined,
      barrio: filtros.barrio || undefined,
      es_miembro: filtros.es_miembro || undefined,
    };
    Promise.all([listarAsistencias(params), listarFotos(actividadId)])
      .then(([a, f]) => {
        setAsistencias(a);
        setFotos(f);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setCargando(false));
  };

  useEffect(cargarDatos, [actividadId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubirFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !actividadId) return;
    setSubiendo(true);
    try {
      const foto = await subirFoto(actividadId, file);
      setFotos((prev) => [foto, ...prev]);
      toast.success("Foto agregada.");
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo subir la foto."));
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const handleEliminarFoto = async (id) => {
    try {
      await eliminarFoto(id);
      setFotos((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <div className="card flex flex-wrap items-end gap-4">
        <div>
          <label className="label">Actividad</label>
          <select className="input" value={actividadId} onChange={(e) => setActividadId(e.target.value)}>
            {actividades.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Estaca</label>
          <input className="input" value={filtros.estaca} onChange={(e) => setFiltros({ ...filtros, estaca: e.target.value })} />
        </div>
        <div>
          <label className="label">Barrio</label>
          <input className="input" value={filtros.barrio} onChange={(e) => setFiltros({ ...filtros, barrio: e.target.value })} />
        </div>
        <div>
          <label className="label">Miembro</label>
          <select
            className="input"
            value={filtros.es_miembro}
            onChange={(e) => setFiltros({ ...filtros, es_miembro: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <button className="btn-primary" onClick={cargarDatos} disabled={cargando}>
          {cargando ? "Filtrando…" : "Filtrar"}
        </button>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-4 font-semibold text-ink">
          Asistencias ({asistencias.length})
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-ink/40">
              <th className="pb-2 pr-4">Nombre</th>
              <th className="pb-2 pr-4">Estaca</th>
              <th className="pb-2 pr-4">Barrio</th>
              <th className="pb-2 pr-4">Miembro</th>
              <th className="pb-2 pr-4">Método</th>
              <th className="pb-2">Hora</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((a) => (
              <tr key={a.id} className="border-b border-ink/5">
                <td className="py-2 pr-4 font-medium text-ink">{a.nombre_completo}</td>
                <td className="py-2 pr-4 text-ink/60">{a.estaca || "—"}</td>
                <td className="py-2 pr-4 text-ink/60">{a.barrio || "—"}</td>
                <td className="py-2 pr-4 text-ink/60">{a.es_miembro ? "Sí" : "No"}</td>
                <td className="py-2 pr-4 text-ink/60 uppercase">{a.metodo}</td>
                <td className="py-2 text-ink/60">{new Date(a.created_at).toLocaleTimeString("es-GT")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {asistencias.length === 0 && <p className="py-6 text-center text-sm text-ink/40">Sin asistencias para este filtro.</p>}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-ink">
            Fotos de la actividad <span className="font-normal text-ink/40">({fotos.length}/{MAX_FOTOS})</span>
          </h2>
          {fotos.length >= MAX_FOTOS ? (
            <p className="text-xs text-ink/40">Máximo de fotos alcanzado</p>
          ) : (
            <label className="btn-secondary cursor-pointer !py-2 text-xs">
              <ImagePlus size={16} />
              {subiendo ? "Subiendo…" : "Agregar foto"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleSubirFoto} disabled={subiendo} />
            </label>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fotos.map((f) => (
            <div key={f.id} className="group relative aspect-square overflow-hidden rounded-xl border border-ink/10">
              <img src={resolverUrlImagen(f.url)} alt={f.descripcion || ""} className="h-full w-full object-cover" />
              <button
                onClick={() => handleEliminarFoto(f.id)}
                className="absolute right-1.5 top-1.5 rounded-full bg-ink/70 p-1.5 text-paper opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        {fotos.length === 0 && <p className="text-sm text-ink/40">Aún no hay fotos para esta actividad.</p>}
      </div>
    </div>
  );
}
