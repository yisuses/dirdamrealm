import { Box, Heading, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { HeaderLogo } from '@blog/components/common/Icon/HeaderLogo'

/** The centred card with the site's logo used by the login and password recovery pages. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box as="main" minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p={4}>
      <Box as="section" bg="white" borderRadius="lg" boxShadow="lg" p={{ base: 6, md: 10 }} w="full" maxW="md">
        <Stack gap={6}>
          <Stack align="center" gap={3}>
            <Box color="gray.900" w="72px" aria-hidden>
              <HeaderLogo />
            </Box>
            <Heading as="h1" size="2xl" fontFamily="Roboto" textAlign="center">
              {title}
            </Heading>
          </Stack>
          {children}
        </Stack>
      </Box>
    </Box>
  )
}
