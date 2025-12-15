import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSesionesRequest } from "../api/sesionesApi";
import { getActividadesRequest } from "../api/actividadesApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import type { Sesion, ActividadLite } from "../api/sesionesApi";

export default function DashboardPage() {
  const { user } = useAuth();

  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [actividades, setActividades] = useState<ActividadLite[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch {
      try {
        const { toast } = await import("react-hot-toast");
        toast.error("Error cargando datos del dashboard");
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const totalMinutos = useMemo(
    () => sesiones.reduce((acc, s) => acc + s.duracionMinutos, 0),
    [sesiones]
  );

  const limite7Dias = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minutosUltimos7Dias = useMemo(
    () =>
      sesiones
        .filter((s) => new Date(s.fecha) >= limite7Dias)
        .reduce((acc, s) => acc + s.duracionMinutos, 0),
    [sesiones, limite7Dias]
  );

  const minutosPorActividad = useMemo(() => {
    const mapa = new Map<string, { nombre: string; minutos: number }>();

    sesiones.forEach((s) => {
      let id: string;
      let nombre: string;

      if (typeof s.actividadId === "string") {
        id = s.actividadId;
        const act = actividades.find((a) => a._id === id);
        nombre = act ? act.nombre : "Actividad";
      } else {
        id = s.actividadId._id;
        nombre = s.actividadId.nombre;
      }

      const actual = mapa.get(id);
      if (actual) actual.minutos += s.duracionMinutos;
      else mapa.set(id, { nombre, minutos: s.duracionMinutos });
    });

    return Array.from(mapa.values()).sort((a, b) => b.minutos - a.minutos);
  }, [sesiones, actividades]);

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

  const getActividadLabel = (actividadId: ActividadLite | string) => {
    if (typeof actividadId === "string") {
      const act = actividades.find((a) => a._id === actividadId);
      return act ? act.nombre : actividadId;
    }
    return actividadId.nombre;
  };

  const dataBarPorActividad = minutosPorActividad.map((item) => ({
    nombre: item.nombre,
    minutos: item.minutos,
  }));

  const dataBarPorDia = useMemo(() => {
    const dias: { fecha: string; label: string; minutos: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      dias.push({
        fecha: d.toISOString().substring(0, 10),
        label: d.toLocaleDateString("es-AR", {
          weekday: "short",
          day: "2-digit",
        }),
        minutos: 0,
      });
    }

    sesiones.forEach((s) => {
      const iso = new Date(s.fecha).toISOString().substring(0, 10);
      const dia = dias.find((d) => d.fecha === iso);
      if (dia) dia.minutos += s.duracionMinutos;
    });

    return dias;
  }, [sesiones]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Cargando datos...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Dashboard de {user?.nombre}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Resumen del tiempo dedicado a tus actividades.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Total de minutos", totalMinutos],
          ["Últimos 7 días", minutosUltimos7Dias],
          ["Cantidad de sesiones", sesiones.length],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4"
          >
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </h3>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Minutos por actividad
          </h2>

          {dataBarPorActividad.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Todavía no tenés sesiones registradas.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataBarPorActividad}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutos" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Minutos por día (últimos 7 días)
          </h2>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBarPorDia}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutos" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Sesiones recientes
        </h2>

        {sesionesRecientes.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No hay sesiones recientes.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {sesionesRecientes.map((s) => (
              <li
                key={s._id}
                className="flex flex-col border-b border-gray-200 dark:border-slate-700 last:border-b-0 pb-2 last:pb-0"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {getActividadLabel(s.actividadId)} — {s.duracionMinutos} min
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(s.fecha).toLocaleString()}
                  {s.nota ? ` — ${s.nota}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
