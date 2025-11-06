import { UriTemplateParser } from './parser'
import { UriTemplateContext } from './types/context'


export class UriTemplate {
  constructor(public template: string) {
  }

  expand(context: UriTemplateContext): string {
    const parser = new UriTemplateParser(this.template, context)
    return parser.expand(context)
  }
}

