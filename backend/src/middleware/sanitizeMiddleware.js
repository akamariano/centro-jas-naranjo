const { sanitizeObject } = require("../utils/sanitize");

/** Limpia body y query de todas las requests antes de llegar a los controladores. */
function sanitizeMiddleware(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  next();
}

module.exports = sanitizeMiddleware;
