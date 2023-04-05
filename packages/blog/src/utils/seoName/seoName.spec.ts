import { seoName } from './seoName'

describe('seoName', () => {
  it('should return a slugified string', () => {
    const input = 'This is a test string'
    const expectedOutput = 'this-is-a-test-string'
    expect(seoName(input)).toEqual(expectedOutput)
  })

  it('should handle special characters', () => {
    const input = 'This has special characters: áéíóúñ'
    const expectedOutput = 'this-has-special-characters-aeioun'
    expect(seoName(input)).toEqual(expectedOutput)
  })
})
