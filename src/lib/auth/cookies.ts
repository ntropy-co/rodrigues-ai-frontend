/**
 * Gerenciamento seguro de tokens de autenticação via cookies
 *
 * Esta implementação usa cookies em vez de localStorage para melhorar a segurança:
 * - Cookies com SameSite=Strict previnem CSRF
 * - Cookies com Secure=true (em produção) requerem HTTPS
 * - Menor superfície de ataque contra XSS comparado a localStorage
 *
 * NOTA: Para segurança máxima, o ideal seria usar httpOnly cookies gerenciados
 * pelo backend, mas isso requer mudanças na API. Esta é uma solução intermediária.
 */

import Cookies from 'js-cookie'

const TOKEN_COOKIE = 'auth_token'

/**
 * Opções de configuração dos cookies
 * - secure: apenas HTTPS em produção
 * - sameSite: 'strict' previne CSRF
 * - expires: 7 dias de validade
 */
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  expires: 7, // 7 dias
  path: '/' // Disponível em toda a aplicação
}

/**
 * Salva o token de autenticação em um cookie seguro
 *
 * @param token - JWT token de autenticação
 */
export const setAuthToken = (token: string): void => {
  Cookies.set(TOKEN_COOKIE, token, COOKIE_OPTIONS)
}

/**
 * Recupera o token de autenticação do cookie
 *
 * @returns Token JWT ou undefined se não existir
 */
export const getAuthToken = (): string | undefined => {
  return Cookies.get(TOKEN_COOKIE)
}

/**
 * Remove o token de autenticação (logout)
 */
export const removeAuthToken = (): void => {
  Cookies.remove(TOKEN_COOKIE, { path: '/' })
}

/**
 * Verifica se existe um token de autenticação válido
 *
 * @returns true se existe token, false caso contrário
 */
export const hasAuthToken = (): boolean => {
  return !!getAuthToken()
}
