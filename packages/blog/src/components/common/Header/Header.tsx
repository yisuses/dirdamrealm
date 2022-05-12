import { Button, IconButton } from '@chakra-ui/button'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Box, Center, Divider, Flex, HStack, Text } from '@chakra-ui/layout'
import { useColorMode, useColorModeValue } from '@chakra-ui/system'
import { useTranslation } from 'next-i18next'
import Image, { ImageProps } from 'next/image'
import { useRouter } from 'next/router'

import { NavLink } from '../NavLink'
import { LogoContainer } from './Header.styles'
import { HeaderLink } from './HeaderLink'
import { HeaderMenu } from './HeaderMenu'

export interface HeaderProps {
  categories: {
    url: string
    label: string
  }[]
}

export function Header({ categories }: HeaderProps) {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { colorMode, toggleColorMode } = useColorMode()

  const logoProps: Partial<ImageProps> = {
    alt: t('header.logo'),
    objectFit: 'contain',
    layout: 'fixed',
  }
  let logo = (
    <LogoContainer>
      <span className="desktop">
        <Image {...logoProps} src="/images/WE-logo-DESKTOP_WHITE.svg" width="256px" height="80px" />
      </span>
      <span className="mobile">
        <Image {...logoProps} src="/images/WE-logo-MOBILE_WHITE.svg" width="45px" height="45px" />
      </span>
    </LogoContainer>
  )

  logo = (
    <>
      <Text
        display={{ base: 'none', md: 'flex' }}
        color="white"
        fontFamily="spartan, sans-serif"
        fontWeight="700"
        fontSize={{ base: '14px', md: '20px', lg: '22px' }}
        height={{ base: '60px', lg: '80px' }}
        alignItems="center"
        pl={{ base: '1rem', lg: '2rem' }}
      >
        WHITE EMOTION
      </Text>
      <Text
        color="white"
        fontFamily="spartan, sans-serif"
        fontWeight="700"
        fontSize={{ base: '14px', md: '20px', lg: '22px' }}
        height={{ base: '60px', lg: '80px' }}
        alignItems="center"
        display={{ base: 'flex', md: 'none' }}
        pl="rem"
      >
        W.E.
      </Text>
    </>
  )

  const categoryLinks = categories.map(({ url, label }, index) => (
    <NavLink href={url} key={index}>
      <>{label}</>
    </NavLink>
  ))

  return (
    <Flex
      position="absolute"
      width="100%"
      bg="blackAlpha.800"
      zIndex="overlay"
      pr={{ base: 4, md: 8 }}
      pl={{ base: 2, md: 8 }}
      h={{ base: '60px', lg: '80px' }}
      justifyContent="center"
      css={{
        '@supports ((-webkit-backdrop-filter: none) or (backdrop-filter: none))': {
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0,0,0,0.7)',
        },
      }}
    >
      <Flex
        h="full"
        alignItems="center"
        justifyContent="space-between"
        w={{ base: '100%', lg: '1440px' }}
        maxW={{ base: '100%', lg: '1440px' }}
      >
        <Flex h="full" alignItems="center">
          <HeaderMenu menuItems={categoryLinks} />
          {logo && (
            <HStack alignItems="center">
              <Box>{logo}</Box>
            </HStack>
          )}
        </Flex>
        <Flex alignItems="center">
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }} alignItems="flex-end">
            {categoryLinks.map(link => (
              <HeaderLink key={link.key}>{link}</HeaderLink>
            ))}
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
