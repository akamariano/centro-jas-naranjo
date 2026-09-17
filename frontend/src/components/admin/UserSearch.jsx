import { useEffect, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { buscarUsuarios } from "../../api/admin";
import { useDebounce } from "../../hooks/useDebounce";
import { getErrorMessage } from "../../api/client";

/** Modo B: buscador en tiempo real por Nombre o ID (código corto) para check-in manual. */
export default function UserSearch({ onSeleccionar, disabled }) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const consulta = useDebounce(texto, 300);

  useEffect(() => {
    if (consulta.trim().length < 2) {
      setResultados([]);
      return;
    }
    let cancelado = false;
    setBuscando(true);
    setError("");
    buscarUsuarios(consulta.trim())
      .then((usuarios) => !cancelado && setResultados(usuarios))
      .catch((err) => !cancelado && setError(getErrorMessage(err, "No se pudo buscar.")))
      .finally(() => !cancelado && setBuscando(false));
    return () => {
      cancelado = true;
    };
  }, [consulta]);

  const seleccionar = (usuario) => {
    onSeleccionar(usuario);
    setTexto("");
    setResultados([]);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Buscar por nombre o ID (ej. JAS-8F32)"
          value={texto}
          disabled={disabled}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      {buscando && <p className="mt-2 text-xs text-paper/40">Buscando…</p>}
      {error && <p className="mt-2 text-xs font-medium text-paper">{error}</p>}

      {resultados.length > 0 && (
        <ul className="animate-materialize absolute z-20 mt-2 max-h-72 w-full origin-top overflow-auto rounded-xl border border-ink/10 bg-paper shadow-card">
          {resultados.map((usuario) => (
            <li key={usuario.id}>
              <button
                type="button"
                onClick={() => seleccionar(usuario)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-[background-color,transform] duration-150 active:scale-[0.98] hover:bg-paper-100"
              >
                <UserPlus size={16} className="shrink-0 text-ink/40" />
                <span className="flex-1">
                  <span className="font-medium text-ink">{usuario.nombre_completo}</span>
                  {usuario.barrio && <span className="text-ink/50"> · {usuario.barrio}</span>}
                  <span className="block font-mono text-xs text-ink/40">{usuario.codigo_corto}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!buscando && consulta.trim().length >= 2 && resultados.length === 0 && (
        <p className="mt-2 text-xs text-paper/40">Sin coincidencias.</p>
      )}
    </div>
  );
}
