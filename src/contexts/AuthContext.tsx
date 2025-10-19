'use client'

/**
 * Authentication Context Provider
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { toast } from 'sonner'
import type { AuthContextType, RegisterRequest, User } from '@/types/auth'
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi
} from '@/lib/auth-api'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'auth_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token and user on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY)
        if (storedToken) {
          setToken(storedToken)
          const userData = await getCurrentUserApi(storedToken)
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const authResponse = await loginApi({ username: email, password })
      const { access_token } = authResponse

      // Save token
      localStorage.setItem(TOKEN_KEY, access_token)
      setToken(access_token)

      // Fetch user data
      const userData = await getCurrentUserApi(access_token)
      setUser(userData)

      toast.success('Login realizado com sucesso!')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao fazer login'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setIsLoading(true)
      const userData = await registerApi(data)

      // Auto login after register
      await login(data.email, data.password)

      toast.success('Conta criada com sucesso!')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar conta'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [login])

  const logout = useCallback(() => {
    if (token) {
      logoutApi(token).catch(console.error)
    }
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    toast.success('Logout realizado com sucesso!')
  }, [token])

  const refetchUser = useCallback(async () => {
    if (!token) return

    try {
      const userData = await getCurrentUserApi(token)
      setUser(userData)
    } catch (error) {
      console.error('Failed to refetch user:', error)
      logout()
    }
  }, [token, logout])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refetchUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
