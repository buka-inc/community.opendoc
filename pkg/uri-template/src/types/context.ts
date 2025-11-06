import { JsonPrimitive } from 'type-fest'

export type UriTemplateContextValue = JsonPrimitive | JsonPrimitive[] | Record<string, JsonPrimitive>
export type UriTemplateContext = Record<string, UriTemplateContextValue>
