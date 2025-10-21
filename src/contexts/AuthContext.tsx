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
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken
} from '@/lib/auth-cookies'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import {
  loginRateLimiter,
  registerRateLimiter,
  RATE_LIMIT_CONFIGS
} from '@/lib/utils/rate-limiter'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token and user on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = getAuthToken()
        if (storedToken) {
          setToken(storedToken)
          const userData = await getCurrentUserApi(storedToken)
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        removeAuthToken()
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

      // Rate limiting: verificar se não excedeu tentativas
      const { maxAttempts, windowMs, message: rateLimitMessage } =
        RATE_LIMIT_CONFIGS.login
      if (!loginRateLimiter.canAttempt('login', maxAttempts, windowMs)) {
        toast.error(rateLimitMessage)
        throw new Error(rateLimitMessage)
      }

      // Validação de input com Zod
      const validatedData = loginSchema.parse({ username: email, password })

      const authResponse = await loginApi(validatedData)
      const { access_token } = authResponse

      // Save token in secure cookie
      setAuthToken(access_token)
      setToken(access_token)

      // Fetch user data
      const userData = await getCurrentUserApi(access_token)
      setUser(userData)

      // Reset rate limiter on successful login
      loginRateLimiter.reset('login')

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

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        setIsLoading(true)

        // Rate limiting: verificar se não excedeu tentativas
        const { maxAttempts, windowMs, message: rateLimitMessage } =
          RATE_LIMIT_CONFIGS.register
        if (!registerRateLimiter.canAttempt('register', maxAttempts, windowMs)) {
          toast.error(rateLimitMessage)
          throw new Error(rateLimitMessage)
        }

        // Nota: validação do RegisterRequest pode ser feita no componente de formulário
        // com confirmPassword antes de chamar esta função
        await registerApi(data)

        // Reset rate limiter on successful registration
        registerRateLimiter.reset('register')

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
    },
    [login]
  )

  const logout = useCallback(() => {
    if (token) {
      logoutApi(token).catch(console.error)
    }
    removeAuthToken()
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
