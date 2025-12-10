import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ActividadesPage from "./pages/ActividadesPage";
import SesionesPage from "./pages/SesionesPage";
import { useAuth } from "./context/AuthContext";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/actividades"
        element={
          <RequireAuth>
            <ActividadesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/sesiones"
        element={
          <RequireAuth>
            <SesionesPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
