import { describe, it, expect } from 'vitest'
import { startOfWeek, endOfWeek, computePresetRange } from './date'

describe('date utils', () => {
  it('computes start and end of week (Mon-Sun)', () => {
    // Wed, Jan 15, 2025
    const d = new Date('2025-01-15T12:34:56.000Z')
    const s = startOfWeek(d)
    const e = endOfWeek(d)

    expect(s.toISOString()).toMatch(/2025-01-12T23:00:00.000Z$/) // Monday
    expect(e.toISOString()).toMatch(/2025-01-19T22:59:59.999Z$/) // Sunday
  })

  it('computePresetRange("week") returns correct ISO bounds for given now', () => {
    const now = new Date('2024-12-03T08:00:00.000Z') // Tuesday
    const range = computePresetRange('week', now)
    expect(range.dateStart).toBe('2024-12-01T23:00:00.000Z') // Monday
    expect(range.dateEnd).toBe('2024-12-08T22:59:59.999Z') // Sunday
  })
})
