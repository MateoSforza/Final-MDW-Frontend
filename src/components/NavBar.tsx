import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const linkClasses = (path: string) =>
    `text-sm font-medium px-2 py-1 rounded-md transition-colors ${
      isActive(path)
        ? "text-sky-600 bg-sky-100 dark:text-sky-400 dark:bg-sky-900"
        : "text-gray-700 hover:text-black hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
    }`;

  return (
    <header
      className="
        bg-white text-gray-900
        dark:bg-gray-900 dark:text-white
        px-6 py-3 flex justify-between items-center
        shadow-md transition-colors
      "
    >
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/FocusTracker.png"
            alt="FocusTracker logo"
            className="h-7 w-7"
          />
          <span className="font-semibold text-lg tracking-tight">
            FocusTracker
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <Link to="/dashboard" className={linkClasses("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/actividades" className={linkClasses("/actividades")}>
            Actividades
          </Link>
          <Link to="/sesiones" className={linkClasses("/sesiones")}>
            Sesiones
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user.nombre}
          </span>
        )}

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="
            bg-red-500 hover:bg-red-600
            text-white text-sm font-medium
            px-3 py-1.5 rounded-md
            transition-colors
          "
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
