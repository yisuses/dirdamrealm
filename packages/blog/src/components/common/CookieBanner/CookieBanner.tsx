'use client'

import { Button, Text } from '@chakra-ui/react'
import { useRef } from 'react'
import { CookieConsent } from 'react-cookie-consent'
import { useTranslation } from 'react-i18next'

export function CookieBanner() {
  const { t } = useTranslation('common')
  const cookieConsentRef = useRef<CookieConsent>(null)

  return (
    <CookieConsent
      cookieName="wheblog-consent"
      ref={cookieConsentRef}
      // A small card in the corner rather than a bar across the page.
      style={{
        left: 16,
        bottom: 16,
        width: 'auto',
        maxWidth: 'min(360px, calc(100vw - 32px))',
        flexDirection: 'column',
        alignItems: 'flex-start',
        background: 'var(--chakra-colors-bg-panel)',
        color: 'var(--chakra-colors-fg)',
        border: '1px solid var(--chakra-colors-border)',
        borderRadius: 14,
        boxShadow: '0 10px 30px rgba(0,0,0,.12)',
        fontFamily: 'var(--chakra-fonts-sans)',
        fontSize: 14,
        lineHeight: 1.5,
      }}
      contentStyle={{ flex: 'none', margin: '18px 20px 12px' }}
      buttonStyle={{ display: 'none' }}
      acceptOnScroll
      acceptOnScrollPercentage={75}
      ButtonComponent={() => (
        <Button
          size="sm"
          colorPalette="gold"
          rounded="full"
          px={5}
          ml={5}
          mb={4}
          aria-label={t('cookieBanner.acceptCookies')}
          onClick={() => cookieConsentRef?.current?.accept()}
        >
          {t('cookieBanner.accept')}
        </Button>
      )}
    >
      <Text>{t('cookieBanner.message')}</Text>
    </CookieConsent>
  )
}
