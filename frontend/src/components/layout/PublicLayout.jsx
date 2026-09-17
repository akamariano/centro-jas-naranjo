import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar.jsx";
import PublicFooter from "./PublicFooter.jsx";
import { TEST_MODE } from "../../testMode";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {TEST_MODE && (
        <div className="bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-amber-950">
          Modo de prueba — los datos se guardan solo en este navegador
        </div>
      )}
      <PublicNavbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
