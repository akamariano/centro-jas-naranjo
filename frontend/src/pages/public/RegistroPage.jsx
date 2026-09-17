import { useState } from "react";
import toast from "react-hot-toast";
import { registrarUsuario } from "../../api/public";
import { getErrorMessage } from "../../api/client";
import QRCard from "../../components/qr/QRCard.jsx";

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

export default function RegistroPage() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [usuarioCreado, setUsuarioCreado] = useState(null);

  const actualizar = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const usuario = await registrarUsuario(form);
      setUsuarioCreado(usuario);
      toast.success("¡Registro exitoso! Guarda tu carnet.");
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo completar el registro."));
    } finally {
      setEnviando(false);
    }
  };

  if (usuarioCreado) {
    return (
      <div className="mx-auto max-w-sm py-6">
        <h1 className="text-title mb-6 text-center text-paper">¡Bienvenido/a!</h1>
        <QRCard usuario={usuarioCreado} />
        <button
          className="btn-ghost mt-6 w-full text-paper hover:bg-white/10 hover:text-paper"
          onClick={() => {
            setUsuarioCreado(null);
            setForm(ESTADO_INICIAL);
          }}
        >
          Registrar a otra persona
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="text-title mb-1 text-paper">Registro de asistente</h1>
      <p className="mb-6 text-sm text-paper/50">Completa tus datos para generar tu carnet con código QR.</p>

      <form onSubmit={handleSubmit} className="card animate-materialize space-y-4">
        <div>
          <label className="label">Nombre completo *</label>
          <input
            className="input"
            required
            minLength={3}
            value={form.nombre_completo}
            onChange={actualizar("nombre_completo")}
          />
        </div>

        <div>
          <label className="label">Correo *</label>
          <input
            type="email"
            className="input"
            required
            placeholder="Se usa para recuperar tu QR"
            value={form.correo}
            onChange={actualizar("correo")}
          />
        </div>

        <div>
          <label className="label">Fecha de nacimiento *</label>
          <input
            type="date"
            className="input"
            required
            max={HOY}
            placeholder="Se usa para recuperar tu QR"
            value={form.fecha_nacimiento}
            onChange={actualizar("fecha_nacimiento")}
          />
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
          Soy miembro
        </label>

        <button type="submit" disabled={enviando} className="btn-primary w-full">
          {enviando ? "Registrando…" : "Generar mi carnet"}
        </button>
      </form>
    </div>
  );
}
