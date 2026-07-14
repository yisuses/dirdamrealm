'use client'

import { Flex, Heading, Link, Text } from '@chakra-ui/react'
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
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" pt="40" textAlign="center">
      <Heading as="h1" size="2xl">
        {t(statusCode === 404 ? 'notFoundPage.title' : 'errorPage.title')}
      </Heading>
      <Text fontSize={{ base: 'xl', md: '2xl' }} mt="2rem">
        {statusCode !== 404 ? (
          <Link as={NextLink} href={localizeHref('/')} onClick={() => window.location.reload()}>
            {t('errorPage.refreshPage')}
          </Link>
        ) : (
          <Link as={NextLink} href={localizeHref('/')}>
            {t('errorPage.goToHomePage')}
          </Link>
        )}
      </Text>
      <Text fontSize={{ base: 'lg', md: 'xl' }} mt="1rem">
        {t(statusCode === 404 ? 'notFoundPage.description' : 'errorPage.description')}
      </Text>
    </Flex>
  )
}
