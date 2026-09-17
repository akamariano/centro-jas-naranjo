const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const env = require("./config/env");
const routes = require("./routes");
const sanitizeMiddleware = require("./middleware/sanitizeMiddleware");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    // Las fotos servidas desde /uploads se embeben en el frontend (otro origen/puerto)
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS: únicamente el dominio del frontend puede enviar credenciales (cookies)
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeMiddleware);

if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
}

app.use("/uploads", express.static(env.uploadsDir));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
