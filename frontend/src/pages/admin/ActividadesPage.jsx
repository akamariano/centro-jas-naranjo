import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarClock, CheckCircle2, Trash2 } from "lucide-react";
import { listarActividades, crearActividad, activarActividad, eliminarActividad } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import ReporteActividad from "../../components/admin/ReporteActividad.jsx";
import { formatearFecha } from "../../utils/fecha";
import { useConfirm } from "../../context/ConfirmContext.jsx";

const ESTADO_INICIAL = { nombre: "", descripcion: "", fecha: "" };

export default function ActividadesPage() {
  const confirmAction = useConfirm();
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);

  const cargar = () => {
    setCargando(true);
    listarActividades()
      .then(setActividades)
      .finally(() => setCargando(false));
  };

  useEffect(cargar, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await crearActividad(form);
      toast.success("Actividad creada y marcada como activa.");
      setForm(ESTADO_INICIAL);
      cargar();
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo crear la actividad."));
    } finally {
      setEnviando(false);
    }
  };

  const handleActivar = async (id) => {
    try {
      await activarActividad(id);
      toast.success("Actividad activada.");
      cargar();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleEliminar = async (actividad) => {
    const ok = await confirmAction({
      titulo: "¿Eliminar esta actividad?",
      mensaje: `Se eliminará "${actividad.nombre}" y todas sus asistencias asociadas. Esto no se puede deshacer.`,
      confirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await eliminarActividad(actividad.id);
      toast.success("Actividad eliminada.");
      cargar();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="card h-fit space-y-4">
          <h2 className="font-semibold text-ink">Nueva actividad</h2>
          <div>
            <label className="label">Nombre *</label>
            <input
              className="input"
              required
              minLength={3}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Fecha</label>
            <input
              type="date"
              className="input"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>
          <button type="submit" disabled={enviando} className="btn-primary w-full">
            {enviando ? "Creando…" : "Crear y activar"}
          </button>
          <p className="text-xs text-ink/40">
            La actividad recién creada se marca automáticamente como la activa para recibir asistencias.
          </p>
        </form>

        <div>
          <h2 className="mb-4 font-semibold text-paper">Actividades</h2>
          {cargando && <p className="text-sm text-paper/40">Cargando…</p>}
          <div className="space-y-3">
            {actividades.map((a) => (
              <div key={a.id} className="card flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CalendarClock size={18} className="mt-0.5 shrink-0 text-ink/40" />
                  <div>
                    <p className="font-medium text-ink">
                      {a.nombre}
                      {a.activa && (
                        <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-paper">
                          Activa
                        </span>
                      )}
                    </p>
                    {a.descripcion && <p className="text-sm text-ink/50">{a.descripcion}</p>}
                    <p className="text-xs text-ink/40">{formatearFecha(a.fecha)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!a.activa && (
                    <button onClick={() => handleActivar(a.id)} title="Marcar como activa" className="btn-ghost !p-2">
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button onClick={() => handleEliminar(a)} title="Eliminar" className="btn-ghost !p-2 hover:bg-ink hover:text-paper">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {!cargando && actividades.length === 0 && <p className="text-sm text-paper/40">Aún no hay actividades.</p>}
          </div>
        </div>
      </div>

      <ReporteActividad actividades={actividades} />
    </div>
  );
}
