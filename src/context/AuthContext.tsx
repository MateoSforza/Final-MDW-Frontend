import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "react-hot-toast";
import { loginRequest, registerRequest, getCurrentUser, logoutRequest } from "../api/authApi";
import type {LoginPayload, RegisterPayload} from "../api/authApi";


interface User {
  id: string;
  nombre: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginPayload) => Promise<boolean>;
  register: (data: RegisterPayload) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Al montar, consultar al backend si hay sesión activa (cookie HttpOnly)
  useEffect(() => {
    (async () => {
      try {
        const res = await getCurrentUser();
        const usuario = res.data?.usuario ?? res.data?.user ?? null;
        if (usuario) setUser(usuario);
      } catch (err) {
        // no session
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (data: LoginPayload): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await loginRequest(data);
      // El backend debería establecer la cookie HttpOnly; el body puede devolver el usuario
      const usuario = res.data?.usuario ?? res.data?.user ?? null;
      if (usuario) {
        setUser(usuario);
        return true;
      }

      // Si no venía el usuario, consultamos el endpoint /me
      const me = await getCurrentUser();
      const meUser = me.data?.usuario ?? me.data?.user ?? null;
      if (meUser) {
        setUser(meUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterPayload): Promise<boolean> => {
    setLoading(true);
    try {
      await registerRequest(data);
      // después de registrarse, lo ideal es redirigir a login
      return true;
    } catch (error) {
      console.error("Error en registro:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {}
    setUser(null);
  };

  // Escuchar evento global cuando axios detecta sesión expirada
  useEffect(() => {
    const handler = () => {
      void logout();
      toast.error("Tu sesión expiró");
    };
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
}