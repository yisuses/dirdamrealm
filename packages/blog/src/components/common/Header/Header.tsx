import { Button, IconButton } from '@chakra-ui/button'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Box, Center, Divider, Flex, HStack, Link } from '@chakra-ui/layout'
import { useColorMode } from '@chakra-ui/system'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { buildCategoryPath } from '@utils/urlBuilder'
import { HeaderMenu } from './HeaderMenu'

export interface HeaderProps {
  categories: {
    url: string
    code: string
    name: string
    localizedName: string
  }[]
}

export function Header({ categories }: HeaderProps) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { colorMode, toggleColorMode } = useColorMode()

  const logo = (
    <NextLink href="/">
      <Center
        color="white"
        fontFamily="spartan"
        fontWeight="700"
        fontSize={{ md: '20px', lg: '24px' }}
        height={{ md: '60px', lg: '80px' }}
        alignItems="center"
        pl={{ md: 0, xl: '1rem' }}
        py={{ base: '1rem', md: 0 }}
        letterSpacing={{ md: '0px', lg: '4px' }}
        whiteSpace="nowrap"
        cursor="pointer"
        marginRight={{ md: 0, lg: '-4px' }}
      >
        WHITE EMOTION
      </Center>
    </NextLink>
  )

  const categoryHeaderLinks = categories.map(({ url, name, localizedName, code }, index) => (
    <NextLink href={url} key={index} passHref>
      <Link
        px={{ md: 2, lg: 3 }}
        pt="5px"
        fontFamily="Roboto"
        color={router.asPath === buildCategoryPath(code, name) ? 'orange.300' : 'white'}
        _focus={{
          boxShadow: 'none',
        }}
        _hover={{
          textDecoration: 'none',
          '::after': {
            width: '100%',
          },
        }}
        _active={{
          '::after': {
            width: 'calc(100% + 10px)',
            marginLeft: '-5px',
            transition: 'none',
          },
        }}
        _after={{
          content: '""',
          display: 'block',
          width: 0,
          height: '2px',
          marginTop: '3px',
          bg: 'orange.300',
          transition: 'width 0.2s',
        }}
      >
        {localizedName}
      </Link>
    </NextLink>
  ))

  const actionButtons = (
    <>
      <IconButton
        size="sm"
        icon={colorMode === 'light' ? <MoonIcon color="white" /> : <SunIcon />}
        aria-label="Toggle theme"
        bg="transparent"
        onClick={toggleColorMode}
        _hover={{ bg: 'whiteAlpha.300' }}
      />
      <Button
        size="sm"
        fontFamily="Roboto"
        aria-label={t('header.changeLanguage')}
        bg="transparent"
        onClick={() => {
          router.push(router.asPath, undefined, { locale: router.locale === 'es' ? 'en' : 'es' })
        }}
        color="white"
        _hover={{ backgroundColor: 'transparent' }}
        _active={{ backgroundColor: 'transparent' }}
      >
        {router.locale === 'es' ? 'ES' : 'EN'}
      </Button>
    </>
  )

  return (
    <Flex width="100%" bg="blackAlpha.800" pr={{ base: 4, lg: 8 }} pl={{ base: 2, lg: 8 }} justifyContent="center">
      <Flex
        h="full"
        alignItems="center"
        justifyContent="space-between"
        w={{ base: '100%', lg: '1440px' }}
        maxW={{ base: '100%', lg: '1440px' }}
        direction={{ base: 'column', xl: 'row' }}
      >
        <Flex
          h="full"
          alignItems="center"
          justifyContent={{ base: 'space-between', lg: 'center' }}
          width={{ base: '100%', lg: 'fit-content' }}
        >
          <HeaderMenu categories={categories} />
          {logo}
          <Box display={{ base: 'block', lg: 'none' }}>{actionButtons}</Box>
        </Flex>
        <Divider orientation="horizontal" w={400} display={{ base: 'none', lg: 'block', xl: 'none' }} />
        <Flex
          alignItems="center"
          display={{ base: 'none', lg: 'flex' }}
          justifyContent={{ lg: 'space-between', xl: 'flex-end' }}
          width="100%"
        >
          <HStack as="nav" spacing={4} py={{ lg: 4, xl: 0 }} alignItems="flex-end">
            {categoryHeaderLinks}
          </HStack>
          <Box>{actionButtons}</Box>
        </Flex>
      </Flex>
    </Flex>
  )
}
