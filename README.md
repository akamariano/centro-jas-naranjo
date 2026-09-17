# Centro JAS Naranjo

Plataforma de registro de asistentes con carnet/QR descargable y check-in
híbrido (escáner de cámara + búsqueda manual por nombre/ID) para administradores.

**Stack:** React (Vite) + Tailwind · Node/Express · PostgreSQL (Knex) · JWT en cookie HttpOnly.

**Colorway:** exclusivamente blanco/negro/grises — los logos con color (verde/naranja)
en `Logos/` no se usan en el producto; la app consume `Logos/CJN_Negro.png` y
`Logos/CJN_Blanco.png` (copiados en `frontend/public/logos/`).

## Estructura

```
├── db/init.sql                 # DDL de referencia (bootstrap de docker-compose / deploy manual)
├── docker-compose.yml          # PostgreSQL local en :5432
├── backend/                    # API REST (Express + Knex)
│   └── src/{config,db,middleware,controllers,routes,utils}
└── frontend/                   # SPA (React + Vite + Tailwind)
    └── src/{api,components,context,hooks,pages}
```

## 1. Base de datos (Docker)

```bash
cp .env.example .env
docker compose up -d
```

## 2. Backend

```bash
cd backend
cp .env.example .env      # ajusta JWT_SECRET y las credenciales de DB si difieren
npm install
npm run migrate           # crea las tablas (usuarios, actividades, asistencias, anuncios, fotos_actividad, admins)
npm run create:admin -- admin "unaClaveSegura123"   # crea el primer administrador (no se siembra por defecto)
npm run dev                # http://localhost:4000
```

## 3. Frontend

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                # http://localhost:5173
```

## Flujos

- **Público:** `/registro` genera el carnet + QR (descarga como PNG vía `html2canvas`);
  `/recuperar` reemite el carnet buscando por teléfono; `/anuncios` lista el tablón público.
- **Admin** (`/admin`, requiere login en `/admin/login`): check-in híbrido (cámara QR o
  búsqueda por nombre/ID), gestión de actividades (solo una activa a la vez,
  reforzado con un índice único parcial en PostgreSQL), reportes filtrables + fotos, y
  CRUD de anuncios.

## Seguridad implementada

- Toda consulta usa el query builder de Knex (bindings parametrizados) — sin SQL crudo
  interpolado, ni en el login ni en las búsquedas `ILIKE`.
- Middleware de sanitización (`sanitizeMiddleware`) limpia `body`/`query` de etiquetas
  HTML y caracteres de control antes de llegar a los controladores.
- `express-validator` valida forma/tipo de cada payload público y de admin.
- JWT firmado, guardado en cookie `HttpOnly` (+ `Secure`/`SameSite=Strict` en producción,
  ver `COOKIE_SECURE`), verificado por el middleware `requireAdmin` en todo `/api/admin/*`.
- CORS restringido a `FRONTEND_URL` con `credentials: true`.
- `helmet` para cabeceras HTTP, `express-rate-limit` en login y endpoints públicos de escritura.
- Contraseñas de administrador con `bcrypt` (coste 12); ningún admin se siembra con clave
  fija en el repositorio — se crea vía `scripts/createAdmin.js`.

## Despliegue en capa gratuita

- **DB:** Render (PostgreSQL free) o Supabase → copia la `DATABASE_URL` a `backend/.env`
  y pon `DB_SSL=true`. Ejecuta `db/init.sql` desde el SQL editor o corre `npm run migrate`.
- **Backend:** Render Web Service (`npm install && npm run migrate` como build command,
  `npm start` como start command).
- **Frontend:** Render Static Site / Vercel / Netlify, con `VITE_API_URL` apuntando al
  backend desplegado y `FRONTEND_URL` del backend apuntando al dominio del frontend.
- Nota: `multer` guarda las fotos en disco local (`backend/uploads`); en un plan free de
  Render el disco es efímero, así que para producción real conviene migrar a un bucket
  (Supabase Storage / Cloudinary free tier) — el resto del flujo (URL guardada en
  `fotos_actividad.url`) no cambia.

## Autor

Desarrollado por **Mariano Rac** — [GitHub](https://github.com/akamariano) ·
[Instagram @rrnoguera](https://www.instagram.com/rrnoguera/) · marianoracnoguera@gmail.com

© 2026 Centro JAS Naranjo
