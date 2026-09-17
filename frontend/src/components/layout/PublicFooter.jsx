import { Github, Instagram, Mail } from "lucide-react";

const ENLACES_DESARROLLADOR = [
  { href: "https://github.com/akamariano", icon: Github, label: "GitHub" },
  { href: "https://www.instagram.com/rrnoguera/", icon: Instagram, label: "Instagram" },
  // mailto: depende de que el dispositivo tenga una app de correo configurada
  // por defecto — si no la tiene, el clic no hace nada. El compositor web de
  // Gmail funciona en cualquier navegador sin esa dependencia.
  {
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=marianoracnoguera@gmail.com&su=Contacto%20desde%20Centro%20JAS%20Naranjo",
    icon: Mail,
    label: "Email",
  },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-paper/10 py-5 text-center text-[11px] text-paper/40">
      <p>
        © {new Date().getFullYear()} Centro JAS Naranjo · Desarrollado por{" "}
        <a
          href="https://github.com/akamariano"
          target="_blank"
          rel="noopener noreferrer"
          className="text-paper/60 transition-colors hover:text-paper"
        >
          Mariano Rac
        </a>
      </p>
      <div className="mt-1.5 flex items-center justify-center gap-3">
        {ENLACES_DESARROLLADOR.map(({ href, icon: Icon, label }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            title={label}
            className="inline-flex items-center gap-1 text-paper/40 transition-colors hover:text-paper"
          >
            <Icon size={12} />
            {label}
          </a>
        ))}
      </div>
    </footer>
  );
}
