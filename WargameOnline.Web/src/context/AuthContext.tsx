import { createContext, useContext, useEffect, useState } from 'react'
import { resetSocket } from '../hooks/useSocket'

type AuthContextType = {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored === 'true') setIsAuthenticated(true)
  }, [])

  const login = () => {
    setIsAuthenticated(true)
    localStorage.setItem('auth', 'true')
  }

  const logout = () => {
    setIsAuthenticated(false)
    resetSocket()
    localStorage.removeItem('auth')
    localStorage.removeItem('token')
    window.connection?.stop()
    window.connection = undefined
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)!
