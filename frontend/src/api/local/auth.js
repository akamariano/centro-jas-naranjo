import { cargar, guardar } from "./db";
import { apiError } from "./errors";

// Solo para el modo de prueba local — no protege nada real, es un candado
// simbólico para que no cualquiera que abra el link toque los datos de prueba.
const TEST_PASSWORD = import.meta.env.VITE_TEST_PASSWORD || "jasnaranjo";

export const login = async (usuario, password) => {
  if (!usuario || !password) throw apiError("Usuario y contraseña son requeridos.");
  if (password !== TEST_PASSWORD) throw apiError("Credenciales inválidas.");
  const db = cargar();
  db.authed = true;
  db.adminUsuario = usuario;
  guardar(db);
  return { id: "local-admin", usuario };
};

export const logout = async () => {
  const db = cargar();
  db.authed = false;
  guardar(db);
  return { ok: true };
};

export const me = async () => {
  const db = cargar();
  if (!db.authed) throw apiError("No autenticado.");
  return { id: "local-admin", usuario: db.adminUsuario || "admin" };
};
