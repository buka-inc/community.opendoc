import { Operator } from './constants/operator.enum'
import { isOperator } from './utils/is-operator'
import { isNotNil } from './utils/is-not-nil'
import { UriTemplateContext } from './types/context'
import { isJsonPrimitive } from './utils/is-json-primitive'
import { isQueryOperator } from './utils/is-query-operator'
import { encodeReserved, encodeUnreserved, encodeValue } from './utils/encode-value'

export class UriTemplateParser {
  constructor(public template: string, public context: UriTemplateContext) {
  }

  getValues(operator: Operator, key: string, modifier?: '*' | number): string[] {
    let value = this.context[key]
    const result: string[] = []


    if (isNotNil(value) && value !== '') {
      if (isJsonPrimitive(value)) {
        value = value.toString()

        if (modifier && modifier !== '*') {
          value = value.substring(0, modifier)
        }

        result.push(encodeValue(operator, value, isQueryOperator(operator) ? key : undefined))
      } else {
        if (modifier === '*') {
          if (Array.isArray(value)) {
            for (const item of value.filter(isNotNil)) {
              result.push(encodeValue(operator, String(item), isQueryOperator(operator) ? key : undefined))
            }
          } else {
            for (const [k, v] of Object.entries(value)) {
              if (isNotNil(v)) {
                result.push(encodeValue(operator, v.toString(), k))
              }
            }
          }
        } else {
          const tmp: string[] = []

          if (Array.isArray(value)) {
            for (const item of value.filter(isNotNil)) {
              tmp.push(encodeValue(operator, String(item)))
            }
          } else {
            for (const [k, v] of Object.entries(value)) {
              if (isNotNil(v)) {
                tmp.push(encodeUnreserved(k))
                tmp.push(encodeValue(operator, v.toString()))
              }
            }
          }

          if (isQueryOperator(operator)) {
            result.push(encodeUnreserved(key) + '=' + tmp.join(','))
          } else if (tmp.length !== 0) {
            result.push(tmp.join(','))
          }
        }
      }
    } else {
      if (operator === Operator.SEMI) {
        if (isNotNil(value)) {
          result.push(encodeUnreserved(key))
        }
      } else if (value === '' && (operator === Operator.AMP || operator === Operator.QUESTION)) {
        result.push(encodeUnreserved(key) + '=')
      } else if (value === '') {
        result.push('')
      }
    }
    return result
  }

  expand(): string {
    return this.template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, (_, expression: string, literal) => {
      if (expression) {
        let operator: Operator = Operator.NONE
        const values: string[] = []

        if (isOperator(expression.charAt(0))) {
          operator = expression.charAt(0) as Operator
          expression = expression.substr(1)
        }

        for (const variable of expression.split(/,/g)) {
          const matches = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable)
          if (!matches) continue
          const modifier = matches[2]
            ? parseInt(matches[2], 10)
            : matches[3] ? '*' : undefined
          values.push(...this.getValues(operator, matches[1], modifier))
        }

        if (operator && operator !== Operator.PLUS) {
          let separator = ','

          if (operator === Operator.QUESTION) {
            separator = '&'
          } else if (operator !== Operator.HASH) {
            separator = operator
          }
          return (values.length !== 0 ? operator : '') + values.join(separator)
        } else {
          return values.join(',')
        }
      } else {
        return encodeReserved(literal)
      }
    })
  }
}

