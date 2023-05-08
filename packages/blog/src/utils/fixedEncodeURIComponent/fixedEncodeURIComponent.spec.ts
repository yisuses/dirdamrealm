import { fixedEncodeURIComponent } from './fixedEncodeURIComponent'

describe('fixedEncodeURIComponent', () => {
  it('should correctly encode simple strings', () => {
    const input = 'Hello World'
    const expectedOutput = 'Hello%20World'

    const result = fixedEncodeURIComponent(input)

    expect(result).toEqual(expectedOutput)
  })

  it('should correctly encode special characters', () => {
    const input =
      'This string contains \'single quotes\', "double quotes", (parentheses), !exclamation marks!, and *asterisks*'
    const expectedOutput =
      'This%20string%20contains%20%27single%20quotes%27%2C%20%22double%20quotes%22%2C%20%28parentheses%29%2C%20%21exclamation%20marks%21%2C%20and%20%2aasterisks%2a'

    const result = fixedEncodeURIComponent(input)

    expect(result).toEqual(expectedOutput)
  })

  it('should correctly encode non-ASCII characters', () => {
    const input = 'こんにちは世界'
    const expectedOutput = '%E3%81%93%E3%82%93%E3%81%AB%E3%81%A1%E3%81%AF%E4%B8%96%E7%95%8C'

    const result = fixedEncodeURIComponent(input)

    expect(result).toEqual(expectedOutput)
  })
})
