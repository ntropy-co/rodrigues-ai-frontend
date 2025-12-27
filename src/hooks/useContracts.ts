'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'

/**
 * Contract type codes
 */
export type ContractType =
  | 'compra_venda'
  | 'arrendamento'
  | 'parceria'
  | 'financiamento'

/**
 * Information about a contract type
 */
export interface ContractTypeInfo {
  code: string
  name: string
  description: string
}

/**
 * Response from contract types endpoint
 */
export interface ContractTypesResponse {
  types: ContractTypeInfo[]
}

/**
 * Request payload for generating a contract
 */
export interface ContractGenerateRequest {
  contract_type: ContractType
  data: Record<string, unknown>
  generate_pdf?: boolean
  generate_docx?: boolean
}

/**
 * Response from contract generation
 */
export interface ContractGenerateResponse {
  pdf_url: string | null
  docx_url: string | null
  contract_type: string
  errors: string[]
}

/**
 * A single field in a contract template
 */
export interface ContractTemplateField {
  name: string
  type: string
  description: string
}

/**
 * Contract template structure
 */
export interface ContractTemplate {
  contract_type: string
  required_fields: ContractTemplateField[]
  optional_fields: ContractTemplateField[]
}

/**
 * Hook for managing contracts
 */
export function useContracts() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  /**
   * Fetch all available contract types
   */
  const fetchContractTypes = useCallback(async (): Promise<
    ContractTypeInfo[]
  > => {
    if (!token) {
      console.log('[useContracts] No token available, skipping fetch')
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithRefresh('/api/contracts/types', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn(
          '[useContracts] Response not OK:',
          response.status,
          errorData
        )
        if (response.status === 401 || response.status === 404) {
          return []
        }
        throw new Error(
          errorData.detail || 'Erro ao carregar tipos de contrato'
        )
      }

      const data: ContractTypesResponse = await response.json()
      return data.types
    } catch (err) {
      console.error('[useContracts] Error fetching contract types:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [token])

  /**
   * Generate a contract document
   */
  const generateContract = useCallback(
    async (
      request: ContractGenerateRequest
    ): Promise<ContractGenerateResponse | null> => {
      if (!token) {
        console.log('[useContracts] No token available, skipping generation')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh('/api/contracts/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useContracts] Generate response not OK:',
            response.status,
            errorData
          )
          throw new Error(errorData.detail || 'Erro ao gerar contrato')
        }

        const data: ContractGenerateResponse = await response.json()
        return data
      } catch (err) {
        console.error('[useContracts] Error generating contract:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  /**
   * Fetch template structure for a contract type
   */
  const fetchTemplate = useCallback(
    async (contractType: ContractType): Promise<ContractTemplate | null> => {
      if (!token) {
        console.log('[useContracts] No token available, skipping fetch')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetchWithRefresh(
          `/api/contracts/template/${contractType}`,
          {
            method: 'GET'
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn(
            '[useContracts] Template response not OK:',
            response.status,
            errorData
          )
          if (response.status === 404) {
            throw new Error('Template de contrato não encontrado')
          }
          throw new Error(
            errorData.detail || 'Erro ao carregar template de contrato'
          )
        }

        const data: ContractTemplate = await response.json()
        return data
      } catch (err) {
        console.error('[useContracts] Error fetching template:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        return null
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  return {
    loading,
    error,
    fetchContractTypes,
    generateContract,
    fetchTemplate
  }
}
