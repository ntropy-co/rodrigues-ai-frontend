'use client'

/**
 * React Query Provider
 *
 * Configura o QueryClient com:
 * - Retry automático para erros de rede
 * - StaleTime otimizado
 * - Error handling global
 *
 * @example
 * // Em layout.tsx
 * <QueryProvider>
 *   {children}
 * </QueryProvider>
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'

// =============================================================================
// Error Messages (PT-BR)
// =============================================================================

const DEFAULT_ERROR_MESSAGE =
  'Ocorreu um erro ao carregar os dados. Tente novamente.'
const NETWORK_ERROR_MESSAGE = 'Erro de conexão. Verifique sua internet.'

// =============================================================================
// Query Client Configuration
// =============================================================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Dados ficam "frescos" por 30 segundos
        staleTime: 30 * 1000,
        // Cache por 5 minutos
        gcTime: 5 * 60 * 1000,
        // Retry apenas para erros de rede/servidor
        retry: (failureCount, error) => {
          // Não retry para erros de autenticação
          if (error instanceof Error && error.message.includes('401')) {
            return false
          }
          // Máximo 2 retries
          return failureCount < 2
        },
        // Delay exponencial entre retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        // Não refetch automático em window focus (pode ser pesado)
        refetchOnWindowFocus: false
      },
      mutations: {
        // Retry apenas 1 vez para mutations
        retry: 1,
        onError: (error) => {
          // Global mutation error handler
          const message =
            error instanceof TypeError
              ? NETWORK_ERROR_MESSAGE
              : error instanceof Error
                ? error.message
                : DEFAULT_ERROR_MESSAGE

          toast.error(message)

          // Log in development
          if (process.env.NODE_ENV === 'development') {
            console.error('[React Query Mutation Error]', error)
          }
        }
      }
    }
  })
}

// =============================================================================
// Provider Component
// =============================================================================

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create client once per component instance
  // Using useState to ensure it's only created once on the client
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default QueryProvider
