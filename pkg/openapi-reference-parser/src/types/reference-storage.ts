import { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types'

type ComponentKeys = keyof OpenAPIV3.ComponentsObject | keyof OpenAPIV3_1.ComponentsObject
type HttpMethods = OpenAPIV3.HttpMethods | OpenAPIV3_1.HttpMethods

export interface ReferenceStorage<T> {
  paths?: {
    [pattern: string]: {
      [key in HttpMethods]: T
    } | undefined
  }

  components?: {
    [key in ComponentKeys]: T
  }
}
