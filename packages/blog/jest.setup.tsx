import { setConfig } from 'next/config'
import { publicRuntimeConfig, serverRuntimeConfig } from './next.config'

setConfig({
  publicRuntimeConfig: {
    ...publicRuntimeConfig,
    API_URL: 'https://api.com',
    BASE_URL: 'https://example.com',
    DEPLOY_ENV: 'test',
  },
  serverRuntimeConfig: {
    ...serverRuntimeConfig,
  },
})

jest.mock(
  'next/image',
  () =>
    function Image({ src, alt, width, height }: any) {
      return <img src={src} alt={alt} width={width} height={height} />
    },
)
