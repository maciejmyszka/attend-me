export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value) || Number.isNaN(min) || Number.isNaN(max)) return NaN
  if (min > max) [min, max] = [max, min]
  return Math.min(Math.max(value, min), max)
}
