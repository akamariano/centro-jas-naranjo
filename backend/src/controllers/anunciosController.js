const { body, validationResult } = require("express-validator");
const knex = require("../db/knex");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const anuncioValidators = [
  body("titulo").trim().isLength({ min: 3, max: 150 }).withMessage("Título inválido."),
  body("contenido").trim().isLength({ min: 3, max: 5000 }).withMessage("Contenido inválido."),
  body("publicado").optional().isBoolean().toBoolean(),
];

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

/** Adjunta `imagenes: [...]` a cada anuncio en una sola consulta extra (evita N+1). */
async function conImagenes(anuncios) {
  if (anuncios.length === 0) return anuncios;

  const ids = anuncios.map((a) => a.id);
  const imagenes = await knex("anuncio_imagenes").whereIn("anuncio_id", ids).orderBy("created_at", "asc");

  const porAnuncio = new Map();
  for (const img of imagenes) {
    if (!porAnuncio.has(img.anuncio_id)) porAnuncio.set(img.anuncio_id, []);
    porAnuncio.get(img.anuncio_id).push(img);
  }

  return anuncios.map((a) => ({ ...a, imagenes: porAnuncio.get(a.id) || [] }));
}

/** GET /api/public/anuncios — tablón público, solo anuncios publicados. */
const listarPublicos = asyncHandler(async (_req, res) => {
  const anuncios = await knex("anuncios")
    .where({ publicado: true })
    .orderBy("created_at", "desc")
    .select(["id", "titulo", "contenido", "created_at"]);
  res.json({ anuncios: await conImagenes(anuncios) });
});

/** GET /api/admin/anuncios — todos los anuncios, publicados o no. */
const listarTodos = asyncHandler(async (_req, res) => {
  const anuncios = await knex("anuncios").orderBy("created_at", "desc");
  res.json({ anuncios: await conImagenes(anuncios) });
});

/** POST /api/admin/anuncios — el título/contenido se crean primero; las imágenes se agregan después (máx. 4). */
const crear = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { titulo, contenido, publicado } = req.body;
  const [anuncio] = await knex("anuncios")
    .insert({ titulo, contenido, publicado: publicado ?? true })
    .returning("*");
  res.status(201).json({ anuncio: { ...anuncio, imagenes: [] } });
});

/** PUT /api/admin/anuncios/:id */
const actualizar = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { id } = req.params;
  const { titulo, contenido, publicado } = req.body;

  const [anuncio] = await knex("anuncios")
    .where({ id })
    .update({ titulo, contenido, publicado: publicado ?? true, updated_at: knex.fn.now() })
    .returning("*");

  if (!anuncio) throw new ApiError(404, "Anuncio no encontrado.");
  const [conImgs] = await conImagenes([anuncio]);
  res.json({ anuncio: conImgs });
});

/** DELETE /api/admin/anuncios/:id — también borra sus imágenes (ON DELETE CASCADE). */
const eliminar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const borrados = await knex("anuncios").where({ id }).del();
  if (!borrados) throw new ApiError(404, "Anuncio no encontrado.");
  res.json({ ok: true });
});

module.exports = { listarPublicos, listarTodos, crear, actualizar, eliminar, anuncioValidators };
