import api from "./axiosClient";

export interface SesionPayload {
  actividadId: string;
  fecha: string; // ISO string
  duracionMinutos: number;
  nota?: string;
}

export const getSesiones = () => api.get("/sesiones");

export const createSesion = (data: SesionPayload) =>
  api.post("/sesiones", data);

export const deleteSesion = (id: string) =>
  api.delete(`/sesiones/${id}`);
