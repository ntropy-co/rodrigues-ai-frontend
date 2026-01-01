/**
 * CPR Wizard API types (draft-based flow)
 * These types reflect the API wire format used by the BFF and backend.
 */

export type WizardDraftStatus = 'draft' | 'submitted' | 'completed' | 'expired'

export interface WizardProducer {
  name?: string
  cpf_cnpj?: string
  phone?: string
  email?: string
  address?: string
}

export interface WizardFarm {
  name?: string
  car?: string | null
  area_ha?: number
  state?: string
  city?: string
  address?: string
}

export interface WizardCrop {
  commodity?: string
  safra?: string
  expected_quantity?: number
  unit?: string
  planting_date?: string | null
  harvest_date?: string | null
}

export interface WizardValues {
  amount?: number
  quantity?: number
  unit_price?: number | null
  issue_date?: string
  due_date?: string
  delivery_place?: string
  correction_index?: 'IPCA' | 'IGP-M' | 'Nenhum'
}

export interface WizardGuarantor {
  name?: string
  cpf_cnpj?: string
  address?: string
}

export interface WizardGuarantees {
  types?: string[]
  description?: string
  has_guarantor?: boolean
  guarantor?: WizardGuarantor
}

export interface WizardData {
  producer?: WizardProducer
  farm?: WizardFarm
  crop?: WizardCrop
  values?: WizardValues
  guarantees?: WizardGuarantees
}

export interface WizardDraftResponse {
  draft_id: string
  status: WizardDraftStatus
  wizard_data?: WizardData
  current_step: number
  version: number
  document_url?: string
  created_at: string
  updated_at: string
  expires_at?: string
}

export interface WizardDraft {
  draftId: string
  status: WizardDraftStatus
  wizardData: WizardData
  currentStep: number
  version: number
  documentUrl?: string
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface WorkflowResponseApi {
  session_id: string
  workflow_type: 'criar_cpr'
  current_step: string
  is_waiting_input: boolean
  document_url?: string
}

export interface WorkflowResponse {
  sessionId: string
  workflowType: 'criar_cpr'
  currentStep: string
  isWaitingInput: boolean
  documentUrl?: string
}

export interface DraftSubmitResponseApi {
  draft: WizardDraftResponse
  workflow?: WorkflowResponseApi
}

export interface DraftSubmitResponse {
  draft: WizardDraft
  workflow?: WorkflowResponse
}

export interface DraftCreateRequest {
  wizard_data?: WizardData
  current_step?: number
  source?: string
}

export interface DraftUpdateRequest {
  wizard_data?: WizardData
  current_step?: number
  version?: number
}

export interface DraftSubmitRequest {
  confirm: boolean
}
