import { SimpleGrid, Stack, Text, Box, Container, Link, LinkProps } from '@chakra-ui/layout'
import { Trans, useTranslation } from 'next-i18next'
import getConfig from 'next/config'

import { SocialButton } from '@components'
import FacebookIcon from '../../../../public/icon/facebook.svg'
import InstagramIcon from '../../../../public/icon/instagram.svg'
import LinkedinIcon from '../../../../public/icon/linkedin.svg'
import TwitterIcon from '../../../../public/icon/twitter.svg'
import { FooterListHeader } from './FooterListHeader'
import { FooterListLink } from './FooterListLink'

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

const TransLink = ({ href, label, ...rest }: LinkProps & { label: string }) => (
  <Link href={href} title={label} target="_blank" rel="noreferrer" {...rest}>
    {label}
  </Link>
)

export function Footer({ categories, about }: FooterProps) {
  const { t } = useTranslation('common')

  const socials: { label: string; href: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = []

  if (about.twitterUrl) socials.push({ label: 'Twitter', href: about.twitterUrl, icon: TwitterIcon })
  if (about.facebookUrl) socials.push({ label: 'Facebook', href: about.facebookUrl, icon: FacebookIcon })
  if (about.instagramUrl) socials.push({ label: 'Instagram', href: about.instagramUrl, icon: InstagramIcon })
  if (about.linkedinUrl) socials.push({ label: 'Linkedin', href: about.linkedinUrl, icon: LinkedinIcon })

  return (
    <Box bg="gray.900" color="gray.50" w="full">
      <Container as={Stack} maxW="9xl" p="1rem">
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
              {about.email && (
                <FooterListLink href={`mailto:${about.email}`} forceAnchor>
                  {t('footer.sendAMail')}
                </FooterListLink>
              )}
            </Stack>
          )}

          <Stack align={{ base: 'center', md: 'flex-start' }}>
            <FooterListHeader>{t('footer.categories')}</FooterListHeader>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="8px" justifyItems={{ base: 'center', md: 'normal' }}>
              {categories.map(({ localizedName, url }, index) => (
                <FooterListLink key={index} href={url}>
                  {localizedName}
                </FooterListLink>
              ))}
            </SimpleGrid>
          </Stack>

          <Stack align={{ base: 'center', md: 'flex-start' }}>
            <FooterListHeader>{t('footer.inOtherMedia')}</FooterListHeader>
            {about.display && socials.length && (
              <Stack direction="row" spacing={6} paddingBottom="2">
                {socials.map(({ label, href, icon: Icon }, index) => (
                  <SocialButton key={index} label={label} href={href}>
                    <Icon width={30} height={30} />
                  </SocialButton>
                ))}
              </Stack>
            )}
            {/* TODO: suscriptions: <FooterListLink href="#">{t('footer.subscribe')}</FooterListLink> */}
          </Stack>
        </SimpleGrid>
      </Container>
      <Box bg="gray.800" color="gray.50">
        <Container as={Stack} width="100%" maxW="100%" p={4}>
          <SimpleGrid
            columns={{ base: 1, md: about.display ? 3 : 2 }}
            spacing={{ base: 2, md: 8 }}
            justifyItems={{ base: 'center' }}
            fontSize="sm"
          >
            <Text justifySelf={{ base: 'inherit', md: 'start' }}>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </Text>
            <Text>
              <Trans
                i18nKey="footer.theme"
                components={{
                  link: (
                    <TransLink href="https://www.figma.com/community/file/1036294505314600437" label="SimpleSmart" />
                  ),
                }}
              />
            </Text>
            <Text justifySelf={{ base: 'inherit', md: 'end' }}>
              {t('footer.version', { versionNumber: publicRuntimeConfig?.version })}
            </Text>
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  )
}
