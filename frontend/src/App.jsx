import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import AmbientBackground from "./components/layout/AmbientBackground.jsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.jsx";

import HomePage from "./pages/public/HomePage.jsx";
import RegistroPage from "./pages/public/RegistroPage.jsx";
import RecuperarQRPage from "./pages/public/RecuperarQRPage.jsx";
import AnunciosPage from "./pages/public/AnunciosPage.jsx";

import LoginPage from "./pages/admin/LoginPage.jsx";
import CheckinPage from "./pages/admin/CheckinPage.jsx";
import ActividadesPage from "./pages/admin/ActividadesPage.jsx";
import ReportesPage from "./pages/admin/ReportesPage.jsx";
import AnunciosAdminPage from "./pages/admin/AnunciosAdminPage.jsx";
import UsuariosPage from "./pages/admin/UsuariosPage.jsx";

export default function App() {
  return (
    <>
      <AmbientBackground />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<RegistroPage />} />
          <Route path="/recuperar" element={<RecuperarQRPage />} />
          <Route path="/anuncios" element={<AnunciosPage />} />
        </Route>

        <Route path="/admin/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<CheckinPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="actividades" element={<ActividadesPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="anuncios" element={<AnunciosAdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
