import { expect, test } from '@jest/globals'
import { OpenAPIV3 } from 'openapi-types'
import { OpenapiReferenceParser } from './parser'

const swagger: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Untitled',
    version: '1.0.0',
  },
  paths: {
    '/users/{id}': {
      put: {
        parameters: [
          { $ref: '#/components/parameters/id' },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        },
        responses: {
          200: {
            description: '',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    parameters: {
      id: {
        name: 'id',
        required: true,
        in: 'path',
        schema: { type: 'string' },
      },
    },

    schemas: {
      User: {
        type: 'object',
        properties: {
          friends: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          address: {
            $ref: '#/components/schemas/Address',
          },
          pets: {
            $ref: "Error-ModelName{namespace='java.util', name='List'}",
          },
        },
      },
      Address: {
        type: 'object',
        properties: {
          province: {
            type: 'string',
          },
          street: {
            type: 'string',
          },
        },
      },
    },
  },
}


test('OpenapiReferenceParser', () => {
  const parser = new OpenapiReferenceParser(swagger, { tolerant: true })
  const result = parser.parse()

  expect(result).toEqual({
    paths: {
      '/users/{id}': {
        put: {
          dependencies: [
            '#/components/parameters/id',
            '#/components/schemas/User',
            '#/components/schemas/Address',
            "Error-ModelName{namespace='java.util', name='List'}",
          ],
          directDependencies: [
            '#/components/parameters/id',
            '#/components/schemas/User',
          ],
          transitiveDependencies: [
            '#/components/schemas/Address',
            "Error-ModelName{namespace='java.util', name='List'}",
          ],
        },
      },
    },
    components: {
      parameters: {
        id: {
          dependencies: [],
          directDependencies: [],
          transitiveDependencies: [],
        },
      },
      schemas: {
        User: {
          dependencies: [
            '#/components/schemas/Address',
            "Error-ModelName{namespace='java.util', name='List'}",
          ],
          directDependencies: [
            '#/components/schemas/Address',
            "Error-ModelName{namespace='java.util', name='List'}",
          ],
          transitiveDependencies: [],
        },
        Address: {
          dependencies: [],
          directDependencies: [],
          transitiveDependencies: [],
        },
      },
    },
  })
})
