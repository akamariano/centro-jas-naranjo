import { useState } from "react";
import toast from "react-hot-toast";
import { recuperarUsuario } from "../../api/public";
import { getErrorMessage } from "../../api/client";
import QRCard from "../../components/qr/QRCard.jsx";

const HOY = new Date().toISOString().slice(0, 10);

const ESTADO_INICIAL = { nombre_completo: "", fecha_nacimiento: "", correo: "" };

export default function RecuperarQRPage() {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [buscando, setBuscando] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const actualizar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBuscando(true);
    setUsuario(null);
    try {
      const encontrado = await recuperarUsuario(form);
      setUsuario(encontrado);
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo recuperar el carnet."));
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm py-6">
      <h1 className="text-title mb-1 text-paper">Recuperar mi carnet</h1>
      <p className="mb-6 text-sm text-paper/50">
        Ingresa el nombre completo, la fecha de nacimiento y el correo que usaste al registrarte.
      </p>

      <form onSubmit={handleSubmit} className="card animate-materialize space-y-4">
        <div>
          <label className="label">Nombre completo</label>
          <input className="input" required value={form.nombre_completo} onChange={actualizar("nombre_completo")} />
        </div>
        <div>
          <label className="label">Fecha de nacimiento</label>
          <input
            type="date"
            className="input"
            required
            max={HOY}
            value={form.fecha_nacimiento}
            onChange={actualizar("fecha_nacimiento")}
          />
        </div>
        <div>
          <label className="label">Correo</label>
          <input type="email" className="input" required value={form.correo} onChange={actualizar("correo")} />
        </div>
        <button type="submit" disabled={buscando} className="btn-primary w-full">
          {buscando ? "Buscando…" : "Recuperar carnet"}
        </button>
      </form>

      {usuario && (
        <div className="mt-8">
          <QRCard usuario={usuario} />
        </div>
      )}
    </div>
  );
}
