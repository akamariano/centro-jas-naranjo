-- =====================================================================
-- Centro JAS Naranjo — DDL de referencia (PostgreSQL)
-- =====================================================================
-- Este script es la fuente de verdad "humana" del esquema. La fuente de
-- verdad ejecutable son las migraciones de Knex en
-- backend/src/db/migrations. Úsalo para:
--   1) Bootstrap automático de docker-compose (docker-entrypoint-initdb.d)
--   2) Despliegues manuales en Render / Supabase (SQL editor)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- búsqueda ILIKE eficiente por nombre

-- ---------------------------------------------------------------------
-- admins: usuarios administradores (login protegido con JWT)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario       VARCHAR(60)  NOT NULL UNIQUE,
  correo        VARCHAR(150) UNIQUE,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- usuarios: asistentes registrados desde la vista pública
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_corto    VARCHAR(12)  NOT NULL UNIQUE,
  nombre_completo VARCHAR(150) NOT NULL,
  correo          VARCHAR(150),
  telefono        VARCHAR(20)  NOT NULL,
  fecha_nacimiento DATE,
  estaca          VARCHAR(120),
  barrio          VARCHAR(120),
  es_miembro      BOOLEAN      NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_telefono ON usuarios (telefono);
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo_corto ON usuarios (codigo_corto);
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_trgm ON usuarios USING gin (nombre_completo gin_trgm_ops);

-- ---------------------------------------------------------------------
-- actividades: sistema de "cola" — solo una puede estar activa a la vez
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS actividades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(150) NOT NULL,
  descripcion TEXT,
  fecha       DATE         NOT NULL DEFAULT CURRENT_DATE,
  activa      BOOLEAN      NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Garantiza a nivel de base de datos que nunca haya dos actividades activas
CREATE UNIQUE INDEX IF NOT EXISTS idx_una_actividad_activa
  ON actividades (activa)
  WHERE activa = true;

-- ---------------------------------------------------------------------
-- asistencias: check-in de un usuario a una actividad (QR o manual)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asistencias (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  actividad_id    UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  metodo          VARCHAR(10) NOT NULL CHECK (metodo IN ('qr', 'manual')),
  registrado_por  UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, actividad_id)
);

CREATE INDEX IF NOT EXISTS idx_asistencias_actividad ON asistencias (actividad_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_usuario ON asistencias (usuario_id);

-- ---------------------------------------------------------------------
-- anuncios: tablón público de eventos/noticias
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS anuncios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      VARCHAR(150) NOT NULL,
  contenido   TEXT         NOT NULL,
  publicado   BOOLEAN      NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Imágenes de un anuncio: subidas como archivo o enlazadas por URL externa.
-- Máximo 4 por anuncio, reforzado en la aplicación (ver verificarLimiteImagenes).
CREATE TABLE IF NOT EXISTS anuncio_imagenes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anuncio_id UUID NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  origen     VARCHAR(10) NOT NULL CHECK (origen IN ('archivo', 'url')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anuncio_imagenes_anuncio ON anuncio_imagenes (anuncio_id);

-- ---------------------------------------------------------------------
-- fotos_actividad: galería de fotos por actividad pasada
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fotos_actividad (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL REFERENCES actividades(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  descripcion  VARCHAR(255),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fotos_actividad ON fotos_actividad (actividad_id);
