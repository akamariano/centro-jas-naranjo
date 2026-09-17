const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const knex = require("../db/knex");
const env = require("../config/env");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { signAdminToken } = require("../utils/jwt");

const loginValidators = [
  body("usuario").trim().notEmpty().withMessage("El usuario es requerido."),
  body("password").isString().notEmpty().withMessage("La contraseña es requerida."),
];

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSecure ? "strict" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };
}

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);

  const { usuario, password } = req.body;

  // Consulta parametrizada (Knex enlaza automáticamente los valores)
  const admin = await knex("admins").where({ usuario }).first();
  if (!admin) throw new ApiError(401, "Credenciales inválidas.");

  const passwordValida = await bcrypt.compare(password, admin.password_hash);
  if (!passwordValida) throw new ApiError(401, "Credenciales inválidas.");

  const token = signAdminToken(admin);
  res.cookie(env.jwt.cookieName, token, cookieOptions());
  res.json({ admin: { id: admin.id, usuario: admin.usuario } });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.jwt.cookieName, { path: "/" });
  res.json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = { login, logout, me, loginValidators };
