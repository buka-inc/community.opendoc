import { Operator } from '~/constants/operator.enum'


const operators: string[] = Object.values(Operator)

export function isOperator(str: string): str is Operator {
  return operators.includes(str)
}
