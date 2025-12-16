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
import type { RegisterRequest } from '@/types/auth'
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi
} from '@/lib/auth/api'
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  setRefreshToken,
  removeRefreshToken
} from '@/lib/auth/cookies'
import { loginSchema } from '@/lib/auth/validations'
import {
  loginRateLimiter,
  registerRateLimiter,
  RATE_LIMIT_CONFIGS
} from '@/lib/utils/rate-limiter'
import { identify, trackLogin, trackSignup, trackLogout } from '@/lib/analytics'

// Simplified user type for context (matches API /auth/me response)
interface ContextUser {
  id: string
  email: string
  name: string
  role: string
}

// Context type matching the simplified user
interface AuthContextType {
  user: ContextUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ContextUser | null>(null)
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
        removeRefreshToken()
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
      const {
        maxAttempts,
        windowMs,
        message: rateLimitMessage
      } = RATE_LIMIT_CONFIGS.login
      if (!loginRateLimiter.canAttempt('login', maxAttempts, windowMs)) {
        toast.error(rateLimitMessage)
        throw new Error(rateLimitMessage)
      }

      // Validação de input com Zod
      loginSchema.parse({ username: email, password })

      const authResponse = await loginApi({ email, password })
      const { token: accessToken } = authResponse

      // Save token in secure cookie
      setAuthToken(accessToken)
      if (authResponse.refreshToken) {
        setRefreshToken(authResponse.refreshToken)
      }
      setToken(accessToken)

      // Fetch user data
      const userData = await getCurrentUserApi(accessToken)
      setUser(userData)

      // Reset rate limiter on successful login
      loginRateLimiter.reset('login')

      // Identify user in analytics
      identify(userData.id, {
        email: userData.email,
        name: userData.name,
        role: userData.role
      })

      // Track login event
      trackLogin(userData.id, 'email')

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
        const {
          maxAttempts,
          windowMs,
          message: rateLimitMessage
        } = RATE_LIMIT_CONFIGS.register
        if (
          !registerRateLimiter.canAttempt('register', maxAttempts, windowMs)
        ) {
          toast.error(rateLimitMessage)
          throw new Error(rateLimitMessage)
        }

        // Nota: validação do RegisterRequest pode ser feita no componente de formulário
        // com confirmPassword antes de chamar esta função
        await registerApi({
          inviteToken: data.inviteToken || '',
          email: data.email,
          password: data.password,
          name: data.name
        })

        // Reset rate limiter on successful registration
        registerRateLimiter.reset('register')

        // Track signup event
        trackSignup('email')

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
    // Track logout and reset analytics identity
    trackLogout()

    logoutApi().catch(console.error)
    removeAuthToken()
    removeRefreshToken()
    setToken(null)
    setUser(null)
    toast.success('Logout realizado com sucesso!')
  }, [])

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
