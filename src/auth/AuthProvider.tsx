import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import { setGroceriesApiSession } from '../api/groceries-session'
import { ApiError, request, type RequestOptions } from '../api/http'
import { hasGroceriesRole, type AuthUser } from '../api/types'
import { AuthContext, type AuthContextValue } from './auth-context'
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from './session-storage'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthContextValue['status']>('bootstrapping')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const refreshTokenRef = useRef<string | null>(null)
  const refreshInFlightRef = useRef<Promise<string> | null>(null)

  const clearSession = useCallback(() => {
    refreshTokenRef.current = null
    clearRefreshToken()
    setAccessToken(null)
    setUser(null)
    setStatus('anonymous')
    setGroceriesApiSession(null)
  }, [])

  const persistTokens = useCallback((nextAccessToken: string, nextRefreshToken: string) => {
    refreshTokenRef.current = nextRefreshToken
    writeRefreshToken(nextRefreshToken)
    setAccessToken(nextAccessToken)
  }, [])

  const refreshSession = useCallback(async (): Promise<string> => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current
    }

    const currentRefresh = refreshTokenRef.current
    if (!currentRefresh) {
      clearSession()
      throw new ApiError(401, 'Missing refresh token', 'UNAUTHORIZED')
    }

    const pending = (async () => {
      try {
        const tokens = await authApi.refresh({ refreshToken: currentRefresh })
        persistTokens(tokens.accessToken, tokens.refreshToken)
        const meResponse = await authApi.me(tokens.accessToken)
        setUser(meResponse.user)
        setStatus('authenticated')
        return tokens.accessToken
      } catch (caught) {
        clearSession()
        throw caught
      } finally {
        refreshInFlightRef.current = null
      }
    })()

    refreshInFlightRef.current = pending
    return pending
  }, [clearSession, persistTokens])

  const authorizedRequest = useCallback(
    async <T,>(path: string, options: Omit<RequestOptions, 'accessToken'> = {}): Promise<T> => {
      const token = accessToken
      if (!token) {
        throw new ApiError(401, 'Not authenticated', 'UNAUTHORIZED')
      }

      try {
        return await request<T>(path, { ...options, accessToken: token })
      } catch (caught) {
        if (!(caught instanceof ApiError) || caught.status !== 401) {
          throw caught
        }

        const nextToken = await refreshSession()
        return request<T>(path, { ...options, accessToken: nextToken })
      }
    },
    [accessToken, refreshSession]
  )

  const bootstrap = useEffectEvent(async () => {
    const storedRefresh = readRefreshToken()
    if (!storedRefresh) {
      setStatus('anonymous')
      return
    }

    refreshTokenRef.current = storedRefresh

    try {
      await refreshSession()
    } catch {
      // refreshSession already cleared state
    }
  })

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (!cancelled) {
        void bootstrap()
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password })
      persistTokens(result.accessToken, result.refreshToken)
      const meResponse = await authApi.me(result.accessToken)
      setUser(meResponse.user)
      setStatus('authenticated')
    },
    [persistTokens]
  )

  const logout = useCallback(async () => {
    const refreshToken = refreshTokenRef.current
    clearSession()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Local session already cleared; ignore remote logout failures.
      }
    }
  }, [clearSession])

  useEffect(() => {
    if (status === 'authenticated' && accessToken) {
      setGroceriesApiSession({ request: authorizedRequest })
    } else if (status === 'anonymous') {
      setGroceriesApiSession(null)
    }
  }, [status, accessToken, authorizedRequest])

  const value = useMemo<AuthContextValue>(() => {
    return {
      status,
      user,
      accessToken,
      isGroceriesAdmin: hasGroceriesRole(user, 'ADMIN'),
      canBrowseGroceries: hasGroceriesRole(user, 'READ_ONLY'),
      login,
      logout,
      authorizedRequest,
    }
  }, [status, user, accessToken, login, logout, authorizedRequest])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
