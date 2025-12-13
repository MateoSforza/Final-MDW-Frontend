import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Interceptor para agregar token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response (manejo de errores)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;
      if (status === 401) {
        toast.error("Tu sesión expiró");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Notify other parts of the app
        window.dispatchEvent(new Event("session-expired"));

        window.location.href = "/login";
      } else if (status === 500) {
        toast.error("Error en el servidor. Intentá más tarde.");
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("Ocurrió un error en la petición.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;