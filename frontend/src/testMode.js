/**
 * Modo de prueba: sin backend, sin base de datos. Todo se guarda en
 * localStorage del navegador. Se activa fijando VITE_APP_MODE=local
 * al construir el frontend (ver frontend/.env.example).
 */
export const TEST_MODE = import.meta.env.VITE_APP_MODE === "local";

export const TEST_DB_KEY = "cjn_test_db_v1";

/** Borra todos los datos de prueba (usuarios, actividades, asistencias, anuncios, fotos). */
export function reiniciarDatosPrueba() {
  localStorage.removeItem(TEST_DB_KEY);
  window.location.href = "/";
}
