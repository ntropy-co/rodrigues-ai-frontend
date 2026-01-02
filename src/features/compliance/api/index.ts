import {
  ComplianceVerifyRequest,
  ComplianceVerifyResponse,
  ComplianceDashboard
} from '../types'

/**
 * Compliance API layer
 */
export const complianceApi = {
  /**
   * Verify a document for compliance
   */
  async verify(
    data: ComplianceVerifyRequest
  ): Promise<ComplianceVerifyResponse> {
    const response = await fetch('/api/compliance/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      let errorMessage = 'Erro ao verificar compliance'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch {
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  },

  /**
   * Get compliance dashboard metrics
   */
  async getDashboard(): Promise<ComplianceDashboard> {
    const response = await fetch('/api/compliance/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      let errorMessage = 'Erro ao obter dashboard'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch {
        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }
}
