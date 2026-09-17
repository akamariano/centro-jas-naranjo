/**
 * Crea (o actualiza la contraseña de) un administrador.
 * Uso:
 *   node scripts/createAdmin.js <usuario> <password> [correo]
 *
 * No se siembra ningún admin por defecto en las migraciones/seeds:
 * la contraseña nunca debe vivir en el control de versiones.
 */
const bcrypt = require("bcrypt");
const knex = require("../src/db/knex");

async function main() {
  const [usuario, password, correo] = process.argv.slice(2);

  if (!usuario || !password) {
    console.error("Uso: node scripts/createAdmin.js <usuario> <password> [correo]");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existente = await knex("admins").where({ usuario }).first();

  if (existente) {
    await knex("admins").where({ usuario }).update({ password_hash: passwordHash, correo });
    console.log(`Contraseña actualizada para el admin "${usuario}".`);
  } else {
    await knex("admins").insert({ usuario, correo, password_hash: passwordHash });
    console.log(`Admin "${usuario}" creado correctamente.`);
  }

  await knex.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
