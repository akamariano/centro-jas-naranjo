exports.up = async function (knex) {
  await knex.schema.createTable("actividades", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("nombre", 150).notNullable();
    table.text("descripcion");
    table.date("fecha").notNullable().defaultTo(knex.raw("CURRENT_DATE"));
    table.boolean("activa").notNullable().defaultTo(false);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Regla de negocio a nivel de BD: nunca puede haber dos actividades activas
  await knex.raw(
    "CREATE UNIQUE INDEX idx_una_actividad_activa ON actividades (activa) WHERE activa = true"
  );
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("actividades");
};
