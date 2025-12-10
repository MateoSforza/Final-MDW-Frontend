import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getActividades,
  createActividad,
  deleteActividad,
} from "../api/actividadesApi";
import type { ActividadPayload } from "../api/actividadesApi";

interface Actividad {
  _id: string;
  nombre: string;
  categoria: string;
  color: string;
  activa: boolean;
}

export default function ActividadesPage() {
  const { user } = useAuth();

  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<ActividadPayload>({
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
      const res = await getActividades();
      setActividades(res.data);
    } catch (error) {
      console.error("Error al cargar actividades:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createActividad(form);
      setForm({ nombre: "", categoria: "", color: "#4f46e5" });
      fetchActividades();
    } catch (error) {
      console.error("Error creando actividad:", error);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteActividad(id);
    fetchActividades();
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1>Actividades de {user?.nombre}</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: "20px" }}>
        <div>
          <label>Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) =>
              setForm({ ...form, nombre: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label>Categoria</label>
          <input
            type="text"
            value={form.categoria}
            onChange={(e) =>
              setForm({ ...form, categoria: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label>Color</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) =>
              setForm({ ...form, color: e.target.value })
            }
          />
        </div>

        <button type="submit">Crear actividad</button>
      </form>

      {loading ? (
        <p>Cargando actividades...</p>
      ) : (
        <ul>
          {actividades.map((a) => (
            <li key={a._id}>
              <span style={{ background: a.color, padding: "4px" }}>
                {a.nombre} — {a.categoria}
              </span>
              <button onClick={() => handleDelete(a._id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
