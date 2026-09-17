const { body, query, validationResult } = require("express-validator");
const knex = require("../db/knex");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { CODIGO_REGEX } = require("../utils/codigo");

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

const checkinQrValidators = [
  body("codigo")
    .trim()
    .toUpperCase()
    .matches(CODIGO_REGEX)
    .withMessage("Código de QR inválido."),
];

const checkinManualValidators = [
  body("usuario_id").isUUID().withMessage("Usuario inválido."),
];

const reporteValidators = [
  query("actividad_id").isUUID().withMessage("Selecciona una actividad válida."),
  query("estaca").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  query("barrio").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  query("es_miembro").optional().isBoolean().toBoolean(),
];

/** Registra la asistencia de un usuario ya resuelto a la actividad activa. */
async function registrarAsistencia({ usuario, metodo, adminId }) {
  const actividad = await knex("actividades").where({ activa: true }).first();
  if (!actividad) throw new ApiError(409, "No hay ninguna actividad activa en este momento.");

  const yaRegistrado = await knex("asistencias")
    .where({ usuario_id: usuario.id, actividad_id: actividad.id })
    .first();
  if (yaRegistrado) {
    throw new ApiError(409, `${usuario.nombre_completo} ya tiene asistencia registrada en "${actividad.nombre}".`);
  }

  await knex("asistencias").insert({
    usuario_id: usuario.id,
    actividad_id: actividad.id,
    metodo,
    registrado_por: adminId,
  });

  return actividad;
}

/** POST /api/admin/asistencias/checkin-qr — Modo A: escaneo de cámara. */
const checkinQr = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { codigo } = req.body;

  const usuario = await knex("usuarios").where({ codigo_corto: codigo }).first();
  if (!usuario) throw new ApiError(404, "El código escaneado no corresponde a ningún asistente registrado.");

  const actividad = await registrarAsistencia({ usuario, metodo: "qr", adminId: req.admin.id });
  res.status(201).json({ usuario, actividad });
});

/** POST /api/admin/asistencias/checkin-manual — Modo B: selección desde el buscador. */
const checkinManual = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { usuario_id } = req.body;

  const usuario = await knex("usuarios").where({ id: usuario_id }).first();
  if (!usuario) throw new ApiError(404, "Usuario no encontrado.");

  const actividad = await registrarAsistencia({ usuario, metodo: "manual", adminId: req.admin.id });
  res.status(201).json({ usuario, actividad });
});

/** GET /api/admin/asistencias?actividad_id=&estaca=&barrio=&es_miembro= — reportes filtrables. */
const listar = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { actividad_id, estaca, barrio, es_miembro } = req.query;

  const asistencias = await knex("asistencias")
    .join("usuarios", "usuarios.id", "asistencias.usuario_id")
    .where("asistencias.actividad_id", actividad_id)
    .modify((builder) => {
      if (estaca) builder.whereILike("usuarios.estaca", `%${estaca}%`);
      if (barrio) builder.whereILike("usuarios.barrio", `%${barrio}%`);
      if (es_miembro !== undefined) builder.where("usuarios.es_miembro", es_miembro);
    })
    .orderBy("asistencias.created_at", "desc")
    .select(
      "asistencias.id",
      "asistencias.metodo",
      "asistencias.created_at",
      "usuarios.nombre_completo",
      "usuarios.codigo_corto",
      "usuarios.estaca",
      "usuarios.barrio",
      "usuarios.es_miembro"
    );

  res.json({ asistencias });
});

module.exports = {
  checkinQr,
  checkinManual,
  listar,
  checkinQrValidators,
  checkinManualValidators,
  reporteValidators,
};
