import { Link } from "react-router-dom";
import { UserPlus, QrCode, Megaphone } from "lucide-react";
import Logo from "../../components/layout/Logo.jsx";
import ContactoInstagramButton from "../../components/layout/ContactoInstagramButton.jsx";

export default function HomePage() {
  return (
    <div className="animate-materialize flex flex-col items-center gap-8 py-10 text-center">
      <Logo iconOnly variant="blanco" iconClassName="h-20 w-auto" />
      <div className="max-w-lg space-y-3">
        <h1 className="text-display text-paper">Centro JAS Naranjo</h1>
        <p className="text-paper/60">
          Regístrate una sola vez, guarda tu carnet con código QR y preséntalo en cada actividad.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
        <Link
          to="/registro"
          className="card flex flex-col items-center gap-3 transition-[border-color,transform] duration-150 active:scale-[0.97] hover:border-ink/30"
        >
          <UserPlus size={28} />
          <span className="text-sm font-medium">Registrarme</span>
        </Link>
        <Link
          to="/recuperar"
          className="card flex flex-col items-center gap-3 transition-[border-color,transform] duration-150 active:scale-[0.97] hover:border-ink/30"
        >
          <QrCode size={28} />
          <span className="text-sm font-medium">Recuperar mi QR</span>
        </Link>
        <Link
          to="/anuncios"
          className="card flex flex-col items-center gap-3 transition-[border-color,transform] duration-150 active:scale-[0.97] hover:border-ink/30"
        >
          <Megaphone size={28} />
          <span className="text-sm font-medium">Ver anuncios</span>
        </Link>
      </div>

      <ContactoInstagramButton className="max-w-2xl" />
    </div>
  );
}
