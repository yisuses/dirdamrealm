import { Button } from '@chakra-ui/button'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { Text } from '@chakra-ui/layout'
import { useTranslation } from 'next-i18next'
import { useRef } from 'react'
import { CookieConsent } from 'react-cookie-consent'

export function CookieBanner() {
  const { t } = useTranslation('common')
  const cookieConsentRef = useRef<CookieConsent>(null)

  return (
    <CookieConsent
      cookieName="wheblog-consent"
      ref={cookieConsentRef}
      style={{ background: useColorModeValue('#1a202c', 'white'), fontFamily: 'Spartan' }}
      buttonStyle={{ display: 'none' }}
      acceptOnScroll
      acceptOnScrollPercentage={75}
      ButtonComponent={() => (
        <Button
          size="sm"
          fontFamily="Roboto"
          aria-label={t('cookieBanner.acceptCookies')}
          borderRadius="4px"
          background="orange.300"
          mr={4}
          onClick={() => cookieConsentRef?.current?.accept()}
        >
          <Text color={useColorModeValue('white', 'gray.800')}>{t('cookieBanner.accept')}</Text>
        </Button>
      )}
    >
      <Text color={useColorModeValue('white', 'gray.800')}>{t('cookieBanner.message')}</Text>
    </CookieConsent>
  )
}
