import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API } from "../lib/api";

type AuthInfo = {
  token: string | null;
  currentUserId: number | null;
  login: (email: string, password: string) => Promise<any>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  getMe: () => Promise<any>;
};

export function useAuth(): AuthInfo {
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!token) {
      setCurrentUserId(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const id = parseInt(
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ]
      );
      setCurrentUserId(id);
    } catch (err) {
      console.error("JWT decode error:", err);
      setCurrentUserId(null);
    }
  }, [token]);

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    const res = await fetch(`${API.register}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error(t("registrationFailed"));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API.login}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(t("loginFailed"));
    const data = await res.json();
    setToken(data.token);
    return data;
  };

  const logout = () => {
    setToken(null);
    setCurrentUserId(null);
  };

  const getMe = async () => {
    if (!token) throw new Error(t("missingToken"));
    const res = await fetch(`${API.usersMe}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(t("accessDenied"));
    return await res.json();
  };

  return {
    token,
    currentUserId,
    login,
    register,
    logout,
    getMe,
  };
}
