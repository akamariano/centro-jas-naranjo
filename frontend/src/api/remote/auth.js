import apiClient from "../client";

export const login = (usuario, password) =>
  apiClient.post("/auth/login", { usuario, password }).then((r) => r.data.admin);

export const logout = () => apiClient.post("/auth/logout").then((r) => r.data);

export const me = () => apiClient.get("/auth/me").then((r) => r.data.admin);
