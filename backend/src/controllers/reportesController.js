const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const knex = require("../db/knex");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { formatearFecha } = require("../utils/fecha");

const MAX_FOTOS_REPORTE = 10;

/** Reúne actividad + resumen de asistencia + fotos (máx. 10) para el reporte. */
async function construirReporte(actividadId) {
  const actividad = await knex("actividades").where({ id: actividadId }).first();
  if (!actividad) throw new ApiError(404, "Actividad no encontrada.");

  const { total } = await knex("asistencias")
    .where({ actividad_id: actividadId })
    .count("* as total")
    .first();

  const { total: miembros } = await knex("asistencias")
    .join("usuarios", "usuarios.id", "asistencias.usuario_id")
    .where({ "asistencias.actividad_id": actividadId, "usuarios.es_miembro": true })
    .count("* as total")
    .first();

  const { total: noMiembros } = await knex("asistencias")
    .join("usuarios", "usuarios.id", "asistencias.usuario_id")
    .where({ "asistencias.actividad_id": actividadId, "usuarios.es_miembro": false })
    .count("* as total")
    .first();

  const estacaTop = await knex("asistencias")
    .join("usuarios", "usuarios.id", "asistencias.usuario_id")
    .where("asistencias.actividad_id", actividadId)
    .whereNotNull("usuarios.estaca")
    .andWhere("usuarios.estaca", "<>", "")
    .groupBy("usuarios.estaca")
    .orderBy("total", "desc")
    .select("usuarios.estaca")
    .count("* as total")
    .first();

  const fotos = await knex("fotos_actividad")
    .where({ actividad_id: actividadId })
    .orderBy("created_at", "asc")
    .limit(MAX_FOTOS_REPORTE);

  return {
    actividad,
    resumen: {
      total: Number(total),
      miembros: Number(miembros),
      no_miembros: Number(noMiembros),
      estaca_mas_frecuentada: estacaTop?.estaca || null,
    },
    fotos,
  };
}

/** GET /api/admin/actividades/:id/reporte — vista previa (JSON) del reporte. */
const obtenerResumen = asyncHandler(async (req, res) => {
  const reporte = await construirReporte(req.params.id);
  res.json(reporte);
});

/** GET /api/admin/actividades/:id/reporte.pdf — mismo reporte, como PDF descargable. */
const descargarPdf = asyncHandler(async (req, res) => {
  const { actividad, resumen, fotos } = await construirReporte(req.params.id);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const nombreArchivo = `reporte-${actividad.nombre.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
  doc.pipe(res);

  // --- Encabezado (monocromático: solo negro sobre blanco) ---
  doc.fontSize(10).fillColor("#666666").text("CENTRO JAS NARANJO", { characterSpacing: 1.5 });
  doc.moveDown(0.3);
  doc.fontSize(20).fillColor("#0a0a0a").font("Helvetica-Bold").text(actividad.nombre);
  doc
    .fontSize(10)
    .fillColor("#666666")
    .font("Helvetica")
    .text(formatearFecha(actividad.fecha, { dateStyle: "long" }));

  if (actividad.descripcion) {
    doc.moveDown(0.6);
    doc.fontSize(11).fillColor("#262626").text(actividad.descripcion, { width: 495 });
  }

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e5e5e5").stroke();
  doc.moveDown(1);

  // --- Sección 1: Resumen ---
  doc.fontSize(14).fillColor("#0a0a0a").font("Helvetica-Bold").text("Resumen de asistencia");
  doc.moveDown(0.5);

  const filas = [
    ["Asistencia total", String(resumen.total)],
    ["Miembros", String(resumen.miembros)],
    ["No miembros", String(resumen.no_miembros)],
    ["Estaca más frecuentada", resumen.estaca_mas_frecuentada || "—"],
  ];

  const colEtiquetaX = 50;
  const colValorX = 300;
  filas.forEach(([etiqueta, valor]) => {
    const y = doc.y;
    doc.fontSize(11).font("Helvetica").fillColor("#666666").text(etiqueta, colEtiquetaX, y, { width: 230 });
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#0a0a0a").text(valor, colValorX, y, { width: 195 });
    doc.moveDown(0.6);
  });

  // --- Sección 2: Fotos ---
  if (fotos.length > 0) {
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e5e5e5").stroke();
    doc.moveDown(1);
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#0a0a0a").text(`Fotos de la actividad (${fotos.length})`);
    doc.moveDown(0.5);

    const columnas = 2;
    const anchoImagen = 230;
    const altoImagen = 160;
    const espacio = 15;
    let col = 0;
    let filaInicioY = doc.y;

    fotos.forEach((foto) => {
      const rutaArchivo = path.join(env.uploadsDir, path.basename(foto.url));
      const x = 50 + col * (anchoImagen + espacio);

      if (filaInicioY + altoImagen > 780) {
        doc.addPage();
        filaInicioY = 50;
      }

      if (fs.existsSync(rutaArchivo)) {
        try {
          doc.image(rutaArchivo, x, filaInicioY, { fit: [anchoImagen, altoImagen], align: "center" });
        } catch (_err) {
          doc.fontSize(9).fillColor("#999999").text("(No se pudo cargar la imagen)", x, filaInicioY + altoImagen / 2);
        }
      } else {
        doc.fontSize(9).fillColor("#999999").text("(Imagen no disponible)", x, filaInicioY + altoImagen / 2);
      }

      col += 1;
      if (col >= columnas) {
        col = 0;
        filaInicioY += altoImagen + espacio;
      }
    });
  }

  doc.end();
});

module.exports = { obtenerResumen, descargarPdf, MAX_FOTOS_REPORTE };
