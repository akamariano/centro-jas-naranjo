require("dotenv").config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),

  db: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "cjn_admin",
    password: process.env.DB_PASSWORD || "cjn_password",
    database: process.env.DB_NAME || "centro_jas_naranjo",
    ssl: process.env.DB_SSL === "true",
  },

  jwt: {
    secret: required("JWT_SECRET", "dev-secret-cambia-esto"),
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    cookieName: process.env.COOKIE_NAME || "cjn_token",
  },

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  cookieSecure: process.env.COOKIE_SECURE === "true",

  uploadsDir: process.env.UPLOADS_DIR || "uploads",
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || "5", 10),
};

module.exports = env;
