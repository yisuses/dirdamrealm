import { SimpleGrid, Stack } from '@chakra-ui/react'
import { Footer } from '@whe/common'
import getConfig from 'next/config'
import { FaTwitter, FaYoutube, FaInstagram, FaLinkedin } from 'react-icons/fa'

import { FooterListHeader } from './FooterListHeader'
import { FooterListLink } from './FooterListLink'
import { FooterSocialButton } from './FooterSocialButton'

const { publicRuntimeConfig } = getConfig()

interface WheFooterProps {
  categories: {
    label: string
    href: string
  }[]
}

export function WheFooter({ categories }: WheFooterProps) {
  const socials = [
    { label: 'Twitter', href: 'https://twitter.com/whe_io', icon: FaTwitter },
    { label: 'Youtube', href: 'https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw', icon: FaYoutube },
    { label: 'Instagram', href: 'https://www.instagram.com/whe_io/', icon: FaInstagram },
    { label: 'Linkedin', href: 'https://www.linkedin.com/company/whe-io/', icon: FaLinkedin },
  ]

  return (
    <Footer version={`Version ${publicRuntimeConfig?.version}`} copyright="© 2022 White Emotion. All rights reserved">
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8}>
        <Stack align="flex-start">
          <FooterListHeader>Contacto</FooterListHeader>
          <FooterListLink href={'#'}>José Madrid Pérez</FooterListLink>
          <FooterListLink href={'#'}>josem@halamadrid.com</FooterListLink>
        </Stack>

        <Stack align="flex-start">
          <FooterListHeader>Categorías</FooterListHeader>
          {categories.map(({ label, href }, index) => (
            <FooterListLink key={index} href={href}>
              {label}
            </FooterListLink>
          ))}
        </Stack>

        <Stack>
          <FooterListHeader>Difunde la palabra</FooterListHeader>
          <Stack direction="row" spacing={6} paddingBottom="2">
            {socials.map(({ label, href, icon: Icon }, index) => (
              <FooterSocialButton key={index} label={label} href={href}>
                <Icon />
              </FooterSocialButton>
            ))}
          </Stack>
          <FooterListLink href="#">Suscribirse</FooterListLink>
        </Stack>
      </SimpleGrid>
    </Footer>
  )
}
