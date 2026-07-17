export type UserRole = 'READ_ONLY' | 'ADMIN'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

export type LoginRequest = { email: string; password: string }

export type LoginResponse = {
  user: {
    id: string
    email: string
    name: string
  }
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

export function hasGroceriesRole(user: AuthUser | null, minimum: UserRole): boolean {
  if (!user) {
    return false
  }
  const rank = { READ_ONLY: 1, ADMIN: 2 } as const
  return rank[user.role] >= rank[minimum]
}
