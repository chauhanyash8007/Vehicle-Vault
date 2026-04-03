import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "vehicle_vault_auth";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth?.token) {
      setAuthToken(auth.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      setAuthToken(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  // Listen for 401 auto-logout event from api interceptor
  useEffect(() => {
    const handler = () => setAuth(null);
    window.addEventListener("vv:unauthorized", handler);
    return () => window.removeEventListener("vv:unauthorized", handler);
  }, []);

  const value = useMemo(
    () => ({
      auth,
      isLoggedIn: Boolean(auth?.token),
      isAdmin: auth?.role === "admin",
      async login(payload) {
        const { data } = await api.post("/api/auth/login", payload);
        setAuth(data);
        return data;
      },
      async register(payload) {
        const { data } = await api.post("/api/auth/register", payload);
        setAuth(data);
        return data;
      },
      logout() {
        setAuth(null);
      },
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
