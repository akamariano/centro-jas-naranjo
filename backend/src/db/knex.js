require("./pgTypes"); // debe ir antes de crear cualquier conexión (ver ese archivo)
const knexLib = require("knex");
const knexConfig = require("../../knexfile");
const env = require("../config/env");

const knex = knexLib(knexConfig[env.nodeEnv] || knexConfig.development);

module.exports = knex;
