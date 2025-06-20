import { API } from '../lib/api'

/**
 * Logout totale: redirect + clear
 */
export function logout() {
  // Eventualmente: clear token in auth context
  window.location.href = '/login'
}

/**
 * Tenta di rigenerare il token chiamando /api/auth/refresh
 * Assumiamo che il cookie HttpOnly refreshToken sia già presente
 */
export async function tryRefreshToken(): Promise<string> {
  const res = await fetch(`${API.authRefresh}`, {
    method: 'POST',
    credentials: 'include' // 👈 importante per mandare il cookie
  })

  if (!res.ok) {
    throw new Error('Impossibile rigenerare la sessione')
  }

  const data = await res.json()
  return data.token
}
