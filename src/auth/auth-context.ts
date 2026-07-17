import { createContext } from 'react'
import type { RequestOptions } from '../api/http'
import type { AuthUser } from '../api/types'

export type AuthStatus = 'bootstrapping' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  accessToken: string | null
  isGroceriesAdmin: boolean
  canBrowseGroceries: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  authorizedRequest: <T>(
    path: string,
    options?: Omit<RequestOptions, 'accessToken'>
  ) => Promise<T>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
