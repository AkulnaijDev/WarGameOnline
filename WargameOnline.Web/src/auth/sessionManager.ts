import { API } from "../lib/api";
import { useTranslation } from "react-i18next";

export function logout() {
  window.location.href = "/login";
}

export async function tryRefreshToken(): Promise<string> {
  const { t } = useTranslation();
  const res = await fetch(`${API.authRefresh}`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(t("impossibleRegenerateSession"));
  }

  const data = await res.json();
  return data.token;
}
