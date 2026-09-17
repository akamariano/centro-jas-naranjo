exports.up = async function (knex) {
  await knex.schema.createTable("anuncios", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("titulo", 150).notNullable();
    table.text("contenido").notNullable();
    table.text("imagen_url");
    table.boolean("publicado").notNullable().defaultTo(true);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("anuncios");
};
