import { Box, Heading, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { HeaderLogo } from '@blog/components/common/Icon/HeaderLogo'

/** The centred card with the site's logo used by the login and password recovery pages. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      as="main"
      minH="100vh"
      bg="bg"
      bgImage="radial-gradient(circle at 50% 0%, var(--chakra-colors-accent-soft), transparent 60%)"
      color="fg"
      fontFamily="sans"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        as="section"
        bg="bg.panel"
        borderWidth={1}
        borderColor="border"
        borderRadius="18px"
        boxShadow="0 20px 50px rgba(0,0,0,.08)"
        p={{ base: 6, md: 10 }}
        w="full"
        maxW="md"
      >
        <Stack gap={6}>
          <Stack align="center" gap={3}>
            <Box color="accent" w="44px" aria-hidden>
              <HeaderLogo />
            </Box>
            <Heading as="h1" size="2xl" fontFamily="heading" fontWeight={500} textAlign="center">
              {title}
            </Heading>
          </Stack>
          {children}
        </Stack>
      </Box>
    </Box>
  )
}
