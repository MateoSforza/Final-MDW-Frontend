import api from "./axiosClient";

export type Actividad = {
  _id: string;
  nombre: string;
  categoria?: string;
  color?: string;
  activa: boolean;
  usuarioId: string;
  creadaEn?: string;
};

export type CrearActividadPayload = {
  nombre: string;
  categoria?: string;
  color?: string;
};

export type ActualizarActividadPayload = {
  nombre?: string;
  categoria?: string;
  color?: string;
  activa?: boolean;
};

export const getActividadesRequest = () => api.get<Actividad[]>("/actividades");
export const crearActividadRequest = (data: CrearActividadPayload) =>
  api.post<Actividad>("/actividades", data);
export const actualizarActividadRequest = (id: string, data: ActualizarActividadPayload) =>
  api.put<Actividad>(`/actividades/${id}`, data);
export const eliminarActividadRequest = (id: string) =>
  api.delete(`/actividades/${id}`);