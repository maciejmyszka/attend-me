export type DatePreset = 'today' | 'week' | 'month' | 'upcoming' | 'past' | 'all'

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

export function startOfWeek(d: Date): Date {
  const day = d.getDay() === 0 ? 7 : d.getDay()
  const diff = day - 1
  const s = new Date(d)
  s.setDate(d.getDate() - diff)
  return startOfDay(s)
}

export function endOfWeek(d: Date): Date {
  const s = startOfWeek(d)
  const e = new Date(s)
  e.setDate(s.getDate() + 6)
  return endOfDay(e)
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function fmtDate(value?: string | Date): string {
  if (!value) return ''
  try {
    const date = typeof value === 'string' ? new Date(value) : value
    return date.toLocaleString()
  } catch {
    return String(value ?? '')
  }
}

export function computePresetRange(
  preset: DatePreset,
  now: Date = new Date(),
): { dateStart?: string; dateEnd?: string } {
  switch (preset) {
    case 'today':
      return { dateStart: startOfDay(now).toISOString(), dateEnd: endOfDay(now).toISOString() }
    case 'week':
      return { dateStart: startOfWeek(now).toISOString(), dateEnd: endOfWeek(now).toISOString() }
    case 'month':
      return { dateStart: startOfMonth(now).toISOString(), dateEnd: endOfMonth(now).toISOString() }
    case 'upcoming':
      return { dateStart: now.toISOString(), dateEnd: undefined }
    case 'past':
      return { dateStart: undefined, dateEnd: now.toISOString() }
    case 'all':
    default:
      return { dateStart: undefined, dateEnd: undefined }
  }
}
