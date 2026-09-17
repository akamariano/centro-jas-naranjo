const env = require("../config/env");
const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");

/** Restringe el acceso a rutas /api/admin/* exigiendo una cookie JWT válida. */
const requireAdmin = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[env.jwt.cookieName];
  if (!token) throw new ApiError(401, "No autenticado.");

  try {
    const payload = verifyToken(token);
    req.admin = { id: payload.sub, usuario: payload.usuario };
    next();
  } catch (_err) {
    throw new ApiError(401, "Sesión inválida o expirada.");
  }
});

module.exports = { requireAdmin };
