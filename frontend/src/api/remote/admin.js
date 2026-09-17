import apiClient from "../client";

// --- Usuarios ---
export const buscarUsuarios = (q) =>
  apiClient.get("/admin/usuarios/buscar", { params: { q } }).then((r) => r.data.usuarios);

export const listarUsuarios = (q) =>
  apiClient.get("/admin/usuarios", { params: q ? { q } : undefined }).then((r) => r.data.usuarios);

export const crearUsuarioAdmin = (datos) => apiClient.post("/admin/usuarios", datos).then((r) => r.data.usuario);

export const eliminarUsuarioAdmin = (id) => apiClient.delete(`/admin/usuarios/${id}`);

// --- Actividades ---
export const listarActividades = () =>
  apiClient.get("/admin/actividades").then((r) => r.data.actividades);

export const obtenerActividadActiva = () =>
  apiClient
    .get("/admin/actividades/activa")
    .then((r) => r.data.actividad)
    .catch(() => null);

export const crearActividad = (datos) =>
  apiClient.post("/admin/actividades", datos).then((r) => r.data.actividad);

export const activarActividad = (id) =>
  apiClient.patch(`/admin/actividades/${id}/activar`).then((r) => r.data.actividad);

export const eliminarActividad = (id) => apiClient.delete(`/admin/actividades/${id}`);

export const obtenerReporteActividad = (id) =>
  apiClient.get(`/admin/actividades/${id}/reporte`).then((r) => r.data);

export const descargarReportePdf = (id) =>
  apiClient.get(`/admin/actividades/${id}/reporte.pdf`, { responseType: "blob" }).then((r) => r.data);

// --- Asistencias / Check-in ---
export const checkinPorQr = (codigo) =>
  apiClient.post("/admin/asistencias/checkin-qr", { codigo }).then((r) => r.data);

export const checkinManual = (usuario_id) =>
  apiClient.post("/admin/asistencias/checkin-manual", { usuario_id }).then((r) => r.data);

export const listarAsistencias = (filtros) =>
  apiClient.get("/admin/asistencias", { params: filtros }).then((r) => r.data.asistencias);

// --- Fotos de actividad ---
export const listarFotos = (actividadId) =>
  apiClient.get(`/admin/actividades/${actividadId}/fotos`).then((r) => r.data.fotos);

export const subirFoto = (actividadId, file, descripcion) => {
  const formData = new FormData();
  formData.append("foto", file);
  if (descripcion) formData.append("descripcion", descripcion);
  return apiClient
    .post(`/admin/actividades/${actividadId}/fotos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data.foto);
};

export const eliminarFoto = (id) => apiClient.delete(`/admin/fotos/${id}`);

// --- Anuncios (admin) ---
export const listarAnunciosAdmin = () => apiClient.get("/admin/anuncios").then((r) => r.data.anuncios);

export const crearAnuncio = (datos) => apiClient.post("/admin/anuncios", datos).then((r) => r.data.anuncio);

export const actualizarAnuncio = (id, datos) =>
  apiClient.put(`/admin/anuncios/${id}`, datos).then((r) => r.data.anuncio);

export const eliminarAnuncio = (id) => apiClient.delete(`/admin/anuncios/${id}`);

// --- Imágenes de anuncio (archivo o URL, máx. 4) ---
export const listarImagenesAnuncio = (anuncioId) =>
  apiClient.get(`/admin/anuncios/${anuncioId}/imagenes`).then((r) => r.data.imagenes);

export const subirImagenAnuncio = (anuncioId, file) => {
  const formData = new FormData();
  formData.append("imagen", file);
  return apiClient
    .post(`/admin/anuncios/${anuncioId}/imagenes`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data.imagen);
};

export const agregarImagenAnuncioPorUrl = (anuncioId, url) =>
  apiClient.post(`/admin/anuncios/${anuncioId}/imagenes/url`, { url }).then((r) => r.data.imagen);

export const eliminarImagenAnuncio = (id) => apiClient.delete(`/admin/anuncios/imagenes/${id}`);
