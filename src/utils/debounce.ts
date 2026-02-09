// AI GENERATED

export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300): T {
  let timer: number | undefined
  return function (this: unknown, ...args: any[]) {
    if (timer !== undefined) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      timer = undefined
      fn.apply(this, args)
    }, delay)
  } as T
}
