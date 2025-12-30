/**
 * Structured Logger using Pino
 *
 * Usage:
 *   import logger from '@/lib/logger'
 *   logger.info({ userId: '123' }, 'User logged in')
 *   logger.error({ error: err.message }, 'Request failed')
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface Logger {
  debug: (context: LogContext, message: string) => void
  info: (context: LogContext, message: string) => void
  warn: (context: LogContext, message: string) => void
  error: (context: LogContext, message: string) => void
}

const isDev = process.env.NODE_ENV === 'development'
const LOG_LEVEL =
  (process.env.LOG_LEVEL as LogLevel) || (isDev ? 'debug' : 'info')

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL]
}

function formatLog(
  level: LogLevel,
  context: LogContext,
  message: string
): string {
  const timestamp = new Date().toISOString()
  const base = {
    timestamp,
    level,
    message,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '0.1.0',
    ...context
  }

  if (isDev) {
    // Pretty print for development
    const emoji = { debug: '🐛', info: 'ℹ️', warn: '⚠️', error: '❌' }[level]
    return `${emoji} [${level.toUpperCase()}] ${message} ${JSON.stringify(context)}`
  }

  // JSON for production (Vercel, CloudWatch, etc.)
  return JSON.stringify(base)
}

function createLogger(): Logger {
  return {
    debug: (context: LogContext, message: string) => {
      if (shouldLog('debug')) {
        console.debug(formatLog('debug', context, message))
      }
    },
    info: (context: LogContext, message: string) => {
      if (shouldLog('info')) {
        console.info(formatLog('info', context, message))
      }
    },
    warn: (context: LogContext, message: string) => {
      if (shouldLog('warn')) {
        console.warn(formatLog('warn', context, message))
      }
    },
    error: (context: LogContext, message: string) => {
      if (shouldLog('error')) {
        console.error(formatLog('error', context, message))
      }
    }
  }
}

const logger = createLogger()

export default logger
