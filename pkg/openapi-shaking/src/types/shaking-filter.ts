import { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types'
import { Promisable } from 'type-fest'
import { HttpMethods } from './http-methods'


export type ShakingFilter = (
  path: string,
  method: HttpMethods,
  operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject
) => Promisable<boolean>


export type ShakingFilterSync = (
  path: string,
  method: HttpMethods,
  operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject
) => boolean
