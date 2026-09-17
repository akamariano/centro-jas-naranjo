/**
 * Formatea un string "YYYY-MM-DD" (columna DATE de PostgreSQL) para mostrarlo,
 * ej. dentro del PDF de reporte. Ver explicación completa en el equivalente
 * del frontend (frontend/src/utils/fecha.js): evita el desfase de un día que
 * causaría parsear el string como medianoche UTC.
 */
function formatearFecha(fechaISO, opciones = {}) {
  if (!fechaISO) return "";
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-GT", opciones);
}

module.exports = { formatearFecha };
