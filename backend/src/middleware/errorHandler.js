const env = require("../config/env");

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Ruta no encontrada." });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: isServerError && env.nodeEnv === "production" ? "Error interno del servidor." : err.message,
  });
}

module.exports = { notFoundHandler, errorHandler };
