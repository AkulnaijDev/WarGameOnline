import { createContext, useContext, useEffect, useState } from 'react'
import { resetSocket } from '../hooks/useSocket'
import { API } from '../lib/api'
import { useTranslation } from "react-i18next";



type AuthContextType = {
  token: string | null
  setToken: (t: string | null) => void
  currentUserId: number | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<void>
  getMe: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const { t } = useTranslation();
  useEffect(() => {
    if (!token) {
      setCurrentUserId(null)
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const id = parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'])
      setCurrentUserId(id)
    } catch {
      setCurrentUserId(null)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await fetch(API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) throw new Error(t('loginFailed'))

    const data = await res.json()
    setToken(data.token)
  }

  const logout = () => {
    setToken(null)
    setCurrentUserId(null)
    resetSocket()
    window.connection?.stop()
    window.connection = undefined
  }

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch(API.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })

    if (!res.ok) throw new Error(t('registrationFailed'))
  }

  const getMe = async () => {
    if (!token) throw new Error(t('missingToken'))

    const res = await fetch(API.friendsMe, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) throw new Error(t('unauthorized'))
    return await res.json()
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        currentUserId,
        isAuthenticated: !!token,
        login,
        logout,
        register,
        getMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const { t } = useTranslation();
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error(t('authProviderAlert'))
  return ctx
}
