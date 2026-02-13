import { describe, it, expect } from 'vitest'
import { clamp } from './math'

describe('utils/math clamp', () => {
  it('returns value when within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps below minimum', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })

  it('clamps above maximum', () => {
    expect(clamp(42, 0, 10)).toBe(10)
  })

  it('handles swapped bounds (min > max)', () => {
    expect(clamp(5, 10, 0)).toBe(5)
    expect(clamp(-1, 10, 0)).toBe(0)
    expect(clamp(42, 10, 0)).toBe(10)
  })

  it('returns NaN if any input is NaN', () => {
    expect(Number.isNaN(clamp(NaN, 0, 1))).toBe(true)
    expect(Number.isNaN(clamp(0, NaN, 1))).toBe(true)
    expect(Number.isNaN(clamp(0, 0, NaN))).toBe(true)
  })
})
