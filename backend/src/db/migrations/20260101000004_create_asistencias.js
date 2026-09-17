exports.up = async function (knex) {
  await knex.schema.createTable("asistencias", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("usuario_id")
      .notNullable()
      .references("id")
      .inTable("usuarios")
      .onDelete("CASCADE");
    table
      .uuid("actividad_id")
      .notNullable()
      .references("id")
      .inTable("actividades")
      .onDelete("CASCADE");
    table.string("metodo", 10).notNullable();
    table
      .uuid("registrado_por")
      .references("id")
      .inTable("admins")
      .onDelete("SET NULL");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.unique(["usuario_id", "actividad_id"]);
    table.index("actividad_id", "idx_asistencias_actividad");
    table.index("usuario_id", "idx_asistencias_usuario");
  });

  await knex.raw(
    "ALTER TABLE asistencias ADD CONSTRAINT chk_metodo CHECK (metodo IN ('qr', 'manual'))"
  );
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("asistencias");
};
