'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, type User } from './api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('pharmacy_token')
    localStorage.removeItem('pharmacy_user')
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authApi.login(username, password)
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('pharmacy_token', response.token)
      localStorage.setItem('pharmacy_user', JSON.stringify(response.user))
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const hydrate = async () => {
      const savedToken = localStorage.getItem('pharmacy_token')
      const savedUser = localStorage.getItem('pharmacy_user')

      if (!savedToken || !savedUser) {
        setIsLoading(false)
        return
      }

      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        const me = await authApi.me()
        setUser(me)
      } catch {
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    hydrate()
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
