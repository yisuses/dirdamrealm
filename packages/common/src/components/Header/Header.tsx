import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, useColorModeValue, useColorMode, HStack, Divider, Center } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { HeaderDropdown } from './HeaderDropdown'
import { HeaderLink } from './HeaderLink'

export type HeaderProps = {
  links: ReactNode[]
  logo?: ReactNode
}

export function Header({ links, logo }: HeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Box bg={'transparent.200'} pr={{ base: 4, md: 8 }} pl={{ base: 2, md: 8 }} h={{ base: '60px', lg: '80px' }}>
      <Flex h="full" alignItems="center" justifyContent="space-between">
        {logo && (
          <HStack alignItems="center">
            <Box>{logo}</Box>
          </HStack>
        )}
        <Flex alignItems="center">
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }} alignItems="flex-end">
            {links.map((link, index) => (
              <HeaderLink key={index}>{link}</HeaderLink>
            ))}
          </HStack>
          <HeaderDropdown categories={links} />
          <Center h={{ base: '20px', md: '40px' }} w={{ base: '5px', md: '20px' }}>
            <Divider orientation="vertical" borderColor={useColorModeValue('gray.400', 'gray.600')} />
          </Center>
          <IconButton
            size="sm"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            aria-label="Toggle theme"
            bg="transparent"
            onClick={toggleColorMode}
          />
        </Flex>
      </Flex>
    </Box>
  )
}
