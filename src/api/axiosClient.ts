import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  // Enviar cookies (ej. cookie HttpOnly con JWT)
  withCredentials: true,
});

export default api;

// No añadimos Authorization desde localStorage: el backend maneja la sesión vía cookie HttpOnly.
api.interceptors.request.use((config) => config);

// Interceptor de response (manejo de errores)
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";

    const isAuthEndpoint =
      url.includes("/auth/me") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/logout");

    if (status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new Event("session-expired"));
    }

    return Promise.reject(error);
  }
);
