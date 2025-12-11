import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { getSesiones, createSesion, deleteSesion } from "../api/sesionesApi";
import type { SesionPayload } from "../api/sesionesApi";
import { getActividades } from "../api/actividadesApi";

interface Actividad {
  _id: string;
  nombre: string;
  categoria: string;
  color: string;
}

interface SesionActividad {
  _id: string;
  actividadId: Actividad | string;
  fecha: string;
  duracionMinutos: number;
  nota?: string;
}

export default function SesionesPage() {
  const { user } = useAuth();

  const [sesiones, setSesiones] = useState<SesionActividad[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<SesionPayload>({
    actividadId: "",
    fecha: "",
    duracionMinutos: 60,
    nota: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sesRes, actRes] = await Promise.all([
        getSesiones(),
        getActividades(),
      ]);
      setSesiones(sesRes.data);
      setActividades(actRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.actividadId || !form.fecha || !form.duracionMinutos) return;

    try {
      const isoFecha = new Date(form.fecha).toISOString();

      await createSesion({
        ...form,
        fecha: isoFecha,
      });

      setForm({
        actividadId: "",
        fecha: "",
        duracionMinutos: 60,
        nota: "",
      });

      fetchData();
    } catch (error) {
      console.error("Error creando sesión:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSesion(id);
      fetchData();
    } catch (error) {
      console.error("Error eliminando sesión:", error);
    }
  };

  const getActividadLabel = (actividadId: Actividad | string) => {
    if (typeof actividadId === "string") {
      const act = actividades.find((a) => a._id === actividadId);
      return act ? act.nombre : actividadId;
    }
    return actividadId.nombre;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Sesiones de {user?.nombre}
        </h1>
        <p className="text-sm text-gray-500">
          Registrá cuánto tiempo dedicás a cada actividad.
        </p>
      </div>

      {/* Card formulario */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Nueva sesión
        </h2>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="space-y-1 md:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium text-gray-700">
              Actividad
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={form.actividadId}
              onChange={(e) =>
                setForm({ ...form, actividadId: e.target.value })
              }
              required
            >
              <option value="">Seleccioná una actividad</option>
              {actividades.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.nombre} — {a.categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={form.fecha}
              onChange={(e) =>
                setForm({ ...form, fecha: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Duración (minutos)
            </label>
            <input
              type="number"
              min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={form.duracionMinutos}
              onChange={(e) =>
                setForm({
                  ...form,
                  duracionMinutos: Number(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="space-y-1 md:col-span-2 lg:col-span-1">
            <label className="text-sm font-medium text-gray-700">
              Nota (opcional)
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={form.nota}
              onChange={(e) =>
                setForm({ ...form, nota: e.target.value })
              }
              placeholder="Ej: Parcial MDW, rutina fuerza..."
            />
          </div>

          <div className="flex items-end md:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              Registrar sesión
            </button>
          </div>
        </form>
      </div>

      {/* Lista / tabla */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Sesiones registradas
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando sesiones...</p>
        ) : sesiones.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todavía no registraste sesiones.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nota
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sesiones.map((s) => (
                  <tr key={s._id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getActividadLabel(s.actividadId)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {new Date(s.fecha).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {s.duracionMinutos} min
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-700">
                      {s.nota ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
