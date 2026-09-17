import { cargar, guardar, uid, ahora } from "./db";
import { generarCodigoUnico } from "./codigo";
import { archivoADataUrl } from "./imagenUtil";
import { apiError } from "./errors";

const MAX_FOTOS_REPORTE = 10;
const MAX_IMAGENES_ANUNCIO = 4;

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
  if (!datos.nombre_completo || datos.nombre_completo.trim().length < 3) throw apiError("Nombre completo inválido.");
  if (!datos.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) throw apiError("Correo inválido.");
  if (!datos.telefono || !/^[0-9+\-\s()]{7,20}$/.test(datos.telefono.trim())) throw apiError("Teléfono inválido.");
  if (!datos.fecha_nacimiento || new Date(datos.fecha_nacimiento) > new Date()) {
    throw apiError("Fecha de nacimiento inválida.");
  }
}

// --- Usuarios ---
export const buscarUsuarios = async (q) => {
  const db = cargar();
  const like = (q || "").toLowerCase();
  return db.usuarios
    .filter((u) => u.nombre_completo.toLowerCase().includes(like) || u.codigo_corto.toLowerCase().includes(like))
    .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))
    .slice(0, 15)
    .map((u) => ({
      id: u.id,
      codigo_corto: u.codigo_corto,
      nombre_completo: u.nombre_completo,
      estaca: u.estaca,
      barrio: u.barrio,
      es_miembro: u.es_miembro,
    }));
};

export const listarUsuarios = async (q) => {
  const db = cargar();
  let lista = db.usuarios;
  if (q) {
    const like = q.toLowerCase();
    lista = lista.filter((u) => u.nombre_completo.toLowerCase().includes(like) || u.codigo_corto.toLowerCase().includes(like));
  }
  return [...lista].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)).map(CAMPOS_USUARIO);
};

export const crearUsuarioAdmin = async (datos) => {
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

export const eliminarUsuarioAdmin = async (id) => {
  const db = cargar();
  const antes = db.usuarios.length;
  db.usuarios = db.usuarios.filter((u) => u.id !== id);
  db.asistencias = db.asistencias.filter((a) => a.usuario_id !== id); // ON DELETE CASCADE
  if (db.usuarios.length === antes) throw apiError("Usuario no encontrado.");
  guardar(db);
  return { ok: true };
};

// --- Actividades ---
export const listarActividades = async () => {
  const db = cargar();
  return [...db.actividades].sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const obtenerActividadActiva = async () => {
  const db = cargar();
  return db.actividades.find((a) => a.activa) || null;
};

export const crearActividad = async (datos) => {
  if (!datos.nombre || datos.nombre.trim().length < 3) throw apiError("Nombre de actividad inválido.");
  const db = cargar();
  db.actividades.forEach((a) => {
    a.activa = false;
  });
  const actividad = {
    id: uid(),
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion || null,
    fecha: datos.fecha || null,
    activa: true,
    created_at: ahora(),
  };
  db.actividades.push(actividad);
  guardar(db);
  return actividad;
};

export const activarActividad = async (id) => {
  const db = cargar();
  const actividad = db.actividades.find((a) => a.id === id);
  if (!actividad) throw apiError("Actividad no encontrada.");
  db.actividades.forEach((a) => {
    a.activa = false;
  });
  actividad.activa = true;
  guardar(db);
  return actividad;
};

export const eliminarActividad = async (id) => {
  const db = cargar();
  const antes = db.actividades.length;
  db.actividades = db.actividades.filter((a) => a.id !== id);
  db.asistencias = db.asistencias.filter((a) => a.actividad_id !== id);
  db.fotos = db.fotos.filter((f) => f.actividad_id !== id);
  if (db.actividades.length === antes) throw apiError("Actividad no encontrada.");
  guardar(db);
  return { ok: true };
};

export const obtenerReporteActividad = async (id) => {
  const db = cargar();
  const actividad = db.actividades.find((a) => a.id === id);
  if (!actividad) throw apiError("Actividad no encontrada.");

  const conUsuario = db.asistencias
    .filter((a) => a.actividad_id === id)
    .map((a) => ({ ...a, usuario: db.usuarios.find((u) => u.id === a.usuario_id) }))
    .filter((a) => a.usuario);

  const miembros = conUsuario.filter((a) => a.usuario.es_miembro).length;
  const noMiembros = conUsuario.length - miembros;

  const conteoEstaca = {};
  for (const a of conUsuario) {
    if (a.usuario.estaca) conteoEstaca[a.usuario.estaca] = (conteoEstaca[a.usuario.estaca] || 0) + 1;
  }
  let estacaTop = null;
  let max = 0;
  for (const [estaca, total] of Object.entries(conteoEstaca)) {
    if (total > max) {
      max = total;
      estacaTop = estaca;
    }
  }

  const fotos = db.fotos
    .filter((f) => f.actividad_id === id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, MAX_FOTOS_REPORTE);

  return {
    actividad,
    resumen: { total: conUsuario.length, miembros, no_miembros: noMiembros, estaca_mas_frecuentada: estacaTop },
    fotos,
  };
};

export const descargarReportePdf = async () => {
  throw apiError("La descarga de PDF no está disponible en el modo de prueba local.");
};

// --- Asistencias / Check-in ---
function registrarAsistenciaLocal(db, usuario, metodo) {
  const actividad = db.actividades.find((a) => a.activa);
  if (!actividad) throw apiError("No hay ninguna actividad activa en este momento.");

  const yaRegistrado = db.asistencias.find((a) => a.usuario_id === usuario.id && a.actividad_id === actividad.id);
  if (yaRegistrado) {
    throw apiError(`${usuario.nombre_completo} ya tiene asistencia registrada en "${actividad.nombre}".`);
  }

  db.asistencias.push({ id: uid(), usuario_id: usuario.id, actividad_id: actividad.id, metodo, created_at: ahora() });
  return actividad;
}

export const checkinPorQr = async (codigo) => {
  const db = cargar();
  const usuario = db.usuarios.find((u) => u.codigo_corto === (codigo || "").toUpperCase());
  if (!usuario) throw apiError("El código escaneado no corresponde a ningún asistente registrado.");
  const actividad = registrarAsistenciaLocal(db, usuario, "qr");
  guardar(db);
  return { usuario, actividad };
};

export const checkinManual = async (usuario_id) => {
  const db = cargar();
  const usuario = db.usuarios.find((u) => u.id === usuario_id);
  if (!usuario) throw apiError("Usuario no encontrado.");
  const actividad = registrarAsistenciaLocal(db, usuario, "manual");
  guardar(db);
  return { usuario, actividad };
};

export const listarAsistencias = async (filtros = {}) => {
  const db = cargar();
  const conUsuario = db.asistencias
    .filter((a) => a.actividad_id === filtros.actividad_id)
    .map((a) => {
      const u = db.usuarios.find((usr) => usr.id === a.usuario_id);
      return u
        ? {
            id: a.id,
            metodo: a.metodo,
            created_at: a.created_at,
            nombre_completo: u.nombre_completo,
            codigo_corto: u.codigo_corto,
            estaca: u.estaca,
            barrio: u.barrio,
            es_miembro: u.es_miembro,
          }
        : null;
    })
    .filter(Boolean);

  return conUsuario
    .filter((a) => !filtros.estaca || (a.estaca || "").toLowerCase().includes(filtros.estaca.toLowerCase()))
    .filter((a) => !filtros.barrio || (a.barrio || "").toLowerCase().includes(filtros.barrio.toLowerCase()))
    .filter((a) => filtros.es_miembro === undefined || filtros.es_miembro === "" || String(a.es_miembro) === String(filtros.es_miembro))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
};

// --- Fotos de actividad ---
export const listarFotos = async (actividadId) => {
  const db = cargar();
  return db.fotos.filter((f) => f.actividad_id === actividadId).sort((a, b) => b.created_at.localeCompare(a.created_at));
};

export const subirFoto = async (actividadId, file, descripcion) => {
  const db = cargar();
  const actividad = db.actividades.find((a) => a.id === actividadId);
  if (!actividad) throw apiError("Actividad no encontrada.");

  const total = db.fotos.filter((f) => f.actividad_id === actividadId).length;
  if (total >= MAX_FOTOS_REPORTE) throw apiError(`Esta actividad ya alcanzó el máximo de ${MAX_FOTOS_REPORTE} fotos.`);

  const url = await archivoADataUrl(file);
  const foto = { id: uid(), actividad_id: actividadId, url, descripcion: descripcion || null, created_at: ahora() };
  db.fotos.push(foto);
  guardar(db);
  return foto;
};

export const eliminarFoto = async (id) => {
  const db = cargar();
  const antes = db.fotos.length;
  db.fotos = db.fotos.filter((f) => f.id !== id);
  if (db.fotos.length === antes) throw apiError("Foto no encontrada.");
  guardar(db);
  return { ok: true };
};

// --- Anuncios (admin) ---
export const listarAnunciosAdmin = async () => {
  const db = cargar();
  return [...db.anuncios]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((a) => ({ ...a, imagenes: db.anuncioImagenes.filter((i) => i.anuncio_id === a.id) }));
};

export const crearAnuncio = async (datos) => {
  if (!datos.titulo || datos.titulo.trim().length < 3) throw apiError("Título inválido.");
  if (!datos.contenido || datos.contenido.trim().length < 3) throw apiError("Contenido inválido.");
  const db = cargar();
  const anuncio = {
    id: uid(),
    titulo: datos.titulo.trim(),
    contenido: datos.contenido.trim(),
    publicado: datos.publicado ?? true,
    created_at: ahora(),
    updated_at: ahora(),
  };
  db.anuncios.push(anuncio);
  guardar(db);
  return { ...anuncio, imagenes: [] };
};

export const actualizarAnuncio = async (id, datos) => {
  const db = cargar();
  const anuncio = db.anuncios.find((a) => a.id === id);
  if (!anuncio) throw apiError("Anuncio no encontrado.");
  if (datos.titulo) anuncio.titulo = datos.titulo.trim();
  if (datos.contenido) anuncio.contenido = datos.contenido.trim();
  anuncio.publicado = datos.publicado ?? true;
  anuncio.updated_at = ahora();
  guardar(db);
  return { ...anuncio, imagenes: db.anuncioImagenes.filter((i) => i.anuncio_id === id) };
};

export const eliminarAnuncio = async (id) => {
  const db = cargar();
  const antes = db.anuncios.length;
  db.anuncios = db.anuncios.filter((a) => a.id !== id);
  db.anuncioImagenes = db.anuncioImagenes.filter((i) => i.anuncio_id !== id); // ON DELETE CASCADE
  if (db.anuncios.length === antes) throw apiError("Anuncio no encontrado.");
  guardar(db);
  return { ok: true };
};

// --- Imágenes de anuncio (archivo o URL, máx. 4) ---
export const listarImagenesAnuncio = async (anuncioId) => {
  const db = cargar();
  return db.anuncioImagenes.filter((i) => i.anuncio_id === anuncioId).sort((a, b) => a.created_at.localeCompare(b.created_at));
};

function verificarLimiteImagenes(db, anuncioId) {
  const anuncio = db.anuncios.find((a) => a.id === anuncioId);
  if (!anuncio) throw apiError("Anuncio no encontrado.");
  const total = db.anuncioImagenes.filter((i) => i.anuncio_id === anuncioId).length;
  if (total >= MAX_IMAGENES_ANUNCIO) throw apiError(`Este anuncio ya alcanzó el máximo de ${MAX_IMAGENES_ANUNCIO} imágenes.`);
}

export const subirImagenAnuncio = async (anuncioId, file) => {
  const db = cargar();
  verificarLimiteImagenes(db, anuncioId);
  const url = await archivoADataUrl(file);
  const imagen = { id: uid(), anuncio_id: anuncioId, url, origen: "archivo", created_at: ahora() };
  db.anuncioImagenes.push(imagen);
  guardar(db);
  return imagen;
};

export const agregarImagenAnuncioPorUrl = async (anuncioId, url) => {
  if (!/^https?:\/\//i.test(url || "")) {
    throw apiError("Ingresa una URL de imagen válida (con http:// o https://).");
  }
  const db = cargar();
  verificarLimiteImagenes(db, anuncioId);
  const imagen = { id: uid(), anuncio_id: anuncioId, url, origen: "url", created_at: ahora() };
  db.anuncioImagenes.push(imagen);
  guardar(db);
  return imagen;
};

export const eliminarImagenAnuncio = async (id) => {
  const db = cargar();
  const antes = db.anuncioImagenes.length;
  db.anuncioImagenes = db.anuncioImagenes.filter((i) => i.id !== id);
  if (db.anuncioImagenes.length === antes) throw apiError("Imagen no encontrada.");
  guardar(db);
  return { ok: true };
};
