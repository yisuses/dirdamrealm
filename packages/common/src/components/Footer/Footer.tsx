import { Box, Container, Stack, Text, Flex } from '@chakra-ui/react'
import { ReactNode } from 'react'

export interface FooterProps {
  children: ReactNode
  version: string
  copyright: string
}

export function Footer({ children, version, copyright }: FooterProps) {
  return (
    <Box bg="gray.900" color="gray.50" w="full">
      <Container as={Stack} maxW="6xl" py={10}>
        {children}
      </Container>
      <Box bg="gray.800" color="gray.50">
        <Flex p={4} justifyContent="space-between" fontSize="sm">
          <Text>{copyright}</Text>
          <Text>{version}</Text>
        </Flex>
      </Box>
    </Box>
  )
}
