// src/hooks/useAuth.ts
import { useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error("Failed registration");
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Failed login");
    const data = await res.json();
    setToken(data.token);
    return data;
  };

  const getMe = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return await res.json();
  };

  return { register, login, getMe, token };
}
