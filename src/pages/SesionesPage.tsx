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
import { toast } from "react-hot-toast";

type SesionStatus = "future" | "running" | "finished";

function getSesionWindow(fechaISO: string, duracionMinutos: number) {
  const startMs = new Date(fechaISO).getTime();
  const endMs = startMs + duracionMinutos * 60_000;
  return { startMs, endMs };
}

function getSesionStatus(now: number, startMs: number, endMs: number): SesionStatus {
  if (now < startMs) return "future";
  if (now >= startMs && now < endMs) return "running";
  return "finished";
}

function formatCountdown(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const dd = String(Math.floor(h / 24)).padStart(2, "0");
  const hh = String(h % 24).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${dd} Dias, ${hh}:${mm}:${ss}`;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export default function SesionesPage() {
  const { user } = useAuth();

  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Clock para countdown/progress (re-render cada 1s)
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const [form, setForm] = useState<CrearSesionPayload>({
    actividadId: "",
    fecha: new Date().toISOString(),
    duracionMinutos: 30,
    nota: "",
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (!form.actividadId && actRes.data.length > 0) {
        setForm((prev) => ({ ...prev, actividadId: actRes.data[0]._id }));
      }
    } catch {
      toast.error("Error cargando sesiones");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await crearSesionRequest(form);
      setSesiones((prev) => [res.data, ...prev]);
      setForm((prev) => ({
        ...prev,
        fecha: new Date().toISOString(),
        duracionMinutos: 30,
        nota: "",
      }));
      toast.success("Sesión creada");
    } catch {
      toast.error("Error creando sesión");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await eliminarSesionRequest(id);
      setSesiones((prev) => prev.filter((s) => s._id !== id));
      toast.success("Sesión eliminada");
    } catch {
      toast.error("Error eliminando sesión");
    } finally {
      setDeletingId(null);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Sesiones de {user?.nombre}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Registrá sesiones asociadas a tus actividades.
        </p>
      </div>

      {/* Nueva sesión */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Nueva sesión
        </h2>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 md:grid-cols-[2fr,1fr,1fr,2fr,auto]"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Actividad
            </label>
            <select
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
              value={form.actividadId}
              onChange={(e) =>
                setForm({ ...form, actividadId: e.target.value })
              }
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha
            </label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
              value={form.fecha.slice(0, 16)}
              onChange={(e) =>
                setForm({
                  ...form,
                  fecha: new Date(e.target.value).toISOString(),
                })
              }
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Minutos
            </label>
            <input
              type="number"
              min={1}
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
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

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nota
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
              value={form.nota ?? ""}
              onChange={(e) => setForm({ ...form, nota: e.target.value })}
              placeholder="Opcional"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className={`w-full bg-sky-600 hover:bg-sky-700 text-white rounded-lg py-2 text-sm font-medium transition-colors ${
                creating ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {creating ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Sesiones registradas
        </h2>

        {loading ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cargando sesiones...
          </p>
        ) : sesionesOrdenadas.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Todavía no registraste sesiones.
          </p>
        ) : (
          <ul className="space-y-3">
            {sesionesOrdenadas.map((s) => {
              const { startMs, endMs } = getSesionWindow(
                s.fecha,
                s.duracionMinutos
              );
              const status = getSesionStatus(nowMs, startMs, endMs);

              const msToStart = startMs - nowMs;
              const msToEnd = endMs - nowMs;

              const progress = clamp01((nowMs - startMs) / (endMs - startMs));
              const progressPct = Math.round(progress * 100);

              return (
                <li
                  key={s._id}
                  className="flex items-start justify-between border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getActividadNombre(s.actividadId)} —{" "}
                        {s.duracionMinutos} min
                      </p>

                      {status === "future" && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          Faltan {formatCountdown(msToStart)}
                        </span>
                      )}

                      {status === "running" && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                          En ejecución — {progressPct}%
                        </span>
                      )}

                      {status === "finished" && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          Sesión finalizada
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(s.fecha).toLocaleString()}
                      {s.nota ? ` — ${s.nota}` : ""}
                    </p>

                    {status === "running" && (
                      <div className="mt-2">
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-sky-600"
                            style={{ width: `${progressPct}%` }}
                            aria-label="Progreso de sesión"
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          Termina en {formatCountdown(msToEnd)}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(s._id)}
                    disabled={deletingId === s._id}
                    className={`ml-4 text-xs font-medium text-red-600 hover:text-red-700 ${
                      deletingId === s._id ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {deletingId === s._id ? "Eliminando..." : "Eliminar"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
