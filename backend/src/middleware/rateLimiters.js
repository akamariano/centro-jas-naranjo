const rateLimit = require("express-rate-limit");

/** Limita fuerza bruta sobre el login de administrador. */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde." },
});

/** Limita el registro público y la recuperación de QR contra abuso/enumeración. */
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
});

module.exports = { loginLimiter, publicWriteLimiter };
