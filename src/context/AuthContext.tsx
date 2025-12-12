import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loginRequest, registerRequest, type LoginPayload, type RegisterPayload } from "../api/authApi";


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

  // Al montar, recuperar token/usuario del storage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = async (data: LoginPayload): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await loginRequest(data);
      const { token, usuario } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(usuario));
      setUser(usuario);

      return true;
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

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
