import { OpenAPIV3 } from '@scalar/openapi-types'


export function isValidMethod(method: unknown): method is OpenAPIV3.HttpMethods {
  if (typeof method !== 'string') return false
  return ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace', 'connect'].includes(method)
}
