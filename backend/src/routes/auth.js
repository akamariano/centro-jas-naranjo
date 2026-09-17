const { Router } = require("express");
const { login, logout, me, loginValidators } = require("../controllers/authController");
const { requireAdmin } = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimiters");

const router = Router();

router.post("/login", loginLimiter, loginValidators, login);
router.post("/logout", logout);
router.get("/me", requireAdmin, me);

module.exports = router;
