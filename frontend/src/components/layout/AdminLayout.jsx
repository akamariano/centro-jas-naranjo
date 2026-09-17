import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { QrCode, Users, CalendarClock, BarChart3, Megaphone, LogOut, Menu, Globe, FlaskConical, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Logo from "./Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { TEST_MODE, reiniciarDatosPrueba } from "../../testMode";

const links = [
  { to: "/admin", label: "Check-in", icon: QrCode, end: true },
  { to: "/admin/usuarios", label: "JAS - Registrados", icon: Users },
  { to: "/admin/actividades", label: "Actividades", icon: CalendarClock },
  { to: "/admin/reportes", label: "Reportes y fotos", icon: BarChart3 },
  { to: "/admin/anuncios", label: "Anuncios", icon: Megaphone },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const confirmAction = useConfirm();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada.");
    navigate("/admin/login");
  };

  const handleReiniciar = async () => {
    const ok = await confirmAction({
      titulo: "¿Borrar todos los datos de prueba?",
      mensaje: "Se eliminarán todos los usuarios, actividades, asistencias, anuncios y fotos guardados en este navegador. Esto no se puede deshacer.",
      confirmar: "Borrar todo",
    });
    if (ok) reiniciarDatosPrueba();
  };

  const navItems = links.map(({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={() => setMenuAbierto(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.98] ${
          isActive ? "bg-paper text-ink" : "text-paper/70 hover:bg-paper/10 hover:text-paper"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  ));

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink px-4 py-6 sm:flex">
        <Logo variant="blanco" iconClassName="h-9 w-auto" textClassName="text-sm" className="mb-4 px-2" />
        <Link
          to="/"
          className="mb-6 flex items-center gap-3 rounded-lg border border-paper/15 px-3 py-2.5 text-sm font-medium text-paper/70 transition-[background-color,color,transform] duration-150 active:scale-[0.98] hover:bg-paper/10 hover:text-paper"
        >
          <Globe size={18} />
          Ver sitio público
        </Link>
        <nav className="flex flex-1 flex-col gap-1">{navItems}</nav>

        {TEST_MODE && (
          <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
              <FlaskConical size={14} />
              Modo de prueba
            </p>
            <p className="mt-1 text-[11px] text-amber-200/70">
              Datos guardados solo en este navegador, no en un servidor.
            </p>
            <button
              onClick={handleReiniciar}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-amber-400/15 px-2 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/25"
            >
              <Trash2 size={13} />
              Borrar todos los datos
            </button>
          </div>
        )}

        <div className="mt-6 border-t border-paper/10 pt-4">
          <p className="px-3 pb-2 text-xs text-paper/40">Sesión: {admin?.usuario}</p>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-paper/70 transition-[background-color,color,transform] duration-150 active:scale-[0.98] hover:bg-paper/10 hover:text-paper">
            <LogOut size={18} />
            Cerrar sesión
          </button>
          <p className="mt-4 px-3 text-[11px] text-paper/30">
            © {new Date().getFullYear()} Centro JAS Naranjo · por{" "}
            <a
              href="https://github.com/akamariano"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-paper/60"
            >
              Mariano Rac
            </a>
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="material-nav sticky top-0 z-30 flex items-center justify-between px-4 py-3 sm:hidden">
          <Logo iconClassName="h-8 w-auto" textClassName="text-sm" />
          <button onClick={() => setMenuAbierto((v) => !v)} className="btn-ghost !p-2">
            <Menu size={20} />
          </button>
        </header>

        {menuAbierto && (
          <div className="animate-materialize flex flex-col gap-1 bg-ink px-4 py-3 sm:hidden">
            <Link
              to="/"
              onClick={() => setMenuAbierto(false)}
              className="mb-1 flex items-center gap-3 rounded-lg border border-paper/15 px-3 py-2.5 text-sm font-medium text-paper/70 transition-[background-color,color,transform] duration-150 active:scale-[0.98] hover:bg-paper/10 hover:text-paper"
            >
              <Globe size={18} />
              Ver sitio público
            </Link>
            {navItems}
            {TEST_MODE && (
              <button
                onClick={handleReiniciar}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-300 transition-[background-color,color,transform] duration-150 active:scale-[0.98] hover:bg-amber-400/10"
              >
                <Trash2 size={18} />
                Borrar datos de prueba
              </button>
            )}
            <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-paper/70 transition-[background-color,color,transform] duration-150 active:scale-[0.98] hover:bg-paper/10 hover:text-paper">
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
