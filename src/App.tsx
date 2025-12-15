import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ActividadesPage from "./pages/ActividadesPage";
import SesionesPage from "./pages/SesionesPage";
import DashboardPage from "./pages/DashboardPage";

import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cargando...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  /**
   * Inicializa el modo claro / oscuro al cargar la app
   * Lee preferencia desde localStorage
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const html = document.documentElement;

    if (savedTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, []);

  /**
   * Alterna el modo claro / oscuro
   * - Agrega o quita la clase "dark" en <html>
   * - Guarda preferencia en localStorage
   */
  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");

    localStorage.setItem(
      "theme",
      html.classList.contains("dark") ? "dark" : "light"
    );
  };

  return (
    <>
      {/* Botón flotante de modo claro / oscuro */}
      <button
        onClick={toggleTheme}
        className="
          fixed bottom-4 right-4 z-50
          px-4 py-2 rounded-full shadow
          bg-gray-800 text-white
          dark:bg-gray-200 dark:text-black
          transition-colors
        "
        aria-label="Toggle theme"
      >
        🌙 / ☀️
      </button>

      <Routes>
        {/* Redirigir raíz al login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Layout>
                <DashboardPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/actividades"
          element={
            <RequireAuth>
              <Layout>
                <ActividadesPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/sesiones"
          element={
            <RequireAuth>
              <Layout>
                <SesionesPage />
              </Layout>
            </RequireAuth>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}
