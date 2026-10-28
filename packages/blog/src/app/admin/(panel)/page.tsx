import { Heading, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { adminSections } from '@blog/components/admin/sections'

export default function AdminHomePage() {
  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Heading as="h1" size="3xl" fontFamily="Roboto">
          Inicio
        </Heading>
        <Text>¿Qué quieres hacer hoy?</Text>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {adminSections
          .filter(({ href }) => href !== '/admin/')
          .map(({ href, label }) => (
            <Link
              key={href}
              asChild
              display="block"
              bg="white"
              borderRadius="lg"
              borderWidth={1}
              p={6}
              fontFamily="Roboto"
              fontSize="xl"
              fontWeight="bold"
              _hover={{ borderColor: 'orange.300', textDecoration: 'none' }}
            >
              <NextLink href={href}>{label}</NextLink>
            </Link>
          ))}
      </SimpleGrid>
    </Stack>
  )
}
