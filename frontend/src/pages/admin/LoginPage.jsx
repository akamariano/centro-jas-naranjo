import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getErrorMessage } from "../../api/client";
import Logo from "../../components/layout/Logo.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await login(usuario, password);
      const destino = location.state?.from?.pathname || "/admin";
      navigate(destino, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo iniciar sesión."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-paper/50 transition-colors hover:text-paper"
        >
          <ArrowLeft size={16} />
          Volver al sitio público
        </Link>

        <form onSubmit={handleSubmit} className="card animate-materialize space-y-4">
          <Logo stacked iconClassName="mx-auto h-14 w-auto" textClassName="text-lg" />
          <h1 className="text-title text-center text-ink">Acceso de administrador</h1>

          <div>
            <label className="label">Usuario</label>
            <input className="input" required value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
          </div>

          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={enviando} className="btn-primary w-full">
            {enviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
