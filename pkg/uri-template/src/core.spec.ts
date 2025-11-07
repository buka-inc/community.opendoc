import { describe, it, expect } from '@jest/globals'
import { UriTemplate } from './core'
import { UriTemplateContext } from './types/context'

describe('UriTemplate', () => {
  describe('Basic', () => {
    it('expands simple variable', () => {
      const template = new UriTemplate('/users/{id}')
      const context: UriTemplateContext = { id: 123 }
      expect(template.expand(context)).toBe('/users/123')
    })

    it('expands string variable', () => {
      const template = new UriTemplate('/users/{username}')
      const context: UriTemplateContext = { username: 'john' }
      expect(template.expand(context)).toBe('/users/john')
    })

    it('expands multiple variables', () => {
      const template = new UriTemplate('/users/{id}/posts/{postId}')
      const context: UriTemplateContext = { id: 123, postId: 456 }
      expect(template.expand(context)).toBe('/users/123/posts/456')
    })

    it('handles missing variables', () => {
      const template = new UriTemplate('/users/{id}')
      const context: UriTemplateContext = {}
      expect(template.expand(context)).toBe('/users/')
    })

    it('handles empty string', () => {
      const template = new UriTemplate('/users/{id}')
      const context: UriTemplateContext = { id: '' }
      expect(template.expand(context)).toBe('/users/')
    })
  })

  describe('Operators', () => {
    describe('Reserved (+)', () => {
      it('expands reserved characters', () => {
        const template = new UriTemplate('{+path}')
        const context: UriTemplateContext = { path: '/foo/bar' }
        expect(template.expand(context)).toBe('/foo/bar')
      })

      it('expands with prefix', () => {
        const template = new UriTemplate('/prefix{+path}')
        const context: UriTemplateContext = { path: '/foo/bar' }
        expect(template.expand(context)).toBe('/prefix/foo/bar')
      })

      it('preserves special characters', () => {
        const template = new UriTemplate('/api{+path}')
        const context: UriTemplateContext = { path: '/users?id=1&name=john' }
        expect(template.expand(context)).toBe('/api/users?id=1&name=john')
      })

      it('encodes spaces only', () => {
        const template = new UriTemplate('{+x}')
        const context: UriTemplateContext = { x: 'hello world!' }
        expect(template.expand(context)).toBe('hello%20world!')
      })

      it('expands multiple variables', () => {
        const template = new UriTemplate('/base{+x,y}')
        const context: UriTemplateContext = { x: '/hello', y: '/world' }
        expect(template.expand(context)).toBe('/base/hello,/world')
      })
    })

    describe('Fragment (#)', () => {
      it('adds # prefix', () => {
        const template = new UriTemplate('{#section}')
        const context: UriTemplateContext = { section: 'intro' }
        expect(template.expand(context)).toBe('#intro')
      })

      it('expands multiple variables', () => {
        const template = new UriTemplate('{#x,y}')
        const context: UriTemplateContext = { x: 'hello', y: 'world' }
        expect(template.expand(context)).toBe('#hello,world')
      })

      it('omits # for empty values', () => {
        const template = new UriTemplate('{#section}')
        const context: UriTemplateContext = {}
        expect(template.expand(context)).toBe('')
      })
    })

    describe('Dot (.)', () => {
      it('adds dot prefix', () => {
        const template = new UriTemplate('/file{.ext}')
        const context: UriTemplateContext = { ext: 'json' }
        expect(template.expand(context)).toBe('/file.json')
      })

      it('expands multiple variables', () => {
        const template = new UriTemplate('{.x,y}')
        const context: UriTemplateContext = { x: 'a', y: 'b' }
        expect(template.expand(context)).toBe('.a.b')
      })
    })

    describe('Path (/)', () => {
      it('adds slash prefix', () => {
        const template = new UriTemplate('/api{/path}')
        const context: UriTemplateContext = { path: 'users' }
        expect(template.expand(context)).toBe('/api/users')
      })

      it('expands multiple variables', () => {
        const template = new UriTemplate('{/x,y}')
        const context: UriTemplateContext = { x: 'api', y: 'users' }
        expect(template.expand(context)).toBe('/api/users')
      })
    })

    describe('Semicolon (;)', () => {
      it('adds semicolon prefix', () => {
        const template = new UriTemplate('/map{;x,y}')
        const context: UriTemplateContext = { x: 100, y: 200 }
        expect(template.expand(context)).toBe('/map;x=100;y=200')
      })

      it('handles empty values', () => {
        const template = new UriTemplate('/map{;x}')
        const context: UriTemplateContext = { x: '' }
        expect(template.expand(context)).toBe('/map;x')
      })
    })

    describe('Query (?)', () => {
      it('adds ? prefix and & separator', () => {
        const template = new UriTemplate('/search{?q,page}')
        const context: UriTemplateContext = { q: 'hello', page: 1 }
        expect(template.expand(context)).toBe('/search?q=hello&page=1')
      })

      it('expands single parameter', () => {
        const template = new UriTemplate('/search{?q}')
        const context: UriTemplateContext = { q: 'test' }
        expect(template.expand(context)).toBe('/search?q=test')
      })

      it('handles empty string', () => {
        const template = new UriTemplate('/search{?q}')
        const context: UriTemplateContext = { q: '' }
        expect(template.expand(context)).toBe('/search?q=')
      })
    })

    describe('Query Continuation (&)', () => {
      it('adds & prefix', () => {
        const template = new UriTemplate('/search?fixed=true{&q,page}')
        const context: UriTemplateContext = { q: 'hello', page: 1 }
        expect(template.expand(context)).toBe('/search?fixed=true&q=hello&page=1')
      })

      it('handles empty string', () => {
        const template = new UriTemplate('/search?fixed=true{&q}')
        const context: UriTemplateContext = { q: '' }
        expect(template.expand(context)).toBe('/search?fixed=true&q=')
      })
    })
  })

  describe('Modifiers', () => {
    describe('Prefix (:n)', () => {
      it('limits string length', () => {
        const template = new UriTemplate('/users/{id:3}')
        const context: UriTemplateContext = { id: '123456' }
        expect(template.expand(context)).toBe('/users/123')
      })

      it('handles short strings', () => {
        const template = new UriTemplate('/users/{id:10}')
        const context: UriTemplateContext = { id: '123' }
        expect(template.expand(context)).toBe('/users/123')
      })
    })

    describe('Explode (*)', () => {
      it('explodes array elements', () => {
        const template = new UriTemplate('/items{?list*}')
        const context: UriTemplateContext = { list: ['a', 'b', 'c'] }
        expect(template.expand(context)).toBe('/items?list=a&list=b&list=c')
      })

      it('explodes object properties', () => {
        const template = new UriTemplate('/search{?filters*}')
        const context: UriTemplateContext = {
          filters: { type: 'user', status: 'active' },
        }
        expect(template.expand(context)).toBe('/search?type=user&status=active')
      })

      it('explodes simple array', () => {
        const template = new UriTemplate('{x*}')
        const context: UriTemplateContext = { x: ['a', 'b', 'c'] }
        expect(template.expand(context)).toBe('a,b,c')
      })

      it('explodes path array', () => {
        const template = new UriTemplate('{/list*}')
        const context: UriTemplateContext = { list: ['a', 'b', 'c'] }
        expect(template.expand(context)).toBe('/a/b/c')
      })
    })
  })

  describe('Data Types', () => {
    describe('Arrays', () => {
      it('joins with commas', () => {
        const template = new UriTemplate('/items/{list}')
        const context: UriTemplateContext = { list: ['a', 'b', 'c'] }
        expect(template.expand(context)).toBe('/items/a,b,c')
      })

      it('handles empty arrays', () => {
        const template = new UriTemplate('/items/{list}')
        const context: UriTemplateContext = { list: [] }
        expect(template.expand(context)).toBe('/items/')
      })

      it('filters null values', () => {
        const template = new UriTemplate('/items/{list}')
        const context: UriTemplateContext = { list: ['a', null, 'b', 'c'] }
        expect(template.expand(context)).toBe('/items/a,b,c')
      })
    })

    describe('Objects', () => {
      it('expands as key-value pairs', () => {
        const template = new UriTemplate('/search{?params}')
        const context: UriTemplateContext = {
          params: { q: 'test', page: '1' },
        }
        expect(template.expand(context)).toBe('/search?params=q,test,page,1')
      })

      it('filters null values', () => {
        const template = new UriTemplate('{obj}')

        const context: UriTemplateContext = {
          obj: { a: '1', b: null, c: '3' },
        }
        expect(template.expand(context)).toBe('a,1,c,3')
      })
    })
  })

  describe('Encoding', () => {
    it('encodes special characters', () => {
      const template = new UriTemplate('/search/{query}')
      const context: UriTemplateContext = { query: 'hello world' }
      expect(template.expand(context)).toBe('/search/hello%20world')
    })

    it('encodes Unicode characters', () => {
      const template = new UriTemplate('/search/{query}')
      const context: UriTemplateContext = { query: '你好' }
      expect(template.expand(context)).toBe('/search/%E4%BD%A0%E5%A5%BD')
    })

    it('preserves reserved with +', () => {
      const template = new UriTemplate('{+reserved}')
      const context: UriTemplateContext = { reserved: '/:?#[]@!$&\'()*+,;=' }
      expect(template.expand(context)).toBe('/:?#[]@!$&\'()*+,;=')
    })
  })

  describe('Advanced', () => {
    it('mixed operators', () => {
      const template = new UriTemplate('/api/{version}/users{/id}{?query,page}{&sort}')
      const context: UriTemplateContext = {
        version: 'v1',
        id: 123,
        query: 'john',
        page: 2,
        sort: 'name',
      }
      expect(template.expand(context)).toBe('/api/v1/users/123?query=john&page=2&sort=name')
    })

    it('partial context', () => {
      const template = new UriTemplate('/api/{version}/users{/id}{?query}')
      const context: UriTemplateContext = {
        version: 'v1',
        query: 'john',
      }
      expect(template.expand(context)).toBe('/api/v1/users?query=john')
    })

    it('RFC 6570 spec examples', () => {
      const context: UriTemplateContext = {
        count: ['one', 'two', 'three'],
        dom: ['example', 'com'],
        dub: 'me/too',
        hello: 'Hello World!',
        half: '50%',
        var: 'value',
        who: 'fred',
        base: 'http://example.com/home/',
        path: '/foo/bar',
        list: ['red', 'green', 'blue'],
        keys: { semi: ';', dot: '.', comma: ',' },
        v: 6,
        x: 1024,
        y: 768,
        empty: '',
        empty_keys: {},
        undef: null,
      }

      expect(new UriTemplate('{var}').expand(context)).toBe('value')
      expect(new UriTemplate('{hello}').expand(context)).toBe('Hello%20World%21')
      expect(new UriTemplate('{+var}').expand(context)).toBe('value')
      expect(new UriTemplate('{+hello}').expand(context)).toBe('Hello%20World!')
      expect(new UriTemplate('{+path}/here').expand(context)).toBe('/foo/bar/here')
      expect(new UriTemplate('here?ref={+path}').expand(context)).toBe('here?ref=/foo/bar')
      expect(new UriTemplate('X{#var}').expand(context)).toBe('X#value')
      expect(new UriTemplate('X{#hello}').expand(context)).toBe('X#Hello%20World!')
    })
  })

  describe('Edge Cases', () => {
    it('no variables', () => {
      const template = new UriTemplate('/api/users')
      const context: UriTemplateContext = {}
      expect(template.expand(context)).toBe('/api/users')
    })

    it('empty template', () => {
      const template = new UriTemplate('')
      const context: UriTemplateContext = { id: 123 }
      expect(template.expand(context)).toBe('')
    })

    it('boolean values', () => {
      const template = new UriTemplate('/flag/{enabled}')
      const context: UriTemplateContext = { enabled: true }
      expect(template.expand(context)).toBe('/flag/true')
    })

    it('zero value', () => {
      const template = new UriTemplate('/value/{num}')
      const context: UriTemplateContext = { num: 0 }
      expect(template.expand(context)).toBe('/value/0')
    })

    it('negative numbers', () => {
      const template = new UriTemplate('/value/{num}')
      const context: UriTemplateContext = { num: -123 }
      expect(template.expand(context)).toBe('/value/-123')
    })
  })
})
