/**
 * Conditional logger that only logs in development mode
 */
const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args)
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args)
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args)
  },
  error: (...args: unknown[]) => {
    // Always log errors
    console.error(...args)
  },
  // For SSE/streaming events
  sse: (message: string, data?: unknown) => {
    if (isDev) console.debug(`[SSE] ${message}`, data ?? '')
  },
  // For API calls
  api: (message: string, data?: unknown) => {
    if (isDev) console.debug(`[API] ${message}`, data ?? '')
  }
}

export default logger
