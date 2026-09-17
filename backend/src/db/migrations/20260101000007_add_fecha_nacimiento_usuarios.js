exports.up = async function (knex) {
  await knex.schema.alterTable("usuarios", (table) => {
    // Nullable: usuarios ya registrados antes de este cambio no tienen el dato.
    // El registro público y la creación desde el admin sí lo exigen (ver validators).
    table.date("fecha_nacimiento");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("usuarios", (table) => {
    table.dropColumn("fecha_nacimiento");
  });
};
