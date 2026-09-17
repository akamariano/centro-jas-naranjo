const env = require("./src/config/env");

/**
 * Configuración de Knex compartida por CLI (migraciones/seeds) y por la app.
 * Usa DATABASE_URL si está presente (Render/Supabase); si no, variables DB_*.
 */
function buildConnection() {
  if (env.db.connectionString) {
    return {
      connectionString: env.db.connectionString,
      ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
    };
  }
  return {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  };
}

/** @type {import('knex').Knex.Config} */
const base = {
  client: "pg",
  connection: buildConnection(),
  pool: { min: 2, max: 10 },
  migrations: {
    directory: "./src/db/migrations",
    tableName: "knex_migrations",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
};

module.exports = {
  development: base,
  production: base,
};
