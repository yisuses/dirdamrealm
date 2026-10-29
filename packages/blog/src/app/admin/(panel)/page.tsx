import { Box, Heading, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { adminSections } from '@blog/components/admin/sections'

export default function AdminHomePage() {
  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading as="h1" size="3xl" fontFamily="heading" fontWeight={500}>
          Inicio
        </Heading>
        <Text color="fg.muted">¿Qué quieres hacer hoy?</Text>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        {adminSections
          .filter(({ href }) => href !== '/admin/')
          .map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              asChild
              display="flex"
              alignItems="center"
              gap={4}
              bg="bg.panel"
              borderRadius="14px"
              borderWidth={1}
              borderColor="border"
              p={6}
              fontFamily="heading"
              fontWeight={500}
              fontSize="2xl"
              transition="border-color .2s"
              _hover={{ borderColor: 'accent', textDecoration: 'none' }}
            >
              <NextLink href={href}>
                <Box
                  as="span"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w={11}
                  h={11}
                  flex="none"
                  borderRadius="full"
                  bg="accent.soft"
                  color="accent"
                  fontSize="xl"
                  aria-hidden
                >
                  <Icon />
                </Box>
                {label}
              </NextLink>
            </Link>
          ))}
      </SimpleGrid>
    </Stack>
  )
}
