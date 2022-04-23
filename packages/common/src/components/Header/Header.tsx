import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, useColorModeValue, useColorMode, HStack, Divider, Center } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { HeaderLink } from './HeaderLink'

export type HeaderProps = {
  links: ReactNode[]
  logo?: ReactNode
  menu?: ReactNode
  language?: ReactNode
}

export function Header({ links, logo, menu, language }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Flex
      position="absolute"
      width="100%"
      bg="transparent.800"
      zIndex="overlay"
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
          {menu}
          {logo && (
            <HStack alignItems="center">
              <Box>{logo}</Box>
            </HStack>
          )}
        </Flex>
        <Flex alignItems="center">
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }} alignItems="flex-end">
            {links.map((link, index) => (
              <HeaderLink key={index}>{link}</HeaderLink>
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
          {language}
        </Flex>
      </Flex>
    </Flex>
  )
}
