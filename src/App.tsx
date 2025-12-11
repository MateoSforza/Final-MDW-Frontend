import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
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

      {/* fallback por si alguien mete una ruta inventada */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
