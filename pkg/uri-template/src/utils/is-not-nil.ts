export function isNotNil<T>(value: T): value is (T & {}) {
  return value !== undefined && value !== null
}
