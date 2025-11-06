import { JsonPrimitive } from 'type-fest'


export function isJsonPrimitive(value: unknown): value is JsonPrimitive {
  return (
    typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
    || value === null
  )
}
