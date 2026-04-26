"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin?: boolean;
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthContextValue = {
  isReady: boolean;
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await readJson<{ user: AuthUser | null }>(response);
      setUser(payload?.user ?? null);
    } catch (error) {
      console.warn("Не удалось получить текущую сессию", error);
      setUser(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const register = useCallback(async ({ name, email, password }: RegisterPayload) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = await readJson<{ user?: AuthUser; error?: string }>(response);
      if (!response.ok || !payload?.user) {
        return { ok: false, error: payload?.error ?? "Не удалось создать аккаунт." };
      }

      setUser(payload.user);
      return { ok: true };
    } catch (error) {
      console.warn("Не удалось отправить регистрацию", error);
      return { ok: false, error: "Не удалось создать аккаунт." };
    }
  }, []);

  const login = useCallback(async ({ email, password }: LoginPayload) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await readJson<{ user?: AuthUser; error?: string }>(response);
      if (!response.ok || !payload?.user) {
        return { ok: false, error: payload?.error ?? "Не удалось войти." };
      }

      setUser(payload.user);
      return { ok: true };
    } catch (error) {
      console.warn("Не удалось выполнить вход", error);
      return { ok: false, error: "Не удалось войти." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("Не удалось завершить сессию", error);
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      user,
      login,
      logout,
      register,
      refreshUser,
    }),
    [isReady, login, logout, refreshUser, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
