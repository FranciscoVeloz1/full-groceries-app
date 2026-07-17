export const GROCERIES_APP_SLUG = 'groceries-app' as const

export type PermissionRole = 'READ_ONLY' | 'ADMIN'

export type AppPermission = {
  applicationId: string
  applicationSlug: string
  role: PermissionRole
}

export type AuthUser = {
  id: string
  email: string
  name: string
  permissions: AppPermission[]
}

export type LoginRequest = { email: string; password: string }

export type LoginResponse = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export type RefreshRequest = { refreshToken: string }

export type RefreshResponse = {
  accessToken: string
  refreshToken: string
}

export type MeResponse = { user: AuthUser }

export type ApiErrorBody = {
  error: string
  message: string
  details?: unknown
}

export type GroceryCategory = {
  id: string
  name: string
  sortOrder: number
}

export type GroceryProduct = {
  id: string
  name: string
  image: string
  categoryId: string
  category: GroceryCategory
  price: number
  createdAt: string
  updatedAt: string
}

export function hasGroceriesRole(
  user: AuthUser | null,
  minimum: PermissionRole
): boolean {
  if (!user) return false
  const rank = { READ_ONLY: 1, ADMIN: 2 } as const
  const membership = user.permissions.find(
    (p) => p.applicationSlug === GROCERIES_APP_SLUG
  )
  if (!membership) return false
  return rank[membership.role] >= rank[minimum]
}
