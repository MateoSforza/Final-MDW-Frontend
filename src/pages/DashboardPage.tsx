import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSesiones } from "../api/sesionesApi";
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

export default function DashboardPage() {
  const { user } = useAuth();

  const [sesiones, setSesiones] = useState<SesionActividad[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Cálculos de resumen ---

  // Total de minutos registrados
  const totalMinutos = useMemo(
    () => sesiones.reduce((acc, s) => acc + s.duracionMinutos, 0),
    [sesiones]
  );

  // Fecha límite últimos 7 días
  const limite7Dias = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  // Minutos en últimos 7 días
  const minutosUltimos7Dias = useMemo(
    () =>
      sesiones
        .filter((s) => new Date(s.fecha) >= limite7Dias)
        .reduce((acc, s) => acc + s.duracionMinutos, 0),
    [sesiones, limite7Dias]
  );

  // Minutos por actividad
  const minutosPorActividad = useMemo(() => {
    const mapa = new Map<string, { nombre: string; minutos: number }>();

    sesiones.forEach((s) => {
      let id: string;
      let nombre: string;

      if (typeof s.actividadId === "string") {
        id = s.actividadId;
        const act = actividades.find((a) => a._id === id);
        nombre = act ? act.nombre : "Actividad sin nombre";
      } else {
        id = s.actividadId._id;
        nombre = s.actividadId.nombre;
      }

      const actual = mapa.get(id);
      if (actual) {
        actual.minutos += s.duracionMinutos;
      } else {
        mapa.set(id, { nombre, minutos: s.duracionMinutos });
      }
    });

    return Array.from(mapa.values()).sort((a, b) => b.minutos - a.minutos);
  }, [sesiones, actividades]);

  // Sesiones recientes (5 últimas)
  const sesionesRecientes = useMemo(
    () =>
      [...sesiones]
        .sort(
          (a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )
        .slice(0, 5),
    [sesiones]
  );

  const getActividadLabel = (actividadId: Actividad | string) => {
    if (typeof actividadId === "string") {
      const act = actividades.find((a) => a._id === actividadId);
      return act ? act.nombre : actividadId;
    }
    return actividadId.nombre;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto" }}>
        <h1>Dashboard</h1>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h1>Dashboard de {user?.nombre}</h1>

      {/* Tarjetas resumen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          margin: "20px 0",
        }}
      >
        <div
          style={{
            border: "1px solid #e5e7eb",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <h3>Total de minutos registrados</h3>
          <p style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
            {totalMinutos} min
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <h3>Últimos 7 días</h3>
          <p style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
            {minutosUltimos7Dias} min
          </p>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <h3>Cantidad de sesiones</h3>
          <p style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
            {sesiones.length}
          </p>
        </div>
      </div>

      {/* Minutos por actividad */}
      <section style={{ marginBottom: "24px" }}>
        <h2>Minutos por actividad</h2>
        {minutosPorActividad.length === 0 ? (
          <p>No hay sesiones cargadas.</p>
        ) : (
          <ul>
            {minutosPorActividad.map((item) => (
              <li key={item.nombre}>
                <strong>{item.nombre}</strong>: {item.minutos} min
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Sesiones recientes */}
      <section>
        <h2>Sesiones recientes</h2>
        {sesionesRecientes.length === 0 ? (
          <p>No hay sesiones recientes.</p>
        ) : (
          <ul>
            {sesionesRecientes.map((s) => (
              <li key={s._id}>
                {getActividadLabel(s.actividadId)} —{" "}
                {new Date(s.fecha).toLocaleString()} —{" "}
                {s.duracionMinutos} min{" "}
                {s.nota ? `— ${s.nota}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
