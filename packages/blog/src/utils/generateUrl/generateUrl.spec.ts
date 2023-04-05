import { apiUrl, publicUrl } from './generateUrl'

describe('apiUrl', () => {
  it('should return the correct URL for a path without parameters', () => {
    const path = '/users'
    const result = apiUrl(path)
    expect(result).toEqual('https://api.com/users')
  })

  it('should return the correct URL for a path with one parameter as an object', () => {
    const path = '/users'
    const params = { id: 123 }
    const result = apiUrl(path, params)
    expect(result).toEqual('https://api.com/users?id=123')
  })

  it('should return the correct URL for a path with multiple parameters as objects', () => {
    const path = '/users'
    const params1 = { id: 123 }
    const params2 = { name: 'Alice', active: true }
    const result = apiUrl(path, params1, params2)
    expect(result).toEqual('https://api.com/users?id=123&name=Alice&active=true')
  })

  it('should return the correct URL for a path with one parameter as a string', () => {
    const path = '/users'
    const params = 'id=123'
    const result = apiUrl(path, params)
    expect(result).toEqual('https://api.com/users?id=123')
  })

  it('should return the correct URL for a path with multiple parameters as strings', () => {
    const path = '/users'
    const params = ['id=123', 'name=Alice', 'active=true', 'wadus=wrong=param']
    const result = apiUrl(path, ...params)
    expect(result).toEqual('https://api.com/users?id=123&name=Alice&active=true')
  })

  it('should replace the path query string with the params object', () => {
    const url = apiUrl('/path?key1=value2', { key1: 'value2' })
    expect(url).toEqual(`https://api.com/path?key1=value2`)
  })
})

describe('publicUrl', () => {
  it('should return the correct URL for a path', () => {
    const path = '/images/logo.png'
    const result = publicUrl(path)
    expect(result).toEqual('https://example.com/images/logo.png')
  })
})
