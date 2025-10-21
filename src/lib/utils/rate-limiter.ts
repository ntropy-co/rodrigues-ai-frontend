/**
 * Rate Limiter para prevenção de brute force attacks no frontend
 *
 * IMPORTANTE: Este é um rate limiter client-side e pode ser contornado.
 * O ideal é ter rate limiting também no backend. Esta implementação serve
 * para prevenir ataques automatizados simples e melhorar a UX.
 */

/**
 * Interface para configuração de rate limit
 */
export interface RateLimitConfig {
  /** Número máximo de tentativas permitidas */
  maxAttempts: number
  /** Janela de tempo em milissegundos */
  windowMs: number
  /** Mensagem de erro personalizada (opcional) */
  message?: string
}

/**
 * Classe RateLimiter para controlar tentativas de ações por chave
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()

  /**
   * Verifica se uma tentativa é permitida dentro dos limites configurados
   *
   * @param key - Chave única para identificar a ação (ex: 'login:user@email.com')
   * @param maxAttempts - Número máximo de tentativas permitidas
   * @param windowMs - Janela de tempo em milissegundos
   * @returns true se a tentativa é permitida, false se excedeu o limite
   *
   * @example
   * ```typescript
   * const limiter = new RateLimiter()
   * if (!limiter.canAttempt('login', 5, 60000)) {
   *   toast.error('Muitas tentativas. Aguarde 1 minuto.')
   *   return
   * }
   * // Prosseguir com login
   * ```
   */
  canAttempt(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []

    // Limpar tentativas antigas fora da janela de tempo
    const recentAttempts = attempts.filter((time) => now - time < windowMs)

    // Verificar se excedeu o limite
    if (recentAttempts.length >= maxAttempts) {
      return false
    }

    // Registrar nova tentativa
    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)

    return true
  }

  /**
   * Reseta as tentativas para uma chave específica
   *
   * @param key - Chave a ser resetada
   *
   * @example
   * ```typescript
   * limiter.reset('login')
   * ```
   */
  reset(key: string): void {
    this.attempts.delete(key)
  }

  /**
   * Obtém o número de tentativas restantes
   *
   * @param key - Chave para verificar
   * @param maxAttempts - Número máximo de tentativas permitidas
   * @param windowMs - Janela de tempo em milissegundos
   * @returns Número de tentativas restantes
   */
  getRemainingAttempts(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): number {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    const recentAttempts = attempts.filter((time) => now - time < windowMs)

    return Math.max(0, maxAttempts - recentAttempts.length)
  }

  /**
   * Obtém o tempo restante até que uma tentativa seja permitida novamente
   *
   * @param key - Chave para verificar
   * @param maxAttempts - Número máximo de tentativas permitidas
   * @param windowMs - Janela de tempo em milissegundos
   * @returns Tempo em milissegundos até próxima tentativa ou 0 se já permitido
   */
  getTimeUntilReset(
    key: string,
    maxAttempts: number,
    windowMs: number
  ): number {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    const recentAttempts = attempts.filter((time) => now - time < windowMs)

    if (recentAttempts.length < maxAttempts) {
      return 0
    }

    // Retornar tempo até que a tentativa mais antiga expire
    const oldestAttempt = Math.min(...recentAttempts)
    return Math.max(0, windowMs - (now - oldestAttempt))
  }

  /**
   * Limpa todas as tentativas armazenadas
   */
  clear(): void {
    this.attempts.clear()
  }
}

// Instâncias pré-configuradas para uso comum

/**
 * Rate limiter para tentativas de login
 * Configuração: 5 tentativas por minuto
 */
export const loginRateLimiter = new RateLimiter()

/**
 * Rate limiter para registro de usuários
 * Configuração: 3 tentativas por 5 minutos
 */
export const registerRateLimiter = new RateLimiter()

/**
 * Rate limiter para reset de senha
 * Configuração: 3 tentativas por 15 minutos
 */
export const passwordResetRateLimiter = new RateLimiter()

/**
 * Configurações padrão de rate limit
 */
export const RATE_LIMIT_CONFIGS = {
  login: {
    maxAttempts: 5,
    windowMs: 60000, // 1 minuto
    message: 'Muitas tentativas de login. Aguarde 1 minuto e tente novamente.'
  },
  register: {
    maxAttempts: 3,
    windowMs: 300000, // 5 minutos
    message: 'Muitas tentativas de registro. Aguarde 5 minutos.'
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 900000, // 15 minutos
    message: 'Muitas tentativas de reset de senha. Aguarde 15 minutos.'
  }
} as const
