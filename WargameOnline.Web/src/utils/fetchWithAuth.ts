import { logout, tryRefreshToken } from '../auth/sessionManager'
import { API } from '../lib/api'

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  token?: string,
  onTokenRefresh?: (newToken: string) => void
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (res.status === 401) {
    try {
      const newToken = await tryRefreshToken()
      if (onTokenRefresh) onTokenRefresh(newToken)

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      }

      res = await fetch(url, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      })
    } catch (err) {
      logout()
      throw new Error('Sessione scaduta.')
    }
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => `${res.status} ${res.statusText}`)
    throw new Error(msg)
  }

  const contentType = res.headers.get('Content-Type') || ''
  if (res.status === 204 || res.headers.get('Content-Length') === '0') return {} as T
  if (contentType.includes('application/json')) return res.json()

  throw new Error('Risposta non JSON')
}
