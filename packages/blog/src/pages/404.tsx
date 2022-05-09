import { Heading, Text, Link as ChakraLink, Flex } from '@chakra-ui/layout'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'

function Custom404Page() {
  const { t } = useTranslation('notFoundPage')
  return (
    <Flex direction="column" alignItems="center" justifyContent="center" pt="40" textAlign="center">
      <Heading as="h1" size="2xl">
        {t('notFoundPage.title')}
      </Heading>
      <Text fontSize={{ base: 'xl', md: '2xl' }} mt="2rem">
        <Link href="/" passHref>
          <ChakraLink>{t('notFoundPage.goToHomePage')}</ChakraLink>
        </Link>
      </Text>
      <Text fontSize={{ base: 'lg', md: 'xl' }} mt="1rem">
        {t('notFoundPage.description')}
      </Text>
    </Flex>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'notFoundPage'])),
  },
})

export default Custom404Page
