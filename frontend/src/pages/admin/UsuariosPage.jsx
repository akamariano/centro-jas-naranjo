import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Users as UsersIcon } from "lucide-react";
import { listarUsuarios, crearUsuarioAdmin, eliminarUsuarioAdmin } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { useDebounce } from "../../hooks/useDebounce";
import { formatearFecha } from "../../utils/fecha";
import { useConfirm } from "../../context/ConfirmContext.jsx";

const HOY = new Date().toISOString().slice(0, 10);

const ESTADO_INICIAL = {
  nombre_completo: "",
  correo: "",
  telefono: "",
  fecha_nacimiento: "",
  estaca: "",
  barrio: "",
  es_miembro: false,
};

export default function UsuariosPage() {
  const confirmAction = useConfirm();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const consulta = useDebounce(busqueda, 300);

  const [form, setForm] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);

  const cargar = (q) => {
    setCargando(true);
    listarUsuarios(q)
      .then(setUsuarios)
      .catch((err) => toast.error(getErrorMessage(err, "No se pudo cargar la lista de JAS.")))
      .finally(() => setCargando(false));
  };

  useEffect(() => cargar(consulta), [consulta]);

  const actualizar = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await crearUsuarioAdmin(form);
      toast.success("JAS registrado.");
      setForm(ESTADO_INICIAL);
      cargar(consulta);
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo registrar al JAS."));
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (usuario) => {
    const ok = await confirmAction({
      titulo: "¿Eliminar este JAS?",
      mensaje: `Se eliminará a "${usuario.nombre_completo}" y su historial de asistencias. Esto no se puede deshacer.`,
      confirmar: "Eliminar",
    });
    if (!ok) return;
    try {
      await eliminarUsuarioAdmin(usuario.id);
      toast.success("Usuario eliminado.");
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <form onSubmit={handleSubmit} className="card h-fit space-y-4">
        <h2 className="font-semibold text-ink">Nuevo JAS</h2>

        <div>
          <label className="label">Nombre completo *</label>
          <input className="input" required minLength={3} value={form.nombre_completo} onChange={actualizar("nombre_completo")} />
        </div>
        <div>
          <label className="label">Correo *</label>
          <input type="email" className="input" required value={form.correo} onChange={actualizar("correo")} />
        </div>
        <div>
          <label className="label">Fecha de nacimiento *</label>
          <input type="date" className="input" required max={HOY} value={form.fecha_nacimiento} onChange={actualizar("fecha_nacimiento")} />
        </div>
        <div>
          <label className="label">Teléfono *</label>
          <input className="input" required value={form.telefono} onChange={actualizar("telefono")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Estaca</label>
            <input className="input" value={form.estaca} onChange={actualizar("estaca")} />
          </div>
          <div>
            <label className="label">Barrio</label>
            <input className="input" value={form.barrio} onChange={actualizar("barrio")} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={form.es_miembro} onChange={actualizar("es_miembro")} className="h-4 w-4 rounded border-ink/30" />
          Es miembro
        </label>

        <button type="submit" disabled={enviando} className="btn-primary w-full">
          {enviando ? "Registrando…" : "Registrar JAS"}
        </button>
      </form>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-paper">
            <UsersIcon size={18} />
            JAS - Registrados <span className="font-normal text-paper/40">({usuarios.length})</span>
          </h2>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              className="input w-64 pl-9"
              placeholder="Buscar por nombre o ID"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="card overflow-x-auto">
          {cargando && <p className="text-sm text-ink/40">Cargando…</p>}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-ink/40">
                <th className="pb-2 pr-4">Nombre</th>
                <th className="pb-2 pr-4">ID</th>
                <th className="pb-2 pr-4">Correo</th>
                <th className="pb-2 pr-4">Teléfono</th>
                <th className="pb-2 pr-4">Nacimiento</th>
                <th className="pb-2 pr-4">Estaca</th>
                <th className="pb-2 pr-4">Barrio</th>
                <th className="pb-2 pr-4">Miembro</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-ink/5">
                  <td className="py-2 pr-4 font-medium text-ink">{u.nombre_completo}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-ink/50">{u.codigo_corto}</td>
                  <td className="py-2 pr-4 text-ink/60">{u.correo || "—"}</td>
                  <td className="py-2 pr-4 text-ink/60">{u.telefono || "—"}</td>
                  <td className="py-2 pr-4 text-ink/60">
                    {u.fecha_nacimiento ? formatearFecha(u.fecha_nacimiento) : "—"}
                  </td>
                  <td className="py-2 pr-4 text-ink/60">{u.estaca || "—"}</td>
                  <td className="py-2 pr-4 text-ink/60">{u.barrio || "—"}</td>
                  <td className="py-2 pr-4 text-ink/60">{u.es_miembro ? "Sí" : "No"}</td>
                  <td className="py-2">
                    <button
                      onClick={() => handleEliminar(u)}
                      title="Eliminar"
                      className="btn-ghost !p-2 hover:bg-ink hover:text-paper"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!cargando && usuarios.length === 0 && <p className="py-6 text-center text-sm text-ink/40">Sin resultados.</p>}
        </div>
      </div>
    </div>
  );
}
