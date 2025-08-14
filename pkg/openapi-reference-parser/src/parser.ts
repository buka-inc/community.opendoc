import * as R from 'ramda'
import { OpenAPIV3 } from 'openapi-types'
import { ReferenceStorage } from './types/reference-storage'
import { isObject } from './utils/is-object'
import { JSONPath } from 'jsonpath-plus'
import { Reference } from './reference'
import { OpenapiReferenceParserResult } from './types/openapi-reference-parser-result'
import { OpenapiReferenceParserOptions } from './types/openapi-reference-parser-options'


export class OpenapiReferenceParser {
  private directDependenciesStorage: ReferenceStorage<Reference[]> = {}
  private transitiveDependenciesStorage: ReferenceStorage<Reference[]> = {}
  private dependenciesStorage: ReferenceStorage<Reference[]> = {}

  constructor(
    private document: OpenAPIV3.Document,
    private options: OpenapiReferenceParserOptions = {},
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private forEach(fn: (ref: Reference, item: any) => void): void {
    for (const [pathname, pathItem] of Object.entries(this.document.paths || {})) {
      if (!isObject(this.document.paths)) continue

      for (const m in pathItem) {
        const method = m.toLowerCase() as OpenAPIV3.HttpMethods

        const operation = pathItem[method]
        if (R.isNil(operation)) continue
        fn(Reference.from(['paths', pathname, method]), operation)
      }
    }

    for (const [scopeName, scope] of Object.entries(this.document.components || {})) {
      if (!isObject(this.document.components)) continue

      for (const [componentName, component] of Object.entries(scope)) {
        if (R.isNil(component)) continue
        fn(Reference.from(['components', scopeName, componentName]), component)
      }
    }
  }

  private pickRefs(json: object): Reference[] {
    const arr = JSONPath({
      path: "$..*['$ref']",
      json,
    })

    return arr.map((ref: string) => Reference.from(ref))
  }

  private buildDirectDependenciesStorage(): void {
    this.forEach((ref, item) => {
      const refs = this.pickRefs(item)
        .filter((r) => !r.equals(ref))

      ref.set(this.directDependenciesStorage, R.uniqWith((a, b) => a.equals(b), refs))
    })
  }

  private buildTransitiveDependenciesStorage(): void {
    this.forEach((ref) => {
      const directDependencies = ref.get(this.directDependenciesStorage)
      if (!directDependencies) return

      const transitiveDependencies: Reference[] = []
      const dependencies = [...directDependencies]
      const isDuplicate = (r: Reference): boolean => ref.equals(r) || dependencies.some((d) => d.equals(r))
      const appendToDependencies = (refs: Reference[]): void => {
        for (const r of refs) {
          if (isDuplicate(r)) continue
          dependencies.push(r)
          transitiveDependencies.push(r)
        }
      }

      for (let i = 0; i < dependencies.length; i++) {
        try {
          const dep = dependencies[i]
          const depDirectDependencies = dep.get(this.directDependenciesStorage)
          const depTransitiveDependencies = dep.get(this.transitiveDependenciesStorage)

          if (depTransitiveDependencies) appendToDependencies(depTransitiveDependencies)
          else if (depDirectDependencies) appendToDependencies(depDirectDependencies)
        } catch (err) {
          if (!this.options.tolerant) throw err
        }
      }

      ref.set(this.transitiveDependenciesStorage, transitiveDependencies)
      ref.set(this.dependenciesStorage, dependencies)
    })
  }

  parse(): OpenapiReferenceParserResult {
    this.buildDirectDependenciesStorage()
    this.buildTransitiveDependenciesStorage()

    const result: OpenapiReferenceParserResult = {}
    this.forEach((ref) => {
      const dependencies = ref.get(this.dependenciesStorage)
      const transitiveDependencies = ref.get(this.transitiveDependenciesStorage)
      const directDependencies = ref.get(this.directDependenciesStorage)

      if (!dependencies || !transitiveDependencies || !directDependencies) return

      ref.set(
        result,
        {
          dependencies: dependencies.map((r) => r.toString()),
          transitiveDependencies: transitiveDependencies.map((r) => r.toString()),
          directDependencies: directDependencies.map((r) => r.toString()),
        },
      )
    })

    return result
  }
}
