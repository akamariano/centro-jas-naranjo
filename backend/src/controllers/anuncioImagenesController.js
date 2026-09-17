const { body, validationResult } = require("express-validator");
const knex = require("../db/knex");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

const MAX_IMAGENES_ANUNCIO = 4;

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
}

const urlValidators = [
  body("url").trim().isURL({ require_protocol: true }).withMessage("Ingresa una URL de imagen válida (con http:// o https://)."),
];

/** GET /api/admin/anuncios/:id/imagenes */
const listar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const imagenes = await knex("anuncio_imagenes").where({ anuncio_id: id }).orderBy("created_at", "asc");
  res.json({ imagenes });
});

/**
 * Corta el intento ANTES de que multer escriba el archivo a disco (para subidas)
 * o de insertar la fila (para URL): evita superar el máximo por cualquiera de
 * las dos vías, ya que comparten el mismo cupo de 4 imágenes por anuncio.
 */
const verificarLimite = asyncHandler(async (req, _res, next) => {
  const { id } = req.params;
  const anuncio = await knex("anuncios").where({ id }).first("id");
  if (!anuncio) throw new ApiError(404, "Anuncio no encontrado.");

  const { total } = await knex("anuncio_imagenes").where({ anuncio_id: id }).count("* as total").first();
  if (Number(total) >= MAX_IMAGENES_ANUNCIO) {
    throw new ApiError(409, `Este anuncio ya alcanzó el máximo de ${MAX_IMAGENES_ANUNCIO} imágenes.`);
  }
  next();
});

/** POST /api/admin/anuncios/:id/imagenes — multipart/form-data, campo "imagen". */
const subirArchivo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!req.file) throw new ApiError(400, "Debes adjuntar una imagen.");

  const url = `/uploads/${req.file.filename}`;
  const [imagen] = await knex("anuncio_imagenes")
    .insert({ anuncio_id: id, url, origen: "archivo" })
    .returning("*");

  res.status(201).json({ imagen });
});

/** POST /api/admin/anuncios/:id/imagenes/url — JSON { url }. */
const agregarPorUrl = asyncHandler(async (req, res) => {
  checkValidation(req);
  const { id } = req.params;
  const { url } = req.body;

  const [imagen] = await knex("anuncio_imagenes")
    .insert({ anuncio_id: id, url, origen: "url" })
    .returning("*");

  res.status(201).json({ imagen });
});

/** DELETE /api/admin/anuncios/imagenes/:id */
const eliminar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const borrados = await knex("anuncio_imagenes").where({ id }).del();
  if (!borrados) throw new ApiError(404, "Imagen no encontrada.");
  res.json({ ok: true });
});

module.exports = {
  listar,
  verificarLimite,
  subirArchivo,
  agregarPorUrl,
  eliminar,
  urlValidators,
  MAX_IMAGENES_ANUNCIO,
};
