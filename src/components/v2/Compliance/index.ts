/**
 * Compliance Components
 *
 * Components for CPR compliance verification based on Lei 8.929/94.
 * Includes visual score gauge, requirement list, and main verifier component.
 */

// Main components
export {
  ComplianceScore,
  default as ComplianceScoreDefault
} from './ComplianceScore'
export {
  RequirementList,
  DEFAULT_REQUIREMENTS,
  default as RequirementListDefault
} from './RequirementList'
export {
  ComplianceVerifier,
  default as ComplianceVerifierDefault
} from './ComplianceVerifier'

// Types
export type { ComplianceGrade, ComplianceScoreProps } from './ComplianceScore'
export type {
  RequirementStatus,
  Requirement,
  RequirementCategory,
  RequirementListProps
} from './RequirementList'
export type {
  ExtractedData,
  ComplianceResult,
  ComplianceVerifierProps
} from './ComplianceVerifier'
