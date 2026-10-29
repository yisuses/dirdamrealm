'use client'

import { Box, Button, Flex, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { LuExternalLink, LuLogOut } from 'react-icons/lu'

import { logout } from '@blog/app/admin/actions'
import { adminSections } from '@blog/components/admin/sections'
import { HeaderLogo } from '@blog/components/common/Icon/HeaderLogo'

interface AdminShellProps {
  userName: string
  /** Where the public site reads from; until the cutover, panel edits are not live. */
  dataSource: 'strapi' | 'db'
  /** A Vercel preview: its own copy of the database, but the real image library. */
  preview?: boolean
  children: ReactNode
}

function isActive(pathname: string, href: string) {
  return href === '/admin/' ? pathname === href || pathname === '/admin' : pathname.startsWith(href)
}

export function AdminShell({ userName, dataSource, preview = false, children }: AdminShellProps) {
  const pathname = usePathname()
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')

  return (
    <Flex minH="100vh" bg="bg" color="fg" fontFamily="sans" fontSize="lg" direction={{ base: 'column', md: 'row' }}>
      <Flex
        as="aside"
        direction="column"
        bg="bg.panel"
        borderRightWidth={{ base: 0, md: 1 }}
        borderBottomWidth={{ base: 1, md: 0 }}
        borderColor="border"
        w={{ base: 'full', md: '260px' }}
        flex="none"
        position={{ md: 'sticky' }}
        top={0}
        h={{ md: '100vh' }}
        px={{ base: 2, md: 3.5 }}
        py={{ base: 2, md: 5 }}
      >
        <Flex align="center" gap={3} px={2.5} pb={{ base: 2, md: 6 }} pt={{ base: 1, md: 0 }}>
          <Box w="26px" color="accent" flex="none" aria-hidden>
            <HeaderLogo />
          </Box>
          <Box lineHeight="1.15">
            <Text fontFamily="heading" fontWeight={500} fontSize="xl">
              Panel de Emoción Blanca
            </Text>
          </Box>
        </Flex>
        <Box as="nav" aria-label="Secciones del panel" overflowX={{ base: 'auto', md: 'visible' }}>
          <Stack as="ul" gap={1} direction={{ base: 'row', md: 'column' }} listStyleType="none">
            {adminSections.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <Box as="li" key={href} flex="none">
                  <Link
                    asChild
                    display="flex"
                    alignItems="center"
                    gap={3}
                    px={3}
                    py={2.5}
                    borderRadius="10px"
                    fontWeight={500}
                    whiteSpace="nowrap"
                    color={active ? 'accent' : 'fg.muted'}
                    bg={active ? 'accent.soft' : 'transparent'}
                    aria-current={active ? 'page' : undefined}
                    _hover={{
                      bg: active ? 'accent.soft' : 'bg',
                      color: active ? 'accent' : 'fg',
                      textDecoration: 'none',
                    }}
                  >
                    <NextLink href={href}>
                      <Icon aria-hidden />
                      {label}
                    </NextLink>
                  </Link>
                </Box>
              )
            })}
          </Stack>
        </Box>
        <Box mt="auto" pt={4} display={{ base: 'none', md: 'block' }}>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              width="full"
              justifyContent="flex-start"
              gap={3}
              px={3}
              fontSize="lg"
              fontWeight={500}
              color="fg.muted"
              _hover={{ bg: 'bg', color: 'fg' }}
            >
              <LuLogOut aria-hidden />
              Cerrar sesión
            </Button>
          </form>
        </Box>
      </Flex>

      <Flex direction="column" flex={1} minW={0}>
        <Flex
          as="header"
          align="center"
          justify="flex-end"
          gap={5}
          px={{ base: 4, lg: 8 }}
          h="64px"
          bg="bg.panel"
          borderBottomWidth={1}
          borderColor="border"
          wrap="wrap"
        >
          <Link
            href="/"
            target="_blank"
            rel="noopener"
            color="accent"
            fontWeight={500}
            display="inline-flex"
            alignItems="center"
            gap={1.5}
          >
            Ver la web
            <LuExternalLink aria-hidden />
          </Link>
          <Flex align="center" gap={2.5}>
            <Flex
              aria-hidden
              w={9}
              h={9}
              borderRadius="full"
              bg="accent.soft"
              color="accent"
              align="center"
              justify="center"
              fontSize="sm"
              fontWeight={600}
            >
              {initials}
            </Flex>
            <Text fontWeight={500}>{userName}</Text>
          </Flex>
          <Box display={{ base: 'block', md: 'none' }}>
            <form action={logout}>
              <Button type="submit" size="sm" variant="outline" borderColor="border">
                Cerrar sesión
              </Button>
            </form>
          </Box>
        </Flex>

        {(preview || dataSource !== 'db') && (
          <Box
            role="status"
            bg="orange.50"
            color="orange.900"
            px={{ base: 4, lg: 8 }}
            py={3}
            borderBottomWidth={1}
            borderColor="orange.200"
          >
            {preview ? (
              <>
                <strong>Versión de prueba:</strong> pruébalo todo con tranquilidad, nada de lo que hagas aquí llega a
                whemotion.com. Las imágenes sí son las de verdad, así que aquí no se pueden borrar ni renombrar.
              </>
            ) : (
              <>
                <strong>Modo de pruebas:</strong> la web todavía lee de Strapi. Lo que cambies aquí no se verá en
                whemotion.com hasta la migración.
              </>
            )}
          </Box>
        )}

        {/* Full width so tables use the space they have; minW 0 makes them scroll inside on phones. */}
        <Box as="main" flex={1} minW={0} p={{ base: 4, lg: 8 }}>
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
