'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/features/auth'
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
          <p className="text-sm text-verity-700 dark:text-verity-300">
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
          <p className="text-sm text-verity-700 dark:text-verity-300">
            Redirecionando...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-background">
      {/* Admin Header */}
      <div className="border-b border-sand-300 bg-white dark:border-verity-800 dark:bg-verity-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/chat"
                className="text-sand-500 text-sm hover:text-verity-600 dark:text-verity-300 dark:hover:text-sand-300"
              >
                &larr; Voltar
              </Link>
              <span className="text-lg font-semibold text-verity-900 dark:text-white">
                Administração
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm font-medium text-verity-500 hover:text-verity-900 dark:text-sand-400 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="text-sm font-medium text-verity-500 hover:text-verity-900 dark:text-sand-400 dark:hover:text-white"
              >
                Usuários
              </Link>
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
