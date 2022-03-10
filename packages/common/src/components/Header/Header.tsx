import { MoonIcon, SunIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Flex,
  Link,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  useColorMode,
  HStack,
  Divider,
  Center,
  useMediaQuery,
  Text,
} from '@chakra-ui/react'
import { ReactNode } from 'react'

export type HeaderProps = {
  categories: string[]
  logoSM?: ReactNode
  logoLG?: ReactNode
}

export function Header({ categories, logoLG, logoSM }: HeaderProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()
  const [isLargerThan1024] = useMediaQuery('(min-width: 1024px)')

  return (
    <Box
      bg={useColorModeValue('gray.100', 'gray.900')}
      pr={{ base: 4, md: 8 }}
      pl={{ base: 2, md: 8 }}
      h={{ base: '60px', md: '80px' }}
    >
      <Flex h="full" alignItems="center" justifyContent="space-between">
        <HStack alignItems="center">
          <Box>{isLargerThan1024 ? logoLG : logoSM}</Box>
        </HStack>
        <Flex alignItems="center">
          <HStack as="nav" spacing={4} display={{ base: 'none', md: 'flex' }} alignItems="flex-end">
            {categories.map(link => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </HStack>
          <Menu>
            <MenuButton as={IconButton} display={{ md: 'none' }} variant="link" cursor="pointer" minW={0}>
              <IconButton
                size={'sm'}
                icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                aria-label="Open Menu"
                onClick={isOpen ? onClose : onOpen}
                bg={useColorModeValue('gray.100', 'gray.900')}
              />
            </MenuButton>
            <MenuList minWidth="max-content" fontSize={isLargerThan1024 ? 'md' : 'sm'}>
              {categories.map(link => (
                <MenuItem key={link}>
                  <NavLink>{link}</NavLink>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Center h={{ base: '20px', md: '40px' }} w={{ base: '5px', md: '20px' }}>
            <Divider orientation="vertical" borderColor={useColorModeValue('gray.400', 'gray.600')} />
          </Center>
          <IconButton
            size={'sm'}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            aria-label="Toggle theme"
            bg={useColorModeValue('gray.100', 'gray.900')}
            onClick={toggleColorMode}
          />
        </Flex>
      </Flex>
    </Box>
  )
}

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={'#'}
  >
    <Text>{children}</Text>
  </Link>
)
