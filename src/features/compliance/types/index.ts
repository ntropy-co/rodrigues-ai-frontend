/**
 * Compliance requirement status
 */
export interface ComplianceRequirement {
  id: string
  name: string
  status: 'passed' | 'failed' | 'warning'
  description?: string
  severity: 'critical' | 'major' | 'minor'
}

/**
 * Request data for compliance verification
 */
export interface ComplianceVerifyRequest {
  document_id: string
  extracted_data: Record<string, unknown>
  force_refresh?: boolean
}

/**
 * Response from compliance verification
 */
export interface ComplianceVerifyResponse {
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  requirements: ComplianceRequirement[]
  recommendations: string[]
  details: Record<string, unknown>
}

/**
 * Recent verification entry
 */
export interface RecentVerification {
  id: string
  document_id: string
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  verified_at: string
}

/**
 * Dashboard data
 */
export interface ComplianceDashboard {
  total_verified: number
  compliance_rate: number // 0-100
  recent_verifications: RecentVerification[]
}
