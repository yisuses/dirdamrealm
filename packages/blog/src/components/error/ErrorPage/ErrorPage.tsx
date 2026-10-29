'use client'

import { Button, Flex, Heading, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useTranslation } from 'react-i18next'

import { useLocalizeHref } from '@blog/hooks'

interface ErrorProps {
  statusCode?: number | null
  error?: Error
  message?: string
  errorId?: string
  children?: never
}

export function ErrorPage({ statusCode = 500 }: ErrorProps) {
  const { t } = useTranslation('errorPage')
  const localizeHref = useLocalizeHref()
  const notFound = statusCode === 404

  return (
    <Flex direction="column" alignItems="center" textAlign="center" px={4} pt={{ base: 12, md: 16 }} pb={8}>
      <Text
        fontFamily="heading"
        fontSize={{ base: '110px', md: '160px' }}
        lineHeight={1}
        fontWeight={500}
        color="accent"
      >
        {notFound ? '404' : t('errorPage.code')}
      </Text>
      <Heading as="h1" fontSize={{ base: '30px', md: '40px' }} fontWeight={500} mt={2.5} mb={2.5}>
        {t(notFound ? 'notFoundPage.title' : 'errorPage.title')}
      </Heading>
      <Text fontSize={{ base: '18px', md: '20px' }} color="fg.muted" maxW="520px" mb={6.5}>
        {t(notFound ? 'notFoundPage.description' : 'errorPage.description')}
      </Text>
      <Button asChild colorPalette="gold" rounded="full" px={6} size="lg" fontWeight={600}>
        {notFound ? (
          <NextLink href={localizeHref('/')}>{t('errorPage.goToHomePage')}</NextLink>
        ) : (
          <NextLink href={localizeHref('/')} onClick={() => window.location.reload()}>
            {t('errorPage.refreshPage')}
          </NextLink>
        )}
      </Button>
    </Flex>
  )
}
