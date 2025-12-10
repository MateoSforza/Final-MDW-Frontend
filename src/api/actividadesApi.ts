import api from "./axiosClient";

export interface ActividadPayload {
  nombre: string;
  categoria: string;
  color: string;
}

export const getActividades = () => api.get("/actividades");

export const createActividad = (data: ActividadPayload) =>
  api.post("/actividades", data);

export const updateActividad = (id: string, data: ActividadPayload) =>
  api.put(`/actividades/${id}`, data);

export const deleteActividad = (id: string) =>
  api.delete(`/actividades/${id}`);
