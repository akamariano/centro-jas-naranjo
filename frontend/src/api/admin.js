import { TEST_MODE } from "../testMode";
import * as remote from "./remote/admin";
import * as local from "./local/admin";

const impl = TEST_MODE ? local : remote;

// --- Usuarios ---
export const buscarUsuarios = impl.buscarUsuarios;
export const listarUsuarios = impl.listarUsuarios;
export const crearUsuarioAdmin = impl.crearUsuarioAdmin;
export const eliminarUsuarioAdmin = impl.eliminarUsuarioAdmin;

// --- Actividades ---
export const listarActividades = impl.listarActividades;
export const obtenerActividadActiva = impl.obtenerActividadActiva;
export const crearActividad = impl.crearActividad;
export const activarActividad = impl.activarActividad;
export const eliminarActividad = impl.eliminarActividad;
export const obtenerReporteActividad = impl.obtenerReporteActividad;
export const descargarReportePdf = impl.descargarReportePdf;

// --- Asistencias / Check-in ---
export const checkinPorQr = impl.checkinPorQr;
export const checkinManual = impl.checkinManual;
export const listarAsistencias = impl.listarAsistencias;

// --- Fotos de actividad ---
export const listarFotos = impl.listarFotos;
export const subirFoto = impl.subirFoto;
export const eliminarFoto = impl.eliminarFoto;

// --- Anuncios (admin) ---
export const listarAnunciosAdmin = impl.listarAnunciosAdmin;
export const crearAnuncio = impl.crearAnuncio;
export const actualizarAnuncio = impl.actualizarAnuncio;
export const eliminarAnuncio = impl.eliminarAnuncio;

// --- Imágenes de anuncio ---
export const listarImagenesAnuncio = impl.listarImagenesAnuncio;
export const subirImagenAnuncio = impl.subirImagenAnuncio;
export const agregarImagenAnuncioPorUrl = impl.agregarImagenAnuncioPorUrl;
export const eliminarImagenAnuncio = impl.eliminarImagenAnuncio;
