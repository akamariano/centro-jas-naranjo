import { TEST_DB_KEY } from "../../testMode";

function vacia() {
  return {
    authed: false,
    adminUsuario: null,
    usuarios: [],
    actividades: [],
    asistencias: [],
    fotos: [],
    anuncios: [],
    anuncioImagenes: [],
  };
}

export function cargar() {
  try {
    const raw = localStorage.getItem(TEST_DB_KEY);
    if (!raw) return vacia();
    return { ...vacia(), ...JSON.parse(raw) };
  } catch {
    return vacia();
  }
}

export function guardar(db) {
  try {
    localStorage.setItem(TEST_DB_KEY, JSON.stringify(db));
  } catch (err) {
    throw new Error(
      "No se pudo guardar: el almacenamiento local del navegador está lleno. Elimina fotos o usuarios de prueba e intenta de nuevo."
    );
  }
}

export function uid() {
  return crypto.randomUUID();
}

export function ahora() {
  return new Date().toISOString();
}
