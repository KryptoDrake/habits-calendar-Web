import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import type { UserProfile } from '../lib/types'
import {
  getStoredProfile,
  getCachedToken,
  login as authLogin,
  logout as authLogout,
  saveInitialToken,
  setGistIdOverride,
} from '../lib/auth'

interface AuthState {
  user: UserProfile | null
  token: string | null
  needsToken: boolean
  loggingIn: boolean
  login: (code: string) => Promise<'ok' | 'invalid' | 'no-token'>
  logout: () => void
  submitToken: (token: string) => Promise<boolean>
  changeToken: () => void
  updateGistId: (gistId: string) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getStoredProfile)
  const [token, setToken] = useState<string | null>(getCachedToken)
  const [needsToken, setNeedsToken] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)

  // Login-Code zwischenspeichern für Token-Verschlüsselung
  const loginCodeRef = useRef<string>('')

  const login = useCallback(async (code: string): Promise<'ok' | 'invalid' | 'no-token'> => {
    setLoggingIn(true)
    try {
      const result = await authLogin(code)
      if (!result) return 'invalid'

      loginCodeRef.current = code.trim()
      setUser(result.profile)

      if (result.token) {
        setToken(result.token)
        return 'ok'
      } else {
        // Kein Token in Firebase → User muss einmalig Token eingeben
        setNeedsToken(true)
        return 'no-token'
      }
    } finally {
      setLoggingIn(false)
    }
  }, [])

  const submitToken = useCallback(async (githubToken: string): Promise<boolean> => {
    if (!user) return false
    try {
      await saveInitialToken(loginCodeRef.current, user.id, githubToken)
      setToken(githubToken)
      setNeedsToken(false)
      return true
    } catch {
      return false
    }
  }, [user])

  const updateGistId = useCallback((gistId: string) => {
    if (!user) return
    setGistIdOverride(user.id, gistId)
    setUser({ ...user, gistId })
  }, [user])

  const changeToken = useCallback(() => {
    localStorage.removeItem('hc_github_token')
    setToken(null)
    setNeedsToken(true)
  }, [])

  const logout = useCallback(() => {
    authLogout()
    loginCodeRef.current = ''
    setUser(null)
    setToken(null)
    setNeedsToken(false)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, needsToken, loggingIn, login, logout, submitToken, changeToken, updateGistId }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
