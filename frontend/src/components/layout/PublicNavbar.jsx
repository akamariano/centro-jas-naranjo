import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Logo from "./Logo.jsx";

const links = [
  { to: "/", label: "Inicio", end: true },
  { to: "/registro", label: "Registro" },
  { to: "/recuperar", label: "Recuperar QR" },
  { to: "/anuncios", label: "Anuncios" },
];

// Vibrancy: sobre una superficie translúcida el texto tenue pierde legibilidad
// al cambiar el fondo detrás; un poco más de contraste que sobre una tarjeta
// blanca sólida lo compensa (texto-ink/65 en vez de /50).
const linkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-ink" : "text-ink/65 hover:text-ink"}`;

export default function PublicNavbar() {
  return (
    <header className="material-nav sticky top-0 z-30">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/" className="transition-transform active:scale-[0.97]">
          <Logo iconClassName="h-9 w-auto" />
        </NavLink>

        <div className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <NavLink to="/admin/login" className="btn-secondary !px-3 !py-2 text-xs">
          <ShieldCheck size={16} />
          <span className="hidden sm:inline">Administrador</span>
        </NavLink>
      </nav>

      <div className="flex items-center gap-4 overflow-x-auto border-t border-ink/10 px-4 py-2 sm:hidden">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
            {l.label}
          </NavLink>
        ))}
      </div>
    </header>
  );
}
