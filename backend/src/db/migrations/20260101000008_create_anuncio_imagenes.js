exports.up = async function (knex) {
  await knex.schema.createTable("anuncio_imagenes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("anuncio_id").notNullable().references("id").inTable("anuncios").onDelete("CASCADE");
    table.text("url").notNullable();
    // "archivo": subido a /uploads (se borra el archivo físico al eliminar). "url": enlace externo.
    table.string("origen", 10).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index("anuncio_id", "idx_anuncio_imagenes_anuncio");
  });

  await knex.raw("ALTER TABLE anuncio_imagenes ADD CONSTRAINT chk_origen CHECK (origen IN ('archivo', 'url'))");

  // Migra el imagen_url suelto que ya existiera a la nueva tabla (máx. 4 de todas formas).
  const anuncios = await knex("anuncios").whereNotNull("imagen_url").select("id", "imagen_url");
  for (const a of anuncios) {
    await knex("anuncio_imagenes").insert({ anuncio_id: a.id, url: a.imagen_url, origen: "url" });
  }

  await knex.schema.alterTable("anuncios", (table) => {
    table.dropColumn("imagen_url");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("anuncios", (table) => {
    table.text("imagen_url");
  });
  await knex.schema.dropTableIfExists("anuncio_imagenes");
};
