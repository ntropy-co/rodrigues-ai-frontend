/**
 * Centralized Analytics Event Definitions
 *
 * This file contains all analytics event names and their property types.
 * Use these constants instead of hardcoding event names to:
 * - Avoid typos
 * - Enable autocomplete
 * - Ensure type safety
 * - Facilitate event auditing
 */

// =============================================================================
// Event Names
// =============================================================================

export const ANALYTICS_EVENTS = {
  // Authentication
  USER_LOGGED_IN: 'user_logged_in',
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_OUT: 'user_logged_out',
  PASSWORD_RESET_REQUESTED: 'password_reset_requested',
  PASSWORD_RESET_COMPLETED: 'password_reset_completed',
  AUTH_ERROR: 'auth_error',

  // Chat
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  CHAT_RESPONSE_RECEIVED: 'chat_response_received',
  CHAT_FEEDBACK_GIVEN: 'chat_feedback_given',
  CHAT_ERROR: 'chat_error',
  CHAT_SESSION_STARTED: 'chat_session_started',

  // Documents
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_VIEWED: 'document_viewed',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_DELETED: 'document_deleted',
  EXPORT_PDF_START: 'export_pdf_start',
  EXPORT_PDF_SUCCESS: 'export_pdf_success',
  EXPORT_PDF_ERROR: 'export_pdf_error',

  // CPR (Core Business)
  CPR_QUICK_ACTION_CLICKED: 'cpr_quick_action_clicked',
  CPR_ANALYSIS_STARTED: 'cpr_analysis_started',
  CPR_ANALYSIS_COMPLETED: 'cpr_analysis_completed',
  CPR_DRAFT_STARTED: 'cpr_draft_started',
  CPR_DRAFT_COMPLETED: 'cpr_draft_completed',
  CPR_SIMULATION_RUN: 'cpr_simulation_run',

  // Search & Navigation
  SEARCH_QUERY_SUBMITTED: 'search_query_submitted',
  SEARCH_NO_RESULTS: 'search_no_results',
  CONVERSATION_SELECTED: 'conversation_selected',
  PROJECT_SELECTED: 'project_selected',

  // UI Interactions
  MENU_ITEM_CLICKED: 'menu_item_clicked',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',

  // Errors
  ERROR_BOUNDARY_TRIGGERED: 'error_boundary_triggered',
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',

  // Engagement
  PAGE_SCROLL_DEPTH: 'page_scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  FEATURE_USED: 'feature_used',

  // Performance
  WEB_VITAL_REPORTED: 'web_vital_reported'
} as const

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

// =============================================================================
// Event Property Types
// =============================================================================

export interface AuthEventProperties {
  [ANALYTICS_EVENTS.USER_LOGGED_IN]: {
    method: 'email' | 'google' | 'invite'
    user_id: string
  }
  [ANALYTICS_EVENTS.USER_SIGNED_UP]: {
    method: 'email' | 'google' | 'invite'
  }
  [ANALYTICS_EVENTS.USER_LOGGED_OUT]: {
    session_duration_seconds?: number
  }
  [ANALYTICS_EVENTS.PASSWORD_RESET_REQUESTED]: {
    email_provided: boolean
  }
  [ANALYTICS_EVENTS.PASSWORD_RESET_COMPLETED]: Record<string, never>
  [ANALYTICS_EVENTS.AUTH_ERROR]: {
    error_type: string
    error_message: string
  }
}

export interface ChatEventProperties {
  [ANALYTICS_EVENTS.CHAT_MESSAGE_SENT]: {
    session_id: string
    message_length: number
    has_files: boolean
    file_count: number
    is_new_session: boolean
  }
  [ANALYTICS_EVENTS.CHAT_RESPONSE_RECEIVED]: {
    session_id: string
    response_time_ms: number
    response_length: number
  }
  [ANALYTICS_EVENTS.CHAT_FEEDBACK_GIVEN]: {
    message_id: string
    feedback_type: 'like' | 'dislike'
    session_id: string
  }
  [ANALYTICS_EVENTS.CHAT_ERROR]: {
    session_id: string
    error_type: string
    error_message: string
  }
  [ANALYTICS_EVENTS.CHAT_SESSION_STARTED]: {
    session_id: string
    source: 'new' | 'existing'
  }
}

export interface DocumentEventProperties {
  [ANALYTICS_EVENTS.DOCUMENT_UPLOADED]: {
    document_id: string
    file_name: string
    file_size: number
    file_type: string
    file_category: string
    conversation_id?: string
    session_id?: string
    user_id?: string
  }
  [ANALYTICS_EVENTS.DOCUMENT_VIEWED]: {
    document_id: string
    file_name: string
    file_type: string
  }
  [ANALYTICS_EVENTS.DOCUMENT_DOWNLOADED]: {
    document_id: string
    file_name: string
    file_type: string
  }
  [ANALYTICS_EVENTS.DOCUMENT_DELETED]: {
    document_id: string
  }
}

export interface CPREventProperties {
  [ANALYTICS_EVENTS.CPR_QUICK_ACTION_CLICKED]: {
    action_type: string
    action_label: string
  }
  [ANALYTICS_EVENTS.CPR_ANALYSIS_STARTED]: {
    source: 'chat' | 'quick_action' | 'upload'
    document_id?: string
  }
  [ANALYTICS_EVENTS.CPR_ANALYSIS_COMPLETED]: {
    document_id: string
    analysis_time_ms: number
  }
  [ANALYTICS_EVENTS.CPR_DRAFT_STARTED]: {
    source: 'chat' | 'quick_action' | 'wizard'
    template_type?: string
  }
  [ANALYTICS_EVENTS.CPR_DRAFT_COMPLETED]: {
    draft_id: string
    template_type: string
  }
  [ANALYTICS_EVENTS.CPR_SIMULATION_RUN]: {
    simulation_type: string
    parameters: Record<string, unknown>
  }
}

export interface SearchEventProperties {
  [ANALYTICS_EVENTS.SEARCH_QUERY_SUBMITTED]: {
    query: string
    results_count: number
  }
  [ANALYTICS_EVENTS.SEARCH_NO_RESULTS]: {
    query: string
  }
  [ANALYTICS_EVENTS.CONVERSATION_SELECTED]: {
    session_id: string
    source: 'sidebar' | 'search' | 'recent'
  }
  [ANALYTICS_EVENTS.PROJECT_SELECTED]: {
    project_id: string
  }
}

export interface UIEventProperties {
  [ANALYTICS_EVENTS.MENU_ITEM_CLICKED]: {
    item_name: string
    item_path?: string
  }
  [ANALYTICS_EVENTS.MODAL_OPENED]: {
    modal_name: string
  }
  [ANALYTICS_EVENTS.MODAL_CLOSED]: {
    modal_name: string
    close_reason?: 'button' | 'backdrop' | 'escape'
  }
}

export interface ErrorEventProperties {
  [ANALYTICS_EVENTS.ERROR_BOUNDARY_TRIGGERED]: {
    error_message: string
    error_stack?: string
    component_name?: string
  }
  [ANALYTICS_EVENTS.API_ERROR]: {
    endpoint: string
    status_code: number
    error_message: string
  }
  [ANALYTICS_EVENTS.VALIDATION_ERROR]: {
    field: string
    error_type: string
  }
}

export interface EngagementEventProperties {
  [ANALYTICS_EVENTS.PAGE_SCROLL_DEPTH]: {
    depth_percent: number
    page_path: string
  }
  [ANALYTICS_EVENTS.TIME_ON_PAGE]: {
    duration_seconds: number
    page_path: string
  }
  [ANALYTICS_EVENTS.FEATURE_USED]: {
    feature_name: string
    feature_category: string
  }
}

// Performance
export interface WebVitalsEventProperties {
  [ANALYTICS_EVENTS.WEB_VITAL_REPORTED]: {
    name: string
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    delta?: number
    id?: string
    navigationType?: string
    route: string
  }
}

// Combined event properties type
export type EventProperties = AuthEventProperties &
  ChatEventProperties &
  DocumentEventProperties &
  CPREventProperties &
  SearchEventProperties &
  UIEventProperties &
  ErrorEventProperties &
  EngagementEventProperties &
  WebVitalsEventProperties
