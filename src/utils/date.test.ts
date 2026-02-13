import { describe, it, expect } from 'vitest'
import { startOfWeek, endOfWeek, computePresetRange } from './date'

describe('date utils', () => {
  it('computes start and end of week (Mon-Sun) in local time', () => {
    // Wed, Jan 15, 2025
    const d = new Date('2025-01-15T12:34:56.000Z')
    const s = startOfWeek(d)
    const e = endOfWeek(d)

    // Start of week is local Monday at 00:00:00.000
    expect(s.getDay()).toBe(1)
    expect(s.getHours()).toBe(0)
    expect(s.getMinutes()).toBe(0)
    expect(s.getSeconds()).toBe(0)
    expect(s.getMilliseconds()).toBe(0)

    // End of week is local Sunday at 23:59:59.999
    expect(e.getDay()).toBe(0)
    expect(e.getHours()).toBe(23)
    expect(e.getMinutes()).toBe(59)
    expect(e.getSeconds()).toBe(59)
    expect(e.getMilliseconds()).toBe(999)
  })

  it('computePresetRange("week") returns bounds aligned to local week', () => {
    const now = new Date('2024-12-03T08:00:00.000Z') // Tuesday
    const range = computePresetRange('week', now)
    const start = range.dateStart ? new Date(range.dateStart) : undefined
    const end = range.dateEnd ? new Date(range.dateEnd) : undefined

    expect(start).toBeDefined()
    expect(end).toBeDefined()

    if (start && end) {
      // Monday 00:00:00.000 local
      expect(start.getDay()).toBe(1)
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(start.getSeconds()).toBe(0)
      expect(start.getMilliseconds()).toBe(0)

      // Sunday 23:59:59.999 local
      expect(end.getDay()).toBe(0)
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
      expect(end.getSeconds()).toBe(59)
      expect(end.getMilliseconds()).toBe(999)
    }
  })
})
