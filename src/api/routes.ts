/**
 * API Routes configuration
 *
 * Chat: POST /api/v1/chat
 * Documents: /api/v1/documents/*
 * Auth: /api/v1/auth/*
 * Health: /api/v1/health
 */

export const APIRoutes = {
  // Health check
  HealthCheck: (baseUrl: string) => `${baseUrl}/api/v1/health`,

  // Chat
  Chat: (baseUrl: string) => `${baseUrl}/api/v1/chat`,

  // Documents
  DocumentsUpload: (baseUrl: string) => `${baseUrl}/api/v1/documents/upload`,
  DocumentsByUser: (baseUrl: string, userId: string) =>
    `${baseUrl}/api/v1/documents/user/${userId}`,
  DocumentById: (baseUrl: string, documentId: string) =>
    `${baseUrl}/api/v1/documents/${documentId}`,
  DocumentDownload: (baseUrl: string, documentId: string) =>
    `${baseUrl}/api/v1/documents/${documentId}/download`,

  // Auth
  AuthLogin: (baseUrl: string) => `${baseUrl}/api/v1/auth/login`,
  AuthRegister: (baseUrl: string) => `${baseUrl}/api/v1/auth/register`,
  AuthLogout: (baseUrl: string) => `${baseUrl}/api/v1/auth/logout`,
  AuthMe: (baseUrl: string) => `${baseUrl}/api/v1/auth/me`
}
