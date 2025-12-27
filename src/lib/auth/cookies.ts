/**
 * @deprecated This file is deprecated. Auth tokens are now managed via HttpOnly cookies.
 * Do not use these functions. They are kept temporarily to prevent build errors if any import was missed.
 */

export const getAuthToken = (): string | undefined => undefined
export const setAuthToken = (_token: string) => {}
export const removeAuthToken = () => {}
export const getRefreshToken = (): string | undefined => undefined
export const setRefreshToken = (_token: string) => {}
export const removeRefreshToken = () => {}
export const clearAllTokens = () => {}
export const hasAuthToken = (): boolean => false
