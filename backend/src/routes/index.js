const { Router } = require("express");
const publicRoutes = require("./public");
const adminRoutes = require("./admin");
const authRoutes = require("./auth");

const router = Router();

router.use("/public", publicRoutes);
router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);

module.exports = router;
