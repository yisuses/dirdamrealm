import { Flex, Heading, Link as ChakraLink, Text } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'

interface ErrorProps {
  statusCode?: number
}

export function Error({ statusCode = 500 }: ErrorProps) {
  const { t } = useTranslation('errorPage')
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" pt="40" textAlign="center">
      <Heading as="h1" size="2xl">
        {t('errorPage.title')}
      </Heading>
      <Text fontSize={{ base: 'xl', md: '2xl' }} mt="2rem">
        <Link href="/" passHref>
          {statusCode !== 404 ? (
            <ChakraLink onClick={() => window.location.reload()}>{t('errorPage.refreshPage')}</ChakraLink>
          ) : (
            <ChakraLink>{t('errorPage.goToHomePage')}</ChakraLink>
          )}
        </Link>
      </Text>
      <Text fontSize={{ base: 'lg', md: 'xl' }} mt="1rem">
        {t('errorPage.description')}
      </Text>
    </Flex>
  )
}
