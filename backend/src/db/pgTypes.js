const { types } = require("pg");

/**
 * Por defecto, node-postgres parsea las columnas DATE (oid 1082) como un
 * objeto Date construido en la zona horaria del SERVIDOR. Un DATE de
 * PostgreSQL no tiene componente de hora/zona horaria, así que ese Date es
 * ambiguo: si el cliente que lo serializa (ej. JSON.stringify) o lo lee está
 * en otro huso horario, "2000-05-15" puede mostrarse como 14 o 16 de mayo.
 *
 * Se desactiva ese parseo y se devuelve el string "YYYY-MM-DD" tal cual llega
 * de PostgreSQL — sin ambigüedad posible. Debe cargarse antes de la primera
 * consulta (ver require al inicio de db/knex.js).
 */
types.setTypeParser(1082, (value) => value);

module.exports = {};
