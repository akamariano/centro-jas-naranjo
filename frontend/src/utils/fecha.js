/**
 * Formatea un string "YYYY-MM-DD" (columna DATE de PostgreSQL) para mostrarlo.
 *
 * `new Date("YYYY-MM-DD")` lo interpreta como medianoche UTC; al formatearlo
 * después con la zona horaria local del navegador, la fecha puede correrse un
 * día hacia atrás (ej. "2026-09-14" se muestra como "13 de septiembre" en
 * cualquier huso horario con offset negativo). Construir el Date con
 * año/mes/día por separado lo evita, porque ese constructor sí usa la hora
 * local en vez de UTC.
 */
export function formatearFecha(fechaISO, opciones = {}) {
  if (!fechaISO) return "";
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-GT", opciones);
}
