import { SimpleGrid, Stack, Text, Box, Flex, Container } from '@chakra-ui/layout'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'

import FacebookIcon from '../../../../public/icon/facebook.svg'
import InstagramIcon from '../../../../public/icon/instagram.svg'
import LinkedinIcon from '../../../../public/icon/linkedin.svg'
import TwitterIcon from '../../../../public/icon/twitter.svg'
import { FooterListHeader } from './FooterListHeader'
import { FooterListLink } from './FooterListLink'
import { FooterSocialButton } from './FooterSocialButton'

const { publicRuntimeConfig } = getConfig()

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

  const socials: { label: string; href: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = []

  if (about.twitter) socials.push({ label: 'Twitter', href: about.twitter, icon: TwitterIcon })
  if (about.facebook) socials.push({ label: 'Facebook', href: about.facebook, icon: FacebookIcon })
  if (about.instagram) socials.push({ label: 'Instagram', href: about.instagram, icon: InstagramIcon })
  if (about.linkedin) socials.push({ label: 'Linkedin', href: about.linkedin, icon: LinkedinIcon })

  return (
    <Box bg="gray.900" color="gray.50" w="full">
      <Container as={Stack} maxW="6xl" p="1rem">
        <SimpleGrid
          columns={{ base: 1, md: about.display ? 3 : 2 }}
          spacing={8}
          justifyItems={{ base: 'center', md: 'start' }}
        >
          {about.display && (
            <Stack align={{ base: 'center', md: 'flex-start' }}>
              <FooterListHeader>{t('footer.contact')}</FooterListHeader>
              {about.name && (
                <Text fontWeight="400" fontSize="xs" mb={2} color="gray.50">
                  {about.name}
                </Text>
              )}
              {about.email && <FooterListLink href={`mailto:${about.email}`}>{t('footer.sendAMail')}</FooterListLink>}
            </Stack>
          )}

          <Stack align={{ base: 'center', md: 'flex-start' }}>
            <FooterListHeader>{t('footer.categories')}</FooterListHeader>
            {categories.map(({ localizedName, url }, index) => (
              <FooterListLink key={index} href={url}>
                {localizedName}
              </FooterListLink>
            ))}
          </Stack>

          <Stack align={{ base: 'center', md: 'flex-start' }}>
            <FooterListHeader>{t('footer.inOtherMedia')}</FooterListHeader>
            {about.display && socials.length && (
              <Stack direction="row" spacing={6} paddingBottom="2">
                {socials.map(({ label, href, icon: Icon }, index) => (
                  <FooterSocialButton key={index} label={label} href={href}>
                    <Icon width={30} height={30} />
                  </FooterSocialButton>
                ))}
              </Stack>
            )}
            <FooterListLink href="#">{t('footer.subscribe')}</FooterListLink>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box bg="gray.800" color="gray.50">
        <Flex p={4} justifyContent="space-between" fontSize="sm">
          <Text>{t('footer.copyright', { year: new Date().getFullYear() })}</Text>
          <Text>{t('footer.version', { versionNumber: publicRuntimeConfig?.version })}</Text>
        </Flex>
      </Box>
    </Box>
  )
}
