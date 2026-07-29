import { describe, expect, it, vi } from 'vitest'
import {
  fetchWithRetry,
  isRetryableStatus,
} from '../../scripts/productionSmoke.mjs'

describe('production deployment readiness', () => {
  it('retries a transient Cloudflare 522 response and returns the first success', async () => {
    const unavailable = { ok: false, status: 522 }
    const ready = { ok: true, status: 200 }
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(ready)
    const sleep = vi.fn().mockResolvedValue()

    const result = await fetchWithRetry('https://example.pages.dev', {
      fetchImpl,
      sleep,
    })

    expect(result).toEqual({ response: ready, attemptsUsed: 2 })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledOnce()
  })

  it('does not retry a non-transient authentication response', async () => {
    const unauthorized = { ok: false, status: 401 }
    const fetchImpl = vi.fn().mockResolvedValue(unauthorized)
    const sleep = vi.fn().mockResolvedValue()

    const result = await fetchWithRetry('https://example.pages.dev', {
      fetchImpl,
      sleep,
    })

    expect(result).toEqual({ response: unauthorized, attemptsUsed: 1 })
    expect(fetchImpl).toHaveBeenCalledOnce()
    expect(sleep).not.toHaveBeenCalled()
  })

  it('recognises Cloudflare propagation failures as transient', () => {
    expect(isRetryableStatus(522)).toBe(true)
    expect(isRetryableStatus(503)).toBe(true)
    expect(isRetryableStatus(404)).toBe(false)
    expect(isRetryableStatus(401)).toBe(false)
  })
})
