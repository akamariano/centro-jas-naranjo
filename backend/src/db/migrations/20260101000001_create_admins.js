exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm');

  await knex.schema.createTable("admins", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("usuario", 60).notNullable().unique();
    table.string("correo", 150).unique();
    table.text("password_hash").notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("admins");
};
