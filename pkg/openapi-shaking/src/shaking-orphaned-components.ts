import * as R from 'ramda'
import { OpenAPIV3 } from 'openapi-types'
import { OpenapiReferenceParser } from '@opendoc/openapi-reference-parser'
import { ShakingOptions } from './types/shaking-options'


export function openapiShakingOrphanedComponents(document: Readonly<OpenAPIV3.Document>, options: ShakingOptions = {}): OpenAPIV3.Document {
  const dependencies = new OpenapiReferenceParser(document, options).parse()

  const refs = R.unnest(Object.values(dependencies.paths || {})
    .map((pathObj) => R.unnest(Object.values(pathObj || {})
      .map((op) => op.dependencies)),
    ))

  const exists = refs
    .map((ref) => ref.match(/#\/components\/(.+?)\/(.+)/))
    .filter((matched): matched is RegExpMatchArray => !!matched)
    .map((matched) => ({
      scopeName: matched[1],
      componentName: matched[2],
    }))

  const isExist = (scopeName: string, componentName: string): boolean => exists.some(
    (item) => item.scopeName === scopeName &&
    item.componentName === componentName,
  )

  let doc = document

  for (const scopeName in document.components) {
    if (!document.components[scopeName]) continue

    for (const componentName in document.components[scopeName]) {
      if (!document.components[scopeName][componentName]) continue

      if (!isExist(scopeName, componentName)) {
        doc = R.dissocPath(['components', scopeName, componentName], doc)
      }
    }

    if (R.isEmpty(R.path(['components', scopeName], doc))) {
      doc = R.dissocPath(['components', scopeName], doc)
    }
  }

  return doc
}
