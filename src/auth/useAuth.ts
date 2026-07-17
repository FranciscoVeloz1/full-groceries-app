import { useContext } from 'react'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return value
}

export type { AuthContextValue, AuthStatus }
