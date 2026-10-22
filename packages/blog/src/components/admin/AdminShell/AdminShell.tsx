'use client'

import { Box, Button, Flex, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { logout } from '@blog/app/admin/actions'
import { adminSections } from '@blog/components/admin/sections'
import { HeaderLogo } from '@blog/components/common/Icon/HeaderLogo'

interface AdminShellProps {
  userName: string
  /** Where the public site reads from; until the cutover, panel edits are not live. */
  dataSource: 'strapi' | 'db'
  children: ReactNode
}

function isActive(pathname: string, href: string) {
  return href === '/admin/' ? pathname === href || pathname === '/admin' : pathname.startsWith(href)
}

export function AdminShell({ userName, dataSource, children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <Flex direction="column" minH="100vh" bg="gray.50" color="gray.900" fontSize="lg">
      <Flex
        as="header"
        bg="blackAlpha.800"
        color="white"
        px={{ base: 4, lg: 8 }}
        py={3}
        align="center"
        justify="space-between"
        gap={4}
        wrap="wrap"
      >
        <Flex align="center" gap={3}>
          <Box w="36px" aria-hidden>
            <HeaderLogo />
          </Box>
          <Text fontFamily="Roboto" fontWeight="bold" fontSize="xl">
            Panel de Emoción Blanca
          </Text>
        </Flex>
        <Flex align="center" gap={3} wrap="wrap">
          <Text fontFamily="Roboto">{userName}</Text>
          <Link href="/" target="_blank" rel="noopener" color="white" fontFamily="Roboto" textDecoration="underline">
            Ver la web
          </Link>
          <form action={logout}>
            <Button
              type="submit"
              size="md"
              variant="outline"
              color="white"
              borderColor="whiteAlpha.700"
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              Cerrar sesión
            </Button>
          </form>
        </Flex>
      </Flex>

      {dataSource !== 'db' && (
        <Box
          role="status"
          bg="orange.100"
          color="orange.900"
          px={{ base: 4, lg: 8 }}
          py={3}
          borderBottomWidth={1}
          borderColor="orange.300"
        >
          <strong>Modo de pruebas:</strong> la web todavía lee de Strapi. Lo que cambies aquí no se verá en
          whemotion.com hasta la migración.
        </Box>
      )}

      <Flex flex={1} direction={{ base: 'column', md: 'row' }}>
        <Box
          as="nav"
          aria-label="Secciones del panel"
          bg="gray.800"
          w={{ base: 'full', md: '240px' }}
          py={{ base: 2, md: 6 }}
        >
          <Stack as="ul" gap={0} direction={{ base: 'row', md: 'column' }} wrap="wrap" listStyleType="none">
            {adminSections.map(({ href, label }) => {
              const active = isActive(pathname, href)
              return (
                <Box as="li" key={href}>
                  <Link
                    asChild
                    display="block"
                    px={6}
                    py={3}
                    fontFamily="Roboto"
                    color={active ? 'orange.300' : 'white'}
                    fontWeight={active ? 'bold' : 'normal'}
                    aria-current={active ? 'page' : undefined}
                    _hover={{ bg: 'whiteAlpha.200', textDecoration: 'none' }}
                  >
                    <NextLink href={href}>{label}</NextLink>
                  </Link>
                </Box>
              )
            })}
          </Stack>
        </Box>
        {/* minW 0: wide content (tables) scrolls inside instead of widening the page on phones. */}
        <Box as="main" flex={1} minW={0} p={{ base: 4, lg: 10 }} maxW="1100px">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
