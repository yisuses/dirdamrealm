import { Button, IconButton } from '@chakra-ui/button'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Box, Center, Divider, Flex, HStack, Link, Text } from '@chakra-ui/layout'
import { useColorMode, useColorModeValue } from '@chakra-ui/system'
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
    <>
      <Text
        display={{ base: 'none', md: 'flex' }}
        color="white"
        fontFamily="spartan"
        fontWeight="700"
        fontSize={{ md: '20px', lg: '24px' }}
        height={{ md: '60px', lg: '80px' }}
        alignItems="center"
        pl={{ md: 0, lg: '1rem' }}
        letterSpacing={{ md: '0px', lg: '4px' }}
      >
        <NextLink href="/">WHITE EMOTION</NextLink>
      </Text>
      <Text
        color="white"
        fontFamily="spartan"
        fontWeight="700"
        fontSize="14px"
        height="60px"
        alignItems="center"
        display={{ base: 'flex', md: 'none' }}
        pl="1rem"
      >
        <NextLink href="/">W.E.</NextLink>
      </Text>
    </>
  )

  const categoryMenuLinks = categories.map(({ url, localizedName }, index) => (
    <NextLink href={url} key={index}>
      {localizedName}
    </NextLink>
  ))

  const categoryHeaderLinks = categories.map(({ url, name, localizedName, code }, index) => (
    <NextLink href={url} key={index} passHref>
      <Link
        href={url}
        px={{ md: 2, lg: 3 }}
        pt="5px"
        fontFamily="Roboto"
        fontWeight={{ md: 700, lg: 400 }}
        fontSize={{ md: 12, lg: 16 }}
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

  return (
    <Flex
      width="100%"
      bg="blackAlpha.800"
      pr={{ base: 4, md: 8 }}
      pl={{ base: 2, md: 8 }}
      h={{ base: '60px', lg: '80px' }}
      justifyContent="center"
    >
      <Flex
        h="full"
        alignItems="center"
        justifyContent="space-between"
        w={{ base: '100%', lg: '1440px' }}
        maxW={{ base: '100%', lg: '1440px' }}
      >
        <Flex h="full" alignItems="center">
          <HeaderMenu menuItems={categoryMenuLinks} />
          {logo && (
            <HStack alignItems="center">
              <Box>{logo}</Box>
            </HStack>
          )}
        </Flex>
        <Flex alignItems="center">
          <HStack as="nav" spacing={{ md: 0, lg: 4 }} display={{ base: 'none', md: 'flex' }} alignItems="flex-end">
            {categoryHeaderLinks}
          </HStack>
          <Center display={{ base: 'none' }} h={{ md: '40px' }} w={{ md: '20px' }}>
            <Divider orientation="vertical" borderColor={useColorModeValue('gray.400', 'gray.600')} />
          </Center>
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
        </Flex>
      </Flex>
    </Flex>
  )
}
