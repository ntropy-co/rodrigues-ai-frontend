'use client'

/**
 * Authentication Middleware
 * Route protection for Next.js pages
 */

import { useEffect, type ComponentType, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/types/auth'
import { useAuth } from '@/hooks/useAuthHook'

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  analyst: 2,
  admin: 3
}

/**
 * Checks if user role meets minimum required role
 */
export function hasMinimumRole(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// ============================================================================
// LOADING COMPONENT
// ============================================================================

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-verity-50 dark:bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-verity-900 border-t-transparent" />
        <p className="text-sm text-verity-700 dark:text-gray-400">
          Verificando autenticação...
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// REQUIRE AUTH HOC
// ============================================================================

interface WithAuthOptions {
  requiredRole?: UserRole
  redirectTo?: string
}

/**
 * Higher-Order Component that requires authentication
 * Redirects to login if not authenticated
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
): ComponentType<P> {
  const { requiredRole, redirectTo = '/login' } = options

  function AuthenticatedComponent(props: P) {
    const router = useRouter()
    const { user, isAuthenticated, isLoading, isInitialized } = useAuth()

    useEffect(() => {
      if (!isInitialized) return

      // Not authenticated - redirect to login
      if (!isLoading && !isAuthenticated) {
        const currentPath = window.location.pathname
        const searchParams = new URLSearchParams()
        if (currentPath !== '/') {
          searchParams.set('redirect', currentPath)
        }
        const redirectUrl = `${redirectTo}${searchParams.toString() ? `?${searchParams}` : ''}`
        router.push(redirectUrl)
        return
      }

      // Check role if required
      if (!isLoading && isAuthenticated && requiredRole && user) {
        if (!hasMinimumRole(user.role as UserRole, requiredRole)) {
          // User doesn't have required role - redirect to unauthorized or dashboard
          router.push('/unauthorized')
        }
      }
    }, [isLoading, isAuthenticated, isInitialized, user, router])

    // Show loading while checking auth
    if (isLoading || !isInitialized) {
      return <AuthLoadingScreen />
    }

    // Not authenticated yet (redirecting)
    if (!isAuthenticated) {
      return <AuthLoadingScreen />
    }

    // Check role
    if (
      requiredRole &&
      user &&
      !hasMinimumRole(user.role as UserRole, requiredRole)
    ) {
      return <AuthLoadingScreen />
    }

    // Render the protected component
    return <WrappedComponent {...props} />
  }

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return AuthenticatedComponent
}

// ============================================================================
// REQUIRE GUEST HOC (for login/signup pages)
// ============================================================================

interface WithGuestOptions {
  redirectTo?: string
}

/**
 * Higher-Order Component that requires user to NOT be authenticated
 * Redirects authenticated users away from login/signup pages
 */
export function withGuest<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithGuestOptions = {}
): ComponentType<P> {
  const { redirectTo = '/chat' } = options

  function GuestComponent(props: P) {
    const router = useRouter()
    const { isAuthenticated, isLoading, isInitialized } = useAuth()

    useEffect(() => {
      if (!isInitialized) return

      // If authenticated, redirect away
      if (!isLoading && isAuthenticated) {
        router.push(redirectTo)
      }
    }, [isLoading, isAuthenticated, isInitialized, router])

    // Show loading while checking
    if (isLoading || !isInitialized) {
      return <AuthLoadingScreen />
    }

    // If authenticated (redirecting)
    if (isAuthenticated) {
      return <AuthLoadingScreen />
    }

    return <WrappedComponent {...props} />
  }

  GuestComponent.displayName = `withGuest(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

  return GuestComponent
}

// ============================================================================
// AUTH GUARD COMPONENT
// ============================================================================

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: UserRole
  fallback?: ReactNode
  onUnauthenticated?: () => void
}

/**
 * Component-based auth guard (alternative to HOC)
 */
export function AuthGuard({
  children,
  requiredRole,
  fallback = <AuthLoadingScreen />,
  onUnauthenticated
}: AuthGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth()

  useEffect(() => {
    if (!isInitialized) return

    if (!isLoading && !isAuthenticated) {
      if (onUnauthenticated) {
        onUnauthenticated()
      } else {
        router.push('/login')
      }
    }
  }, [isLoading, isAuthenticated, isInitialized, onUnauthenticated, router])

  if (isLoading || !isInitialized) {
    return <>{fallback}</>
  }

  if (!isAuthenticated) {
    return <>{fallback}</>
  }

  if (
    requiredRole &&
    user &&
    !hasMinimumRole(user.role as UserRole, requiredRole)
  ) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// ============================================================================
// ROLE GUARD COMPONENT
// ============================================================================

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole
  fallback?: ReactNode
}

/**
 * Guards content based on user role
 */
export function RoleGuard({
  children,
  requiredRole,
  fallback = null
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <>{fallback}</>
  }

  if (!hasMinimumRole(user.role as UserRole, requiredRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
