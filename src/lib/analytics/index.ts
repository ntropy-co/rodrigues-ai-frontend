/**
 * Analytics Module
 *
 * Provides type-safe analytics tracking functions.
 * Wraps PostHog with strong typing for events and properties.
 *
 * @example
 * import { track, identify, reset, ANALYTICS_EVENTS } from '@/lib/analytics'
 *
 * // Track an event
 * track(ANALYTICS_EVENTS.USER_LOGGED_IN, { method: 'email', user_id: '123' })
 *
 * // Identify a user
 * identify('user-123', { email: 'user@example.com', name: 'John' })
 *
 * // Resetar ao fazer logout
 * reset()
 */

import {
  trackEvent as posthogTrack,
  identifyUser as posthogIdentify,
  resetUser as posthogReset
} from '@/components/providers/PostHogProvider'

import {
  ANALYTICS_EVENTS,
  type AnalyticsEvent,
  type EventProperties
} from './events'

// Re-export events for convenience
export { ANALYTICS_EVENTS } from './events'
export type { AnalyticsEvent, EventProperties } from './events'

// =============================================================================
// Core Tracking Functions
// =============================================================================

/**
 * Track an analytics event with type-safe properties
 *
 * @param event - Event name from ANALYTICS_EVENTS
 * @param properties - Event properties (type-checked based on event)
 */
export function track<E extends AnalyticsEvent>(
  event: E,
  properties: E extends keyof EventProperties
    ? EventProperties[E]
    : Record<string, unknown>
): void {
  posthogTrack(event, properties as Record<string, unknown>)
}

/**
 * Identify a user in analytics
 *
 * Call this after successful login to associate events with the user.
 *
 * @param userId - Unique user identifier
 * @param properties - User properties (email, name, role, etc.)
 */
export function identify(
  userId: string,
  properties?: {
    email?: string
    name?: string
    role?: string
    company_id?: string
    created_at?: string
  }
): void {
  posthogIdentify(userId, properties)
}

/**
 * Reset user identity
 *
 * Call this on logout to clear user association.
 * New events will be tracked as a new anonymous user.
 */
export function reset(): void {
  posthogReset()
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Track a user login event
 */
export function trackLogin(
  userId: string,
  method: 'email' | 'google' | 'invite' = 'email'
): void {
  track(ANALYTICS_EVENTS.USER_LOGGED_IN, { method, user_id: userId })
}

/**
 * Track a user signup event
 */
export function trackSignup(
  method: 'email' | 'google' | 'invite' = 'email'
): void {
  track(ANALYTICS_EVENTS.USER_SIGNED_UP, { method })
}

/**
 * Track a user logout event and reset identity
 */
export function trackLogout(sessionDurationSeconds?: number): void {
  track(ANALYTICS_EVENTS.USER_LOGGED_OUT, {
    session_duration_seconds: sessionDurationSeconds
  })
  reset()
}

/**
 * Track a chat message sent
 */
export function trackChatMessage(props: {
  session_id: string
  message_length: number
  has_files: boolean
  file_count: number
  is_new_session: boolean
}): void {
  track(ANALYTICS_EVENTS.CHAT_MESSAGE_SENT, props)
}

/**
 * Track chat feedback (like/dislike)
 */
export function trackChatFeedback(
  messageId: string,
  feedbackType: 'like' | 'dislike',
  sessionId: string
): void {
  track(ANALYTICS_EVENTS.CHAT_FEEDBACK_GIVEN, {
    message_id: messageId,
    feedback_type: feedbackType,
    session_id: sessionId
  })
}

/**
 * Track a document upload
 */
export function trackDocumentUpload(props: {
  document_id: string
  file_name: string
  file_size: number
  file_type: string
  file_category: string
  conversation_id?: string
  session_id?: string
  user_id?: string
}): void {
  track(ANALYTICS_EVENTS.DOCUMENT_UPLOADED, props)
}

/**
 * Track a document download
 */
export function trackDocumentDownload(
  documentId: string,
  fileName: string,
  fileType: string
): void {
  track(ANALYTICS_EVENTS.DOCUMENT_DOWNLOADED, {
    document_id: documentId,
    file_name: fileName,
    file_type: fileType
  })
}

/**
 * Track a CPR quick action click
 */
export function trackCPRQuickAction(
  actionType: string,
  actionLabel: string
): void {
  track(ANALYTICS_EVENTS.CPR_QUICK_ACTION_CLICKED, {
    action_type: actionType,
    action_label: actionLabel
  })
}

/**
 * Track a search query
 */
export function trackSearch(query: string, resultsCount: number): void {
  track(ANALYTICS_EVENTS.SEARCH_QUERY_SUBMITTED, {
    query,
    results_count: resultsCount
  })
}

/**
 * Track conversation selection
 */
export function trackConversationSelected(
  sessionId: string,
  source: 'sidebar' | 'search' | 'recent' = 'sidebar'
): void {
  track(ANALYTICS_EVENTS.CONVERSATION_SELECTED, {
    session_id: sessionId,
    source
  })
}

/**
 * Track project selection
 */
export function trackProjectSelected(projectId: string): void {
  track(ANALYTICS_EVENTS.PROJECT_SELECTED, {
    project_id: projectId
  })
}

/**
 * Track an error from Error Boundary
 */
export function trackError(
  errorMessage: string,
  errorStack?: string,
  componentName?: string
): void {
  track(ANALYTICS_EVENTS.ERROR_BOUNDARY_TRIGGERED, {
    error_message: errorMessage,
    error_stack: errorStack,
    component_name: componentName
  })
}

/**
 * Track an API error
 */
export function trackAPIError(
  endpoint: string,
  statusCode: number,
  errorMessage: string
): void {
  track(ANALYTICS_EVENTS.API_ERROR, {
    endpoint,
    status_code: statusCode,
    error_message: errorMessage
  })
}
