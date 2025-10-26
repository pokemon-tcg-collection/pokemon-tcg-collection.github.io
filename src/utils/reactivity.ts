import { toRaw } from 'vue'

// credit: https://stackoverflow.com/a/77022014/9360161
export function toRawDeep<T>(observed: T): T {
  const val = toRaw(observed)

  if (Array.isArray(val)) return val.map(toRawDeep) as T
  if (val === null) return null as T

  // NOTE: do not try to recreate inbuilt objects
  if (val instanceof Date) return val

  if (typeof val === 'object') {
    const entries = Object.entries(val).map(([key, val]) => [key, toRawDeep(val)])
    return Object.fromEntries(entries)
  }

  return val
}
