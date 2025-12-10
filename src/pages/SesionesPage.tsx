import { useEffect, useState } from "react";
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
  actividadId: Actividad | string; // por el populate puede ser objeto
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.actividadId || !form.fecha || !form.duracionMinutos) {
      return;
    }

    try {
      // convertir datetime-local a ISO
      const isoFecha = new Date(form.fecha).toISOString();

      await createSesion({
        ...form,
        fecha: isoFecha,
      });

      // reset simple
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
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>Sesiones de {user?.nombre}</h1>

      {/* Formulario de alta de sesión */}
      <form onSubmit={handleCreate} style={{ marginBottom: "24px" }}>
        <div>
          <label>Actividad</label>
          <select
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

        <div>
          <label>Fecha y hora</label>
          <input
            type="datetime-local"
            value={form.fecha}
            onChange={(e) =>
              setForm({ ...form, fecha: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label>Duración (minutos)</label>
          <input
            type="number"
            min={1}
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

        <div>
          <label>Nota (opcional)</label>
          <input
            type="text"
            value={form.nota}
            onChange={(e) =>
              setForm({ ...form, nota: e.target.value })
            }
          />
        </div>

        <button type="submit">Registrar sesión</button>
      </form>

      {/* Lista de sesiones */}
      {loading ? (
        <p>Cargando sesiones...</p>
      ) : sesiones.length === 0 ? (
        <p>No tenés sesiones registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Fecha</th>
              <th>Duración (min)</th>
              <th>Nota</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sesiones.map((s) => (
              <tr key={s._id}>
                <td>{getActividadLabel(s.actividadId)}</td>
                <td>{new Date(s.fecha).toLocaleString()}</td>
                <td>{s.duracionMinutos}</td>
                <td>{s.nota ?? "-"}</td>
                <td>
                  <button onClick={() => handleDelete(s._id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
