import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg("");

    const ok = await register({ nombre, email, password });

    if (ok) {
      setMsg("Registro exitoso. Ahora podés iniciar sesión.");
      toast.success("Registro exitoso. Podés iniciar sesión.");
      navigate("/login");
    } else {
      setMsg("Error al registrarse. Probá con otro email.");
      toast.error("Error al registrarse. Probá con otro email.");
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-6 border border-transparent dark:border-slate-700">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
          Crear cuenta
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-300">
          Empezá a registrar tus actividades y sesiones.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Nombre
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Tu nombre"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tucorreo@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
            Contraseña
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {msg && (
          <p className="text-sm text-sky-700 dark:text-sky-400">
            {msg}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          Crear cuenta
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-slate-300">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/login"
          className="text-sky-600 hover:text-sky-700 font-medium"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  </div>
  );

}