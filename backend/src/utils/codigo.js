const crypto = require("crypto");
const knex = require("../db/knex");

const PREFIJO = "JAS-";

function generarCandidato() {
  // 4 caracteres hex en mayúscula, ej. "JAS-8F32"
  return PREFIJO + crypto.randomBytes(2).toString("hex").toUpperCase();
}

/** Formato válido de código corto, usado también para validar payloads de QR. */
const CODIGO_REGEX = /^JAS-[0-9A-F]{4}$/;

/** Genera un código corto único reintentando ante colisiones (muy improbable). */
async function generarCodigoUnico(trx = knex) {
  for (let intento = 0; intento < 10; intento += 1) {
    const candidato = generarCandidato();
    const existe = await trx("usuarios").where({ codigo_corto: candidato }).first("id");
    if (!existe) return candidato;
  }
  throw new Error("No se pudo generar un código único, intenta de nuevo.");
}

module.exports = { generarCodigoUnico, CODIGO_REGEX };
