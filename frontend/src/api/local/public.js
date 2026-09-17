import { cargar, guardar, uid, ahora } from "./db";
import { generarCodigoUnico } from "./codigo";
import { apiError } from "./errors";

const CAMPOS_USUARIO = (u) => ({
  id: u.id,
  codigo_corto: u.codigo_corto,
  nombre_completo: u.nombre_completo,
  correo: u.correo,
  telefono: u.telefono,
  fecha_nacimiento: u.fecha_nacimiento,
  estaca: u.estaca,
  barrio: u.barrio,
  es_miembro: u.es_miembro,
  created_at: u.created_at,
});

function validarDatosPersonales(datos) {
  if (!datos.nombre_completo || datos.nombre_completo.trim().length < 3) {
    throw apiError("Nombre completo inválido.");
  }
  if (!datos.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
    throw apiError("Correo inválido.");
  }
  if (!datos.telefono || !/^[0-9+\-\s()]{7,20}$/.test(datos.telefono.trim())) {
    throw apiError("Teléfono inválido.");
  }
  if (!datos.fecha_nacimiento || new Date(datos.fecha_nacimiento) > new Date()) {
    throw apiError("Fecha de nacimiento inválida.");
  }
}

export const registrarUsuario = async (datos) => {
  validarDatosPersonales(datos);
  const db = cargar();
  const usuario = {
    id: uid(),
    codigo_corto: generarCodigoUnico(db.usuarios),
    nombre_completo: datos.nombre_completo.trim(),
    correo: datos.correo.trim(),
    telefono: datos.telefono.trim(),
    fecha_nacimiento: datos.fecha_nacimiento,
    estaca: datos.estaca || null,
    barrio: datos.barrio || null,
    es_miembro: Boolean(datos.es_miembro),
    created_at: ahora(),
  };
  db.usuarios.push(usuario);
  guardar(db);
  return CAMPOS_USUARIO(usuario);
};

export const recuperarUsuario = async (datos) => {
  const db = cargar();
  const nombre = (datos.nombre_completo || "").trim().toLowerCase();
  const correo = (datos.correo || "").trim().toLowerCase();
  const encontrado = db.usuarios.find(
    (u) =>
      u.nombre_completo.toLowerCase() === nombre &&
      u.fecha_nacimiento === datos.fecha_nacimiento &&
      u.correo.toLowerCase() === correo
  );
  if (!encontrado) {
    throw apiError("No encontramos un carnet con esos datos. Verifica nombre, fecha de nacimiento y correo.");
  }
  return CAMPOS_USUARIO(encontrado);
};

export const obtenerAnunciosPublicos = async () => {
  const db = cargar();
  return db.anuncios
    .filter((a) => a.publicado)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((a) => ({
      id: a.id,
      titulo: a.titulo,
      contenido: a.contenido,
      created_at: a.created_at,
      imagenes: db.anuncioImagenes.filter((i) => i.anuncio_id === a.id),
    }));
};
