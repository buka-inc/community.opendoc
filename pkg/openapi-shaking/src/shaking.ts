import * as R from 'ramda'
import { OpenAPIV3 } from '@scalar/openapi-types'
import { ShakingFilter, ShakingFilterSync } from './types/shaking-filter'
import { isValidMethod } from './utils/is-valid-method'
import { openapiShakingOrphanedComponents } from './shaking-orphaned-components'
import { ShakingOptions } from './types/shaking-options'


export async function openapiShaking<T extends OpenAPIV3.Document>(document: Readonly<T>, filter: ShakingFilter, options: ShakingOptions = {}): Promise<T> {
  let doc = document

  const pairs = await Promise.all(
    Object.entries(document.paths || {}).map(async ([path, methods]): Promise<[string, unknown] | undefined> => {
      if (!methods) return [path, methods]

      const pairs = await Promise.all(
        Object.entries(methods || {})
          .map(async ([method, operation]): Promise<[string, unknown] | undefined> => {
            if (!isValidMethod(method)) return [method, operation]

            if (await filter(path, method, operation as OpenAPIV3.OperationObject)) {
              return [method, operation]
            }
          }),
      )

      const pairsWithoutNil = pairs.filter(R.isNotNil) as [string, unknown][]
      if (!pairsWithoutNil.length) return undefined

      return [
        path,
        R.fromPairs(pairsWithoutNil) as OpenAPIV3.PathItemObject,
      ]
    }),
  )

  const paths = R.fromPairs(pairs.filter(R.isNotNil)) as unknown as T['paths']

  doc = R.assoc('paths', paths, doc) as T
  return openapiShakingOrphanedComponents(doc, options)
}

export function openapiShakingSync(document: Readonly<OpenAPIV3.Document>, filter: ShakingFilterSync, options: ShakingOptions = {}): OpenAPIV3.Document {
  let doc = document

  for (const path in document.paths) {
    for (const method in document.paths[path]) {
      if (!isValidMethod(method)) continue

      const operation = R.path(['paths', path, method], document) as (OpenAPIV3.OperationObject | undefined)
      if (!operation) continue

      if (!filter(path, method, operation)) {
        doc = R.dissocPath(['paths', path, method], doc)
      }
    }

    if (R.isEmpty(R.path(['paths', path], doc))) {
      doc = R.dissocPath(['paths', path], doc)
    }
  }

  return openapiShakingOrphanedComponents(doc, options)
}
