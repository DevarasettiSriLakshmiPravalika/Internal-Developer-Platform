import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CurrentUser } from '../types/auth'
import { getCurrentUser } from '../services/api'

interface AuthState {
  user: CurrentUser | null
  token: string | null
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    window.localStorage.getItem('forgeflow.accessToken'),
  )
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // On mount (or token change), try to load the current user
  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    getCurrentUser(token)
      .then((u) => setUser(u))
      .catch(() => {
        // Token is invalid / expired — clear it
        window.localStorage.removeItem('forgeflow.accessToken')
        setToken(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  async function login(newToken: string) {
    window.localStorage.setItem('forgeflow.accessToken', newToken)
    setToken(newToken)
    const u = await getCurrentUser(newToken)
    setUser(u)
  }

  function logout() {
    window.localStorage.removeItem('forgeflow.accessToken')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
