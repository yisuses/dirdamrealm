// Config is inlined via next.config `env` (process.env) now, so set the test values here.
process.env.API_URL = 'https://api.com'
process.env.BASE_URL = 'https://example.com'

jest.mock(
  'next/image',
  () =>
    function Image({ src, alt, width, height }: any) {
      return <img src={src} alt={alt} width={width} height={height} />
    },
)
