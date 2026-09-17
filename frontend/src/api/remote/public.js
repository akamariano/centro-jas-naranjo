import apiClient from "../client";

export const registrarUsuario = (datos) =>
  apiClient.post("/public/registro", datos).then((r) => r.data.usuario);

export const recuperarUsuario = (datos) =>
  apiClient.post("/public/recuperar", datos).then((r) => r.data.usuario);

export const obtenerAnunciosPublicos = () =>
  apiClient.get("/public/anuncios").then((r) => r.data.anuncios);
