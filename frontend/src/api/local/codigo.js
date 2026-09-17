const PREFIJO = "JAS-";

function candidato() {
  const bytes = new Uint8Array(2);
  crypto.getRandomValues(bytes);
  return PREFIJO + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export const CODIGO_REGEX = /^JAS-[0-9A-F]{4}$/;

/** Genera un código corto único (reintenta ante colisiones, muy improbable). */
export function generarCodigoUnico(usuarios) {
  for (let intento = 0; intento < 20; intento += 1) {
    const c = candidato();
    if (!usuarios.some((u) => u.codigo_corto === c)) return c;
  }
  throw new Error("No se pudo generar un código único, intenta de nuevo.");
}
