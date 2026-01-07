/**
 * Chat and Conversation Type Definitions
 *
 * Types for managing chat messages, conversations, and feedback in Verity Agro.
 * Includes message history, user feedback, and conversation management.
 */

// ============================================================================
// Enums & Constants
// ============================================================================

/**
 * Feedback type for chat messages
 * - like: Positive feedback
 * - dislike: Negative feedback
 * - none: No feedback or feedback removed
 */
export type MessageFeedback = 'like' | 'dislike' | 'none'

/**
 * Role of the message sender
 * - user: Message from the user
 * - assistant: Message from the AI assistant
 * - system: System-generated message
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * Session status
 */
export type SessionStatus = 'active' | 'archived' | 'deleted'

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Chat message in a conversation
 */
export interface ConversationMessage {
  /** Unique message ID (UUID) */
  id: string
  /** Session/conversation ID this message belongs to */
  session_id: string
  /** Role of the message sender */
  role: MessageRole
  /** Message content */
  content: string
  /** User feedback on this message (if any) */
  feedback?: MessageFeedback | null
  /** Langfuse trace ID for observability */
  trace_id?: string | null
  /** Timestamp when message was created */
  created_at: string
  /** Timestamp when message was updated */
  updated_at?: string | null
}

/**
 * Conversation/Session summary
 */
export interface ChatSession {
  /** Session ID (format: s_<uuid>) */
  id: string
  /** User ID who owns this session */
  user_id: string
  /** Project ID this session belongs to (if any) */
  project_id?: string | null
  /** Session title/name */
  title?: string | null
  /** Session status */
  status?: SessionStatus
  /** Timestamp when session was created */
  created_at: string
  /** Timestamp when session was last updated */
  updated_at?: string | null
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Request body for submitting message feedback
 */
export interface FeedbackRequest {
  /** Feedback type: like, dislike, or none */
  feedback: MessageFeedback
}

/**
 * Request body for sending a chat message
 */
export interface ChatRequest {
  /** User's message */
  message: string
  /** Session ID (null to create new session) */
  session_id: string | null
}

/**
 * Request body for creating a new session
 */
export interface SessionCreateRequest {
  /** Optional project ID */
  project_id?: string | null
  /** Optional session title */
  title?: string | null
}

/**
 * Request body for updating a session
 */
export interface SessionUpdateRequest {
  /** Updated session title */
  title?: string | null
  /** Updated session status */
  status?: SessionStatus
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Response from chat endpoint
 */
export interface ChatResponse {
  /** AI assistant's response text */
  text: string
  /** Session ID (created or existing) */
  session_id: string
  /** Message ID for feedback */
  message_id?: string
  /** Source documents used (if any) */
  sources?: string[]
}

/**
 * Response from feedback endpoint
 */
export interface FeedbackResponse {
  /** Success status */
  status: 'success'
}

/**
 * Conversation history response
 */
export interface ChatHistoryResponse {
  /** List of conversation messages */
  messages: ConversationMessage[]
  /** Total count of messages */
  total?: number
  /** Whether there are more messages to load */
  hasMore?: boolean
}

/**
 * Session list response
 */
export interface SessionListResponse {
  /** List of sessions */
  sessions: ChatSession[]
  /** Total count */
  total?: number
}

// ============================================================================
// Error Response Types
// ============================================================================

/**
 * Standard error response from API
 */
export interface ApiError {
  /** Error message */
  detail: string
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string
  /** Error message */
  message: string
}

// ============================================================================
// Client-Side State Types
// ============================================================================

/**
 * Chat state for managing messages in UI
 */
export interface ChatState {
  /** Current session ID */
  sessionId: string | null
  /** List of messages in current session */
  messages: ConversationMessage[]
  /** Whether messages are loading */
  isLoading: boolean
  /** Whether sending a message */
  isSending: boolean
  /** Error message (if any) */
  error: string | null
}

/**
 * Feedback state for a specific message
 */
export interface MessageFeedbackState {
  /** Message ID */
  messageId: string
  /** Current feedback value */
  feedback: MessageFeedback | null
  /** Whether feedback is being submitted */
  isSubmitting: boolean
  /** Error message (if any) */
  error: string | null
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Number of items to skip */
  skip?: number
  /** Maximum number of items to return */
  limit?: number
}

/**
 * Query parameters for fetching chat history
 */
export interface ChatHistoryParams extends PaginationParams {
  /** Session ID */
  session_id: string
}
