const { body, query, validationResult } = require("express-validator");
const knex = require("../db/knex");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { generarCodigoUnico } = require("../utils/codigo");

const CAMPOS_USUARIO = [
  "id",
  "codigo_corto",
  "nombre_completo",
  "correo",
  "telefono",
  "fecha_nacimiento",
  "estaca",
  "barrio",
  "es_miembro",
  "created_at",
];

const datosPersonalesValidators = [
  body("nombre_completo").trim().isLength({ min: 3, max: 150 }).withMessage("Nombre completo inválido."),
  body("correo").trim().isEmail().withMessage("Correo inválido.").normalizeEmail(),
  body("telefono")
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Teléfono inválido."),
  body("fecha_nacimiento")
    .isISO8601()
    .withMessage("Fecha de nacimiento inválida.")
    .bail()
    .custom((valor) => new Date(valor) <= new Date())
    .withMessage("La fecha de nacimiento no puede ser futura."),
  body("estaca").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body("barrio").optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body("es_miembro").optional().isBoolean().toBoolean(),
];

// El registro público y la creación desde el admin piden exactamente los mismos datos.
const registroValidators = datosPersonalesValidators;
const crearAdminValidators = datosPersonalesValidators;

const recuperarValidators = [
  body("nombre_completo").trim().isLength({ min: 3, max: 150 }).withMessage("Nombre completo inválido."),
  body("fecha_nacimiento").isISO8601().withMessage("Fecha de nacimiento inválida."),
  body("correo").trim().isEmail().withMessage("Correo inválido.").normalizeEmail(),
];

const buscarValidators = [
  query("q").trim().isLength({ min: 2, max: 100 }).withMessage("Escribe al menos 2 caracteres."),
];

const listarValidators = [query("q").optional({ checkFalsy: true }).trim().isLength({ max: 100 })];

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

function datosPersonales(req) {
  const { nombre_completo, correo, telefono, fecha_nacimiento, estaca, barrio, es_miembro } = req.body;
  return {
    nombre_completo,
    correo,
    telefono,
    fecha_nacimiento,
    estaca: estaca || null,
    barrio: barrio || null,
    es_miembro: Boolean(es_miembro),
  };
}

/** POST /api/public/registro — crea un asistente y devuelve su código para el carnet/QR. */
const registrar = asyncHandler(async (req, res) => {
  checkValidation(req);

  const usuario = await knex.transaction(async (trx) => {
    const codigo_corto = await generarCodigoUnico(trx);
    const [creado] = await trx("usuarios")
      .insert({ codigo_corto, ...datosPersonales(req) })
      .returning(CAMPOS_USUARIO);
    return creado;
  });

  res.status(201).json({ usuario });
});

/** POST /api/admin/usuarios — el admin registra un JAS directamente desde el panel. */
const crearAdmin = asyncHandler(async (req, res) => {
  checkValidation(req);

  const usuario = await knex.transaction(async (trx) => {
    const codigo_corto = await generarCodigoUnico(trx);
    const [creado] = await trx("usuarios")
      .insert({ codigo_corto, ...datosPersonales(req) })
      .returning(CAMPOS_USUARIO);
    return creado;
  });

  res.status(201).json({ usuario });
});

/** POST /api/public/recuperar — reemite el carnet validando nombre + fecha de nacimiento + correo. */
const recuperar = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { nombre_completo, fecha_nacimiento, correo } = req.body;

  const usuario = await knex("usuarios")
    .whereRaw("lower(nombre_completo) = lower(?)", [nombre_completo])
    .andWhere("fecha_nacimiento", fecha_nacimiento)
    .andWhereRaw("lower(correo) = lower(?)", [correo])
    .first(CAMPOS_USUARIO);

  // Respuesta genérica: no revela cuál de los tres datos no coincidió (evita enumeración)
  if (!usuario) {
    throw new ApiError(404, "No encontramos un carnet con esos datos. Verifica nombre, fecha de nacimiento y correo.");
  }

  res.json({ usuario });
});

/** GET /api/admin/usuarios/buscar?q= — búsqueda en tiempo real por nombre o código (check-in manual). */
const buscar = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { q } = req.query;
  const like = `%${q}%`;

  const usuarios = await knex("usuarios")
    .where((builder) => {
      builder.whereILike("nombre_completo", like).orWhereILike("codigo_corto", like);
    })
    .orderBy("nombre_completo", "asc")
    .limit(15)
    .select(["id", "codigo_corto", "nombre_completo", "estaca", "barrio", "es_miembro"]);

  res.json({ usuarios });
});

/** GET /api/admin/usuarios?q= — listado completo para "JAS - Registrados" (q filtra por nombre/código). */
const listar = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { q } = req.query;

  const usuarios = await knex("usuarios")
    .modify((builder) => {
      if (q) {
        const like = `%${q}%`;
        builder.where((b) => b.whereILike("nombre_completo", like).orWhereILike("codigo_corto", like));
      }
    })
    .orderBy("nombre_completo", "asc")
    .select(CAMPOS_USUARIO);

  res.json({ usuarios });
});

/** DELETE /api/admin/usuarios/:id — también elimina sus asistencias (ON DELETE CASCADE). */
const eliminar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const borrados = await knex("usuarios").where({ id }).del();
  if (!borrados) throw new ApiError(404, "Usuario no encontrado.");
  res.json({ ok: true });
});

module.exports = {
  registrar,
  recuperar,
  buscar,
  listar,
  crearAdmin,
  eliminar,
  registroValidators,
  recuperarValidators,
  buscarValidators,
  listarValidators,
  crearAdminValidators,
};
