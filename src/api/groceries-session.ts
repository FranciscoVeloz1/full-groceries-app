import type { RequestOptions } from './http'

export type AuthorizedRequest = <T>(
  path: string,
  options?: Omit<RequestOptions, 'accessToken'>
) => Promise<T>

export type GroceriesApiSession = {
  request: AuthorizedRequest
}

let session: GroceriesApiSession | null = null

export function setGroceriesApiSession(next: GroceriesApiSession | null): void {
  session = next
}

export function requireGroceriesApiSession(): GroceriesApiSession {
  if (!session) {
    throw new Error('Groceries API session is not available. User must be authenticated.')
  }
  return session
}
