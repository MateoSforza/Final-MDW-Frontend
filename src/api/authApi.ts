import api from "./axiosClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

export const loginRequest = (data: LoginPayload) =>
  api.post("/auth/login", data);

export const registerRequest = (data: RegisterPayload) =>
  api.post("/auth/register", data);
