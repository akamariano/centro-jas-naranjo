const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const env = require("../config/env");

const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      return cb(new Error("Formato de imagen no permitido (usa JPG, PNG o WEBP)."));
    }
    cb(null, true);
  },
});

module.exports = upload;
