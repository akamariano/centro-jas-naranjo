import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { obtenerAnunciosPublicos } from "../../api/public";
import ContactoInstagramButton from "../../components/layout/ContactoInstagramButton.jsx";
import { resolverUrlImagen } from "../../utils/imagenes";

function GaleriaAnuncio({ imagenes, titulo }) {
  if (!imagenes || imagenes.length === 0) return null;

  if (imagenes.length === 1) {
    return (
      <img
        src={resolverUrlImagen(imagenes[0].url)}
        alt={titulo}
        className="mb-4 aspect-video w-full rounded-xl object-cover"
      />
    );
  }

  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
      {imagenes.map((img) => (
        <img
          key={img.id}
          src={resolverUrlImagen(img.url)}
          alt={titulo}
          className="aspect-square w-full rounded-xl object-cover"
        />
      ))}
    </div>
  );
}

export default function AnunciosPage() {
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerAnunciosPublicos()
      .then(setAnuncios)
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="text-title mb-6 text-paper">Tablón de anuncios</h1>

      <ContactoInstagramButton className="mb-8" />

      {cargando && <p className="text-sm text-paper/40">Cargando…</p>}
      {!cargando && anuncios.length === 0 && <p className="text-sm text-paper/40">No hay anuncios por el momento.</p>}

      <div className="space-y-4">
        {anuncios.map((a, i) => (
          <article
            key={a.id}
            className="card animate-materialize"
            style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}
          >
            <GaleriaAnuncio imagenes={a.imagenes} titulo={a.titulo} />
            <div className="mb-2 flex items-center gap-2 text-ink/40">
              <Megaphone size={16} />
              <time className="text-xs">{new Date(a.created_at).toLocaleDateString("es-GT", { dateStyle: "long" })}</time>
            </div>
            <h2 className="mb-1 font-semibold text-ink">{a.titulo}</h2>
            <p className="whitespace-pre-line text-sm text-ink/70">{a.contenido}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
