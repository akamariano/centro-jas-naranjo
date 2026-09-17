exports.up = async function (knex) {
  await knex.schema.createTable("usuarios", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("codigo_corto", 12).notNullable().unique();
    table.string("nombre_completo", 150).notNullable();
    table.string("correo", 150);
    table.string("telefono", 20).notNullable();
    table.string("estaca", 120);
    table.string("barrio", 120);
    table.boolean("es_miembro").notNullable().defaultTo(false);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index("telefono", "idx_usuarios_telefono");
    table.index("codigo_corto", "idx_usuarios_codigo_corto");
  });

  // Índice GIN con pg_trgm para búsquedas ILIKE '%texto%' eficientes por nombre
  await knex.raw(
    "CREATE INDEX idx_usuarios_nombre_trgm ON usuarios USING gin (nombre_completo gin_trgm_ops)"
  );
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("usuarios");
};
