import api from "./axiosClient";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  nombre: string;
  email: string;
  password: string;
};

export const registerRequest = (data: RegisterPayload) => {
  return api.post("/auth/register", data);
};

export const loginRequest = (data: LoginPayload) => {
  return api.post("/auth/login", data);
};
