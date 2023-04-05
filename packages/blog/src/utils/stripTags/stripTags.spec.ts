import { stripTags } from './stripTags'

describe('stripTags', () => {
  it('should remove HTML tags from a string', () => {
    const input = '<p>This is a <strong>test</strong> string</p>'
    const expectedOutput = 'This is a test string'
    expect(stripTags(input)).toEqual(expectedOutput)
  })

  it('should remove multiple spaces and trim the string', () => {
    const input = '<p>   This has   extra    spaces   </p>'
    const expectedOutput = 'This has extra spaces'
    expect(stripTags(input)).toEqual(expectedOutput)
  })
})
