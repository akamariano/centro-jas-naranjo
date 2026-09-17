const knex = require("../db/knex");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { MAX_FOTOS_REPORTE } = require("./reportesController");

/** GET /api/admin/actividades/:id/fotos */
const listar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fotos = await knex("fotos_actividad").where({ actividad_id: id }).orderBy("created_at", "desc");
  res.json({ fotos });
});

/**
 * Corta el intento de subida ANTES de que multer escriba el archivo a disco:
 * evita dejar imágenes huérfanas cuando ya se alcanzó el máximo por actividad.
 */
const verificarLimiteFotos = asyncHandler(async (req, _res, next) => {
  const { id } = req.params;
  const { total } = await knex("fotos_actividad").where({ actividad_id: id }).count("* as total").first();
  if (Number(total) >= MAX_FOTOS_REPORTE) {
    throw new ApiError(409, `Esta actividad ya alcanzó el máximo de ${MAX_FOTOS_REPORTE} fotos.`);
  }
  next();
});

/** POST /api/admin/actividades/:id/fotos — multipart/form-data, campo "foto". */
const subir = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) throw new ApiError(400, "Debes adjuntar una imagen.");

  const actividad = await knex("actividades").where({ id }).first();
  if (!actividad) throw new ApiError(404, "Actividad no encontrada.");

  const url = `/uploads/${req.file.filename}`;
  const [foto] = await knex("fotos_actividad")
    .insert({
      actividad_id: id,
      url,
      descripcion: req.body.descripcion || null,
    })
    .returning("*");

  res.status(201).json({ foto });
});

/** DELETE /api/admin/fotos/:id */
const eliminar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const borrados = await knex("fotos_actividad").where({ id }).del();
  if (!borrados) throw new ApiError(404, "Foto no encontrada.");
  res.json({ ok: true });
});

module.exports = { listar, subir, eliminar, verificarLimiteFotos };
