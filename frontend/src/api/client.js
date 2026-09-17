import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true, // envía/recibe la cookie HttpOnly de sesión admin
});

/** Extrae un mensaje de error legible desde una respuesta de la API. */
export function getErrorMessage(error, fallback = "Ocurrió un error inesperado.") {
  return error?.response?.data?.error || fallback;
}

export default apiClient;
