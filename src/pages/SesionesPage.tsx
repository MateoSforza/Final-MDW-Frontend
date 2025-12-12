import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getSesionesRequest,
  crearSesionRequest,
  eliminarSesionRequest,
  type CrearSesionPayload,
  type Sesion,
} from "../api/sesionesApi";
import { getActividadesRequest, type Actividad } from "../api/actividadesApi";

export default function SesionesPage() {
  const { user } = useAuth();

  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<CrearSesionPayload>({
    actividadId: "",
    fecha: new Date().toISOString(),
    duracionMinutos: 30,
    nota: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sesRes, actRes] = await Promise.all([
        getSesionesRequest(),
        getActividadesRequest(),
      ]);
      setSesiones(sesRes.data);
      setActividades(actRes.data);

      // Setea actividadId por defecto si está vacío
      if (!form.actividadId && actRes.data.length > 0) {
        setForm((prev) => ({ ...prev, actividadId: actRes.data[0]._id }));
      }
    } catch (error) {
      console.error("Error cargando sesiones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await crearSesionRequest(form);
      setSesiones((prev) => [res.data, ...prev]);

      setForm((prev) => ({
        ...prev,
        fecha: new Date().toISOString(),
        duracionMinutos: 30,
        nota: "",
      }));
    } catch (error) {
      console.error("Error creando sesión:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await eliminarSesionRequest(id);
      setSesiones((prev) => prev.filter((s) => s._id !== id));
    } catch (error) {
      console.error("Error eliminando sesión:", error);
    }
  };

  const getActividadNombre = (actividadId: Sesion["actividadId"]) => {
    if (typeof actividadId === "string") {
      const act = actividades.find((a) => a._id === actividadId);
      return act ? act.nombre : "Actividad";
    }
    return actividadId.nombre;
  };

  const sesionesOrdenadas = useMemo(
    () =>
      [...sesiones].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ),
    [sesiones]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Sesiones de {user?.nombre}
        </h1>
        <p className="text-sm text-gray-500">
          Registrá sesiones asociadas a tus actividades.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Nueva sesión</h2>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 md:grid-cols-[2fr,1fr,1fr,2fr,auto]"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Actividad</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.actividadId}
              onChange={(e) => setForm({ ...form, actividadId: e.target.value })}
              required
            >
              {actividades.length === 0 ? (
                <option value="">No hay actividades</option>
              ) : (
                actividades.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.nombre}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.fecha.slice(0, 16)}
              onChange={(e) =>
                setForm({ ...form, fecha: new Date(e.target.value).toISOString() })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Minutos</label>
            <input
              type="number"
              min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.duracionMinutos}
              onChange={(e) =>
                setForm({ ...form, duracionMinutos: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nota</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.nota ?? ""}
              onChange={(e) => setForm({ ...form, nota: e.target.value })}
              placeholder="Opcional"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              Crear
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sesiones registradas</h2>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando sesiones...</p>
        ) : sesionesOrdenadas.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no registraste sesiones.</p>
        ) : (
          <ul className="space-y-3">
            {sesionesOrdenadas.map((s) => (
              <li
                key={s._id}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getActividadNombre(s.actividadId)} — {s.duracionMinutos} min
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(s.fecha).toLocaleString()}
                    {s.nota ? ` — ${s.nota}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(s._id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}