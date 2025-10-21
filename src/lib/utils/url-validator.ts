/**
 * Validador de URLs para prevenir SSRF e ataques via URLs maliciosas
 *
 * Este módulo valida que as URLs usadas nas chamadas de API são seguras:
 * - Apenas protocolos HTTP/HTTPS permitidos
 * - Bloqueia protocolos perigosos (javascript:, data:, file:, etc)
 * - Opcional: bloqueia localhost em produção
 */

/**
 * Lista de protocolos permitidos
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:']

/**
 * Lista de hostnames bloqueados em produção (opcional)
 * Útil para prevenir SSRF em ambientes de produção
 */
const BLOCKED_HOSTNAMES_PRODUCTION = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]'
]

/**
 * Valida se uma URL é segura para uso em chamadas de API
 *
 * @param url - URL a ser validada
 * @param options - Opções de validação
 * @returns URL validada
 * @throws Error se a URL for inválida ou insegura
 *
 * @example
 * ```typescript
 * const safeUrl = validateApiUrl('https://api.example.com')
 * // OK: 'https://api.example.com'
 *
 * validateApiUrl('javascript:alert(1)')
 * // Throws: 'Protocolo inválido: javascript:'
 * ```
 */
export function validateApiUrl(
  url: string,
  options: {
    allowLocalhost?: boolean
    allowedProtocols?: string[]
  } = {}
): string {
  const {
    allowLocalhost = process.env.NODE_ENV === 'development',
    allowedProtocols = ALLOWED_PROTOCOLS
  } = options

  try {
    const parsed = new URL(url)

    // Validar protocolo
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error(
        `Protocolo inválido: ${parsed.protocol}. Apenas ${allowedProtocols.join(', ')} são permitidos.`
      )
    }

    // Validar hostname em produção
    if (!allowLocalhost && process.env.NODE_ENV === 'production') {
      if (BLOCKED_HOSTNAMES_PRODUCTION.includes(parsed.hostname)) {
        throw new Error(
          `Hostname ${parsed.hostname} não permitido em produção por razões de segurança`
        )
      }
    }

    return url
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`URL inválida: ${url}`)
  }
}

/**
 * Valida se uma string é uma URL válida (sem lançar erro)
 *
 * @param url - String a ser validada
 * @returns true se for uma URL válida e segura, false caso contrário
 *
 * @example
 * ```typescript
 * isValidUrl('https://api.example.com') // true
 * isValidUrl('javascript:alert(1)') // false
 * isValidUrl('not a url') // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    validateApiUrl(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitiza uma URL removendo parâmetros potencialmente perigosos
 *
 * @param url - URL a ser sanitizada
 * @param allowedParams - Lista de parâmetros permitidos (opcional)
 * @returns URL sanitizada
 *
 * @example
 * ```typescript
 * sanitizeUrl('https://api.com?token=123&evil=<script>')
 * // 'https://api.com?token=123'
 * ```
 */
export function sanitizeUrl(url: string, allowedParams?: string[]): string {
  try {
    const parsed = new URL(url)

    if (allowedParams) {
      // Manter apenas parâmetros permitidos
      const newSearchParams = new URLSearchParams()
      allowedParams.forEach((param) => {
        const value = parsed.searchParams.get(param)
        if (value !== null) {
          newSearchParams.set(param, value)
        }
      })
      parsed.search = newSearchParams.toString()
    }

    return parsed.toString()
  } catch {
    throw new Error(`URL inválida: ${url}`)
  }
}
