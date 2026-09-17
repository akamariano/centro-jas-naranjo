const { body, validationResult } = require("express-validator");
const knex = require("../db/knex");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const crearValidators = [
  body("nombre").trim().isLength({ min: 3, max: 150 }).withMessage("Nombre de actividad inválido."),
  body("descripcion").optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body("fecha").optional({ checkFalsy: true }).isISO8601().withMessage("Fecha inválida."),
];

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

/** POST /api/admin/actividades — crea una actividad y la marca automáticamente como activa. */
const crear = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { nombre, descripcion, fecha } = req.body;

  const actividad = await knex.transaction(async (trx) => {
    await trx("actividades").where({ activa: true }).update({ activa: false });
    const [creada] = await trx("actividades")
      .insert({
        nombre,
        descripcion: descripcion || null,
        ...(fecha ? { fecha } : {}),
        activa: true,
      })
      .returning("*");
    return creada;
  });

  res.status(201).json({ actividad });
});

/** GET /api/admin/actividades — lista todas las actividades (más recientes primero). */
const listar = asyncHandler(async (_req, res) => {
  const actividades = await knex("actividades").orderBy("created_at", "desc");
  res.json({ actividades });
});

/** GET /api/admin/actividades/activa — actividad actualmente receptora de asistencias. */
const obtenerActiva = asyncHandler(async (_req, res) => {
  const actividad = await knex("actividades").where({ activa: true }).first();
  if (!actividad) throw new ApiError(404, "No hay ninguna actividad activa.");
  res.json({ actividad });
});

/** PATCH /api/admin/actividades/:id/activar — reasigna manualmente cuál actividad recibe asistencias. */
const activar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const actividad = await knex.transaction(async (trx) => {
    const existe = await trx("actividades").where({ id }).first();
    if (!existe) throw new ApiError(404, "Actividad no encontrada.");

    await trx("actividades").where({ activa: true }).update({ activa: false });
    const [actualizada] = await trx("actividades").where({ id }).update({ activa: true }).returning("*");
    return actualizada;
  });

  res.json({ actividad });
});

/** DELETE /api/admin/actividades/:id */
const eliminar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const borrados = await knex("actividades").where({ id }).del();
  if (!borrados) throw new ApiError(404, "Actividad no encontrada.");
  res.json({ ok: true });
});

module.exports = { crear, listar, obtenerActiva, activar, eliminar, crearValidators };
