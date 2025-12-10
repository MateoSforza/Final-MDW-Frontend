import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      style={{
        backgroundColor: "#1f2937",
        color: "#f9fafb",
        padding: "10px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
            <div>
        <span style={{ fontWeight: "bold", marginRight: "16px" }}>
          FocusTracker
        </span>
        <Link
          to="/actividades"
          style={{
            marginRight: "12px",
            textDecoration: "none",
            color: isActive("/actividades") ? "#38bdf8" : "#e5e7eb",
          }}
        >
          Actividades
        </Link>
        <Link
          to="/sesiones"
          style={{
            marginRight: "12px",
            textDecoration: "none",
            color: isActive("/sesiones") ? "#38bdf8" : "#e5e7eb",
          }}
        >
          Sesiones
        </Link>
        <Link
          to="/dashboard"
          style={{
            marginRight: "12px",
            textDecoration: "none",
            color: isActive("/dashboard") ? "#38bdf8" : "#e5e7eb",
          }}
        >
          Dashboard
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {user && (
          <span style={{ fontSize: "0.9rem" }}>
            {user.nombre}
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#ef4444",
            border: "none",
            color: "#f9fafb",
            padding: "6px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
