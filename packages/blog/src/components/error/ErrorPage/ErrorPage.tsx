import { Flex, Heading, Link, Text } from '@chakra-ui/layout'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'

interface ErrorProps {
  statusCode?: number | null
  error?: Error
  message?: string
  errorId?: string
  children?: never
}

export function ErrorPage({ statusCode = 500 }: ErrorProps) {
  const { t } = useTranslation('errorPage')
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" pt="40" textAlign="center">
      <Heading as="h1" size="2xl">
        {t(statusCode === 404 ? 'notFoundPage.title' : 'errorPage.title')}
      </Heading>
      <Text fontSize={{ base: 'xl', md: '2xl' }} mt="2rem">
        {statusCode !== 404 ? (
          <Link as={NextLink} href="/" onClick={() => window.location.reload()}>
            {t('errorPage.refreshPage')}
          </Link>
        ) : (
          <Link as={NextLink} href="/">
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
