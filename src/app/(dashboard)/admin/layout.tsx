'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuthHook'
import type { UserRole } from '@/types/auth'

/**
 * Admin Layout
 *
 * Protects all admin routes requiring 'admin' role.
 * Redirects unauthorized users to /unauthorized page.
 */
export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth()

  useEffect(() => {
    if (!isInitialized || isLoading) return

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin')
      return
    }

    // Check role - only admin can access
    if (user && (user.role as UserRole) !== 'admin') {
      router.push('/unauthorized')
    }
  }, [isLoading, isAuthenticated, isInitialized, user, router])

  // Show loading while checking auth
  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-verity-50 dark:bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-verity-900 border-t-transparent" />
          <p className="text-sm text-verity-700 dark:text-gray-400">
            Verificando permissões...
          </p>
        </div>
      </div>
    )
  }

  // Not authenticated or unauthorized (redirecting)
  if (!isAuthenticated || (user && (user.role as UserRole) !== 'admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-verity-50 dark:bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-verity-900 border-t-transparent" />
          <p className="text-sm text-verity-700 dark:text-gray-400">
            Redirecionando...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Admin Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/chat"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                &larr; Voltar
              </a>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Administração
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="/admin"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Dashboard
              </a>
              <a
                href="/admin/users"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Usuários
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
