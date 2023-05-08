import { toBase64 } from './toBase64'

describe('toBase64', () => {
  it('should encode a string to base64', () => {
    expect(toBase64('Hello, world!')).toBe('SGVsbG8sIHdvcmxkIQ==')
    expect(toBase64('The quick brown fox jumps over the lazy dog')).toBe(
      'VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZw==',
    )
  })

  it('should handle special characters', () => {
    expect(toBase64('¿Cómo estás?')).toBe('wr9Dw7NtbyBlc3TDoXM/')
    expect(toBase64('こんにちは')).toBe('44GT44KT44Gr44Gh44Gv')
  })

  it('should return an empty string when given an empty string', () => {
    expect(toBase64('')).toBe('')
  })
})
