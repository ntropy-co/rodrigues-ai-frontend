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
// Cookies imports removed

import { scheduleTokenRefresh } from '@/lib/auth/token-refresh'
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ContextUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token and user on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Try to fetch current user (cookies are sent automatically)
        const userData = await getCurrentUserApi()
        setUser(userData)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuth()
  }, [])

  // Schedule proactive token refresh when authenticated
  useEffect(() => {
    // Start proactive token refresh (checks periodically)
    // Only schedule if we have a user (implies authentication attempt succeeded)
    if (!user) return

    const cleanup = scheduleTokenRefresh(5 * 60 * 1000)

    return cleanup
  }, [user])

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

      await loginApi({ email, password })

      // Cookies are set by backend automatically

      // Fetch user data
      const userData = await getCurrentUserApi()
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
    setUser(null)

    toast.success('Logout realizado com sucesso!')
  }, [])

  const refetchUser = useCallback(async () => {
    try {
      const userData = await getCurrentUserApi()
      setUser(userData)
    } catch (error) {
      console.error('Failed to refetch user:', error)
      // Dont logout automatically on simple refetch failure, unless 401 (handled by interceptor?)
      // Actually, if refetch fails (e.g. 401), we might be logged out.
      // But let's let the user retry or let the UI handle it.
      // For now, if we can't get user, we assume logged out?
      // No, effectively we are logged out if we can't get user.
      setUser(null)
    }
  }, [])

  const value: AuthContextType = {
    user,
    token: null, // Token is not exposed to JS
    isLoading,
    isAuthenticated: !!user,
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
