const { Router } = require("express");
const {
  registrar,
  recuperar,
  registroValidators,
  recuperarValidators,
} = require("../controllers/usuariosController");
const { listarPublicos } = require("../controllers/anunciosController");
const { publicWriteLimiter } = require("../middleware/rateLimiters");

const router = Router();

router.post("/registro", publicWriteLimiter, registroValidators, registrar);
router.post("/recuperar", publicWriteLimiter, recuperarValidators, recuperar);
router.get("/anuncios", listarPublicos);

module.exports = router;
