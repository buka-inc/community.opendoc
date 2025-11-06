import { QueryOperator } from '~/types/query-operator'
import { Operator } from '../constants/operator.enum'


export function isQueryOperator(operator: Operator): operator is QueryOperator {
  return operator === Operator.SEMI || operator === Operator.AMP || operator === Operator.QUESTION
}
