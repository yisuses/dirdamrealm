import { Box, Container, Stack, SimpleGrid, Text, Link, Flex } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { FaTwitter, FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { FooterListHeader } from './FooterListHeader'
import { FooterSocialButton } from './FooterSocialButton'

const ListLink = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <Link href={href} fontWeight="400" fontSize="xs" mb={2} color="gray.50">
      {children}
    </Link>
  )
}

export function Footer() {
  return (
    <Box bg="gray.900" color="gray.50" w="full">
      <Container as={Stack} maxW="6xl" py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8}>
          <Stack align="flex-start">
            <FooterListHeader>Contacto</FooterListHeader>
            <ListLink href={'#'}>José Madrid Pérez</ListLink>
            <ListLink href={'#'}>josem@halamadrid.com</ListLink>
          </Stack>

          <Stack align="flex-start">
            <FooterListHeader>Categorías</FooterListHeader>
            <ListLink href={'#'}>Deportes</ListLink>
            <ListLink href={'#'}>Cultura</ListLink>
            <ListLink href={'#'}>Economía</ListLink>
            <ListLink href={'#'}>Tecnología</ListLink>
          </Stack>

          <Stack>
            <FooterListHeader>Difunde la palabra</FooterListHeader>
            <Stack direction="row" spacing={6} paddingBottom="2">
              <FooterSocialButton label="Twitter" href={'#'}>
                <FaTwitter />
              </FooterSocialButton>
              <FooterSocialButton label="YouTube" href={'#'}>
                <FaYoutube />
              </FooterSocialButton>
              <FooterSocialButton label="Instagram" href={'#'}>
                <FaInstagram />
              </FooterSocialButton>
              <FooterSocialButton label="Linkedin" href={'#'}>
                <FaLinkedin />
              </FooterSocialButton>
            </Stack>
            <ListLink href="#">Suscribirse</ListLink>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box bg="gray.800" color="gray.50">
        <Flex p={4} justifyContent="space-between" fontSize="sm">
          <Text>© 2022 White Emotion. All rights reserved</Text>
          <Text>Version 1.0</Text>
        </Flex>
      </Box>
    </Box>
  )
}
