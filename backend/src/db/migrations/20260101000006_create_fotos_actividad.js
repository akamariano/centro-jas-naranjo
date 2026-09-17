exports.up = async function (knex) {
  await knex.schema.createTable("fotos_actividad", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("actividad_id")
      .notNullable()
      .references("id")
      .inTable("actividades")
      .onDelete("CASCADE");
    table.text("url").notNullable();
    table.string("descripcion", 255);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index("actividad_id", "idx_fotos_actividad");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("fotos_actividad");
};
