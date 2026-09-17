import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ConfirmProvider } from "./context/ConfirmContext.jsx";
import "./index.css";

// En GitHub Pages la app vive en /<repo>/ (ver BASE_PATH en vite.config.js);
// BrowserRouter necesita saberlo para que los links internos no pierdan ese prefijo.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0a0a0a",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              border: "1px solid rgba(10,10,10,0.08)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 16px 40px -8px rgba(0,0,0,0.6)",
            },
            // Iconos monocromáticos (sin el verde/rojo por defecto de la librería)
            success: { iconTheme: { primary: "#0a0a0a", secondary: "#ffffff" } },
            error: { iconTheme: { primary: "#0a0a0a", secondary: "#ffffff" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
