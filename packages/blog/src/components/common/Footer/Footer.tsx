'use client'

import { Box, Flex, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'

import { HeaderLogo, SocialButton } from '@blog/components/common'
import { useLocalizeHref } from '@blog/hooks'

import { FooterListHeader } from './FooterListHeader'
import { FooterListLink } from './FooterListLink'

export interface FooterProps {
  categories: {
    name: string
    localizedName: string
    url: string
    code: string
  }[]
  about: About
}

export function Footer({ categories, about }: FooterProps) {
  const { t } = useTranslation('common')
  const localizeHref = useLocalizeHref()

  const socials: { label: string; href: string; icon: IconType }[] = []
  if (about.twitterUrl) socials.push({ label: 'X', href: about.twitterUrl, icon: FaXTwitter })
  if (about.facebookUrl) socials.push({ label: 'Facebook', href: about.facebookUrl, icon: FaFacebookF })
  if (about.instagramUrl) socials.push({ label: 'Instagram', href: about.instagramUrl, icon: FaInstagram })
  if (about.linkedinUrl) socials.push({ label: 'Linkedin', href: about.linkedinUrl, icon: FaLinkedinIn })

  return (
    <Box as="footer" mt={{ base: 20, md: 28 }} bg="bg.panel" borderTop="1px solid" borderColor="border" w="full">
      <SimpleGrid
        maxW="1248px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        pt={12}
        pb={8}
        columns={{ base: 1, md: about.display ? 3 : 2 }}
        templateColumns={{ md: about.display ? '2fr 1fr 1fr' : '2fr 1fr' }}
        gap={10}
      >
        <Stack gap={4}>
          <Flex asChild alignItems="center" gap="12px" width="fit-content">
            <NextLink href={localizeHref('/')} aria-label={t('header.logo')}>
              <Box color="accent" width="24px">
                <HeaderLogo width="100%" />
              </Box>
              <Text fontFamily="sans" fontWeight={500} fontSize="15px" letterSpacing="0.28em">
                WHITE EMOTION
              </Text>
            </NextLink>
          </Flex>
          <Text color="fg.muted" fontSize="17px" maxW="360px">
            {t('header.tagline')}
            {about.display && about.name && `. ${t('footer.writtenBy', { name: about.name })}`}
          </Text>
          {about.display && socials.length > 0 && (
            <Stack direction="row" gap={2}>
              {socials.map(({ label, href, icon: SocialIcon }) => (
                <SocialButton key={label} label={label} href={href}>
                  <SocialIcon size={15} />
                </SocialButton>
              ))}
            </Stack>
          )}
        </Stack>
        <Stack gap={0}>
          <FooterListHeader>{t('footer.categories')}</FooterListHeader>
          <Stack gap={2}>
            {categories.map(({ localizedName, url }) => (
              <FooterListLink key={url} href={url}>
                {localizedName}
              </FooterListLink>
            ))}
            <FooterListLink href={localizeHref('/archive/')}>{t('header.archive')}</FooterListLink>
          </Stack>
        </Stack>
        {about.display && (
          <Stack gap={0}>
            <FooterListHeader>{t('footer.contact')}</FooterListHeader>
            {about.email && (
              <FooterListLink href={`mailto:${about.email}`} forceAnchor>
                {t('footer.sendAMail')}
              </FooterListLink>
            )}
          </Stack>
        )}
      </SimpleGrid>
      <Flex
        borderTop="1px solid"
        borderColor="border"
        maxW="1248px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        py={4}
        direction={{ base: 'column', sm: 'row' }}
        justifyContent="space-between"
        gap={1}
        fontFamily="sans"
        fontSize="13px"
        color="fg.muted"
      >
        <Text>{t('footer.copyright', { year: new Date().getFullYear() })}</Text>
        <Text>{t('footer.version', { versionNumber: process.env.APP_VERSION })}</Text>
      </Flex>
    </Box>
  )
}
