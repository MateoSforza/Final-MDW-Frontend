import api from "./axiosClient";

export type Sesion = {
  _id: string;
  usuarioId: string;
  actividadId: string | ActividadLite;
  fecha: string;
  duracionMinutos: number;
  nota?: string;
};

export type ActividadLite = {
  _id: string;
  nombre: string;
  categoria?: string;
  color?: string;
};

export type CrearSesionPayload = {
  actividadId: string;
  fecha: string;
  duracionMinutos: number;
  nota?: string;
};

export const getSesionesRequest = () => api.get<Sesion[]>("/sesiones");
export const crearSesionRequest = (data: CrearSesionPayload) =>
  api.post<Sesion>("/sesiones", data);
export const eliminarSesionRequest = (id: string) =>
  api.delete(`/sesiones/${id}`);