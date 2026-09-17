import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE_PATH solo se define en el build de GitHub Pages (ver .github/workflows/deploy-pages.yml),
// para servir la app desde /<repo>/ en vez de la raíz. Vercel u otro hosting no lo definen,
// así que su build sigue usando "/" como siempre.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || "/",
  server: {
    port: 5173,
  },
});
