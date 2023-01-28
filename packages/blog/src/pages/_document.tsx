import { ColorModeScript } from '@chakra-ui/color-mode'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import emotionTheme from '../themes/emotion.theme'

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="es">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
            rel="stylesheet"
          ></link>
        </Head>
        <body>
          <ColorModeScript initialColorMode={emotionTheme.config.initialColorMode} />
          <Main />
          <NextScript />
          <div id="modal-root"></div>
        </body>
      </Html>
    )
  }
}
