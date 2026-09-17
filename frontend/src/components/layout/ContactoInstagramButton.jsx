import { Instagram } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/cjngt/";

/** CTA grande hacia el Instagram del centro — reutilizado en Inicio y Anuncios. */
export default function ContactoInstagramButton({ className = "" }) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-primary w-full !gap-4 !rounded-2xl !py-6 ${className}`}
    >
      <Instagram size={28} className="shrink-0" />
      <span className="flex flex-col items-start leading-tight">
        <span className="text-base font-semibold sm:text-lg">Contáctanos</span>
        <span className="text-xs font-normal text-paper/60 sm:text-sm">@cjngt en Instagram</span>
      </span>
    </a>
  );
}
