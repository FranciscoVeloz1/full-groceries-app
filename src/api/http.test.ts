import { describe, expect, it, vi, afterEach } from 'vitest'
import { ApiError, request } from './http'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('request', () => {
  it('parses JSON success responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true, count: 2 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )

    const result = await request<{ ok: boolean; count: number }>('/api/v1/demo')

    expect(result).toEqual({ ok: true, count: 2 })
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/demo',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    )
  })

  it('returns undefined for non-JSON success bodies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => {
          return ''
        },
      })
    )

    const result = await request<void>('/api/v1/auth/logout', { method: 'POST' })

    expect(result).toBeUndefined()
  })

  it('maps API error bodies to ApiError with status and safe message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: 'UNAUTHORIZED',
            message: 'Invalid email or password',
            details: { field: 'password' },
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      )
    )

    const error = await request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'a@b.com', password: 'x' },
    }).catch((caught: unknown) => {
      return caught
    })

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
    })
    expect(String((error as ApiError).message)).not.toContain('[object Object]')
  })

  it('uses a safe fallback when the error body is malformed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('<html>nope</html>', {
          status: 502,
          headers: { 'Content-Type': 'text/html' },
        })
      )
    )

    await expect(request('/api/v1/health')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502',
    })
  })

  it('narrows network failures into ApiError without leaking unknown values', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue({ not: 'an Error instance' })
    )

    const error = await request('/api/v1/health').catch((caught: unknown) => {
      return caught
    })

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 0,
      message: 'Network request failed',
    })
  })

  it('adds JSON content-type only when a body is present and bearer when supplied', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await request('/api/v1/auth/me', { accessToken: 'token-1' })
    await request('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'a@b.com', password: 'password123' },
    })

    const bareHeaders = fetchMock.mock.calls[0][1].headers as Headers
    expect(bareHeaders.get('Authorization')).toBe('Bearer token-1')
    expect(bareHeaders.get('Content-Type')).toBeNull()

    const bodyHeaders = fetchMock.mock.calls[1][1].headers as Headers
    expect(bodyHeaders.get('Content-Type')).toBe('application/json')
    expect(bodyHeaders.get('Authorization')).toBeNull()
  })
})
