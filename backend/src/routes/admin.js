const { Router } = require("express");
const { requireAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const usuariosController = require("../controllers/usuariosController");
const actividadesController = require("../controllers/actividadesController");
const asistenciasController = require("../controllers/asistenciasController");
const anunciosController = require("../controllers/anunciosController");
const fotosController = require("../controllers/fotosController");
const reportesController = require("../controllers/reportesController");
const anuncioImagenesController = require("../controllers/anuncioImagenesController");

const router = Router();

// Todo lo que cuelga de /api/admin exige sesión de administrador
router.use(requireAdmin);

// Módulo 1 — Búsqueda de usuarios (Check-in manual)
router.get("/usuarios/buscar", usuariosController.buscarValidators, usuariosController.buscar);

// Módulo "JAS - Registrados": listado completo, alta y baja de usuarios desde el admin
router.get("/usuarios", usuariosController.listarValidators, usuariosController.listar);
router.post("/usuarios", usuariosController.crearAdminValidators, usuariosController.crearAdmin);
router.delete("/usuarios/:id", usuariosController.eliminar);

// Módulo 1 — Check-in híbrido (QR + manual)
router.post(
  "/asistencias/checkin-qr",
  asistenciasController.checkinQrValidators,
  asistenciasController.checkinQr
);
router.post(
  "/asistencias/checkin-manual",
  asistenciasController.checkinManualValidators,
  asistenciasController.checkinManual
);
router.get("/asistencias", asistenciasController.reporteValidators, asistenciasController.listar);

// Módulo 2 — Gestión de actividades (sistema de cola)
router.get("/actividades", actividadesController.listar);
router.get("/actividades/activa", actividadesController.obtenerActiva);
router.post("/actividades", actividadesController.crearValidators, actividadesController.crear);
router.patch("/actividades/:id/activar", actividadesController.activar);
router.delete("/actividades/:id", actividadesController.eliminar);

// Módulo 3 — Fotos de actividades (máx. 10 por actividad, ver verificarLimiteFotos)
router.get("/actividades/:id/fotos", fotosController.listar);
router.post(
  "/actividades/:id/fotos",
  fotosController.verificarLimiteFotos,
  upload.single("foto"),
  fotosController.subir
);
router.delete("/fotos/:id", fotosController.eliminar);

// Módulo 3 — Reporte de actividad (resumen + fotos), con descarga en PDF
router.get("/actividades/:id/reporte", reportesController.obtenerResumen);
router.get("/actividades/:id/reporte.pdf", reportesController.descargarPdf);

// Módulo 4 — Gestión de anuncios
router.get("/anuncios", anunciosController.listarTodos);
router.post("/anuncios", anunciosController.anuncioValidators, anunciosController.crear);
router.put("/anuncios/:id", anunciosController.anuncioValidators, anunciosController.actualizar);
router.delete("/anuncios/:id", anunciosController.eliminar);

// Módulo 4 — Imágenes de anuncio: archivo subido o URL externa, máx. 4 (ver verificarLimite)
router.get("/anuncios/:id/imagenes", anuncioImagenesController.listar);
router.post(
  "/anuncios/:id/imagenes",
  anuncioImagenesController.verificarLimite,
  upload.single("imagen"),
  anuncioImagenesController.subirArchivo
);
router.post(
  "/anuncios/:id/imagenes/url",
  anuncioImagenesController.verificarLimite,
  anuncioImagenesController.urlValidators,
  anuncioImagenesController.agregarPorUrl
);
router.delete("/anuncios/imagenes/:id", anuncioImagenesController.eliminar);

module.exports = router;
