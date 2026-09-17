const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");

/**
 * Las imágenes subidas como archivo llegan como ruta relativa ("/uploads/...") en modo
 * remoto, o como data URL (modo de prueba local) — ambas se usan tal cual. Las de URL
 * externa ya son absolutas.
 */
export function resolverUrlImagen(url) {
  if (!url) return url;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
}
