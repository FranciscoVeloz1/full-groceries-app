import { describe, expect, it } from 'vitest'
import { hasGroceriesRole, type AuthUser } from './types'

function userWithRole(role: AuthUser['role']): AuthUser {
  return {
    id: 'user-1',
    email: 'user@example.com',
    name: 'User',
    role,
  }
}

describe('hasGroceriesRole', () => {
  it('returns false when user is null', () => {
    expect(hasGroceriesRole(null, 'READ_ONLY')).toBe(false)
  })

  it('allows READ_ONLY for browse but not admin', () => {
    const user = userWithRole('READ_ONLY')
    expect(hasGroceriesRole(user, 'READ_ONLY')).toBe(true)
    expect(hasGroceriesRole(user, 'ADMIN')).toBe(false)
  })

  it('allows ADMIN for browse and admin', () => {
    const user = userWithRole('ADMIN')
    expect(hasGroceriesRole(user, 'READ_ONLY')).toBe(true)
    expect(hasGroceriesRole(user, 'ADMIN')).toBe(true)
  })
})
