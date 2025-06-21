import { API } from "../lib/api";

export function logout() {
  window.location.href = "/login";
}

export async function tryRefreshToken(): Promise<string> {
  const res = await fetch(`${API.authRefresh}`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Impossible to regenerate session");
  }

  const data = await res.json();
  return data.token;
}
