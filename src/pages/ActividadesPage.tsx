import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getActividadesRequest,
  crearActividadRequest,
  eliminarActividadRequest,
  type CrearActividadPayload,
  type Actividad,
} from "../api/actividadesApi";
import { toast } from "react-hot-toast";

export default function ActividadesPage() {
  const { user } = useAuth();

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState<CrearActividadPayload>({
    nombre: "",
    categoria: "",
    color: "#4f46e5",
  });

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    setLoading(true);
    try {
      const res = await getActividadesRequest();
      setActividades(res.data);
    } catch (error) {
      toast.error("Error al cargar actividades");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await crearActividadRequest(form);
      // Actualizamos localmente sin recargar todo (más pro)
      setActividades((prev) => [res.data, ...prev]);
      setForm({ nombre: "", categoria: "", color: "#4f46e5" });
      toast.success("Actividad creada");
    } catch (error) {
      toast.error("Error creando actividad");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await eliminarActividadRequest(id);
      // Sacamos la actividad del estado (más pro)
      setActividades((prev) => prev.filter((a) => a._id !== id));
      toast.success("Actividad eliminada");
    } catch (error) {
      toast.error("Error eliminando actividad");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Actividades de {user?.nombre}
        </h1>
        <p className="text-sm text-gray-500">
          Definí las actividades que vas a registrar en tus sesiones.
        </p>
      </div>

      {/* Card formulario */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Nueva actividad
        </h2>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 md:grid-cols-[2fr,2fr,1fr,auto]"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
              placeholder="Estudiar MDW, Gimnasio..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Categoría
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={form.categoria ?? ""}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              required
              placeholder="Estudio, deporte, trabajo..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <input
              type="color"
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              value={form.color ?? "#4f46e5"}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className={`w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-2 text-sm font-medium transition-colors ${creating ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {creating ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de actividades */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Actividades registradas
        </h2>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando actividades...</p>
        ) : actividades.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todavía no registraste actividades.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {actividades.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-10 rounded-full"
                    style={{ backgroundColor: a.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.nombre}
                    </p>
                    <p className="text-xs text-gray-500">{a.categoria}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(a._id)}
                  disabled={deletingId === a._id}
                  className={`text-xs text-red-600 hover:text-red-700 font-medium ${deletingId === a._id ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {deletingId === a._id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  }
