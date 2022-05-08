import { SimpleGrid, Stack, Text } from '@chakra-ui/layout'
import { useTranslation } from 'next-i18next'
import getConfig from 'next/config'
import FacebookIcon from '../../../../public/icon/facebook.svg'
import InstagramIcon from '../../../../public/icon/instagram.svg'
import LinkedinIcon from '../../../../public/icon/linkedin.svg'
import TwitterIcon from '../../../../public/icon/twitter.svg'
import { Footer } from '../Footer/Footer'

import { FooterListHeader } from './FooterListHeader'
import { FooterListLink } from './FooterListLink'
import { FooterSocialButton } from './FooterSocialButton'

const { publicRuntimeConfig } = getConfig()

interface WheFooterProps {
  categories: {
    label: string
    url: string
  }[]
}

export function WheFooter({ categories }: WheFooterProps) {
  const { t } = useTranslation('common')
  const socials = [
    { label: 'Twitter', href: 'https://twitter.com/', icon: TwitterIcon },
    { label: 'Youtube', href: 'https://www.youtube.com/channel/', icon: FacebookIcon },
    { label: 'Instagram', href: 'https://www.instagram.com/', icon: InstagramIcon },
    { label: 'Linkedin', href: 'https://www.linkedin.com/', icon: LinkedinIcon },
  ]

  return (
    <Footer
      version={t('footer.version', { versionNumber: publicRuntimeConfig?.version })}
      copyright={t('footer.copyright', { year: new Date().getFullYear() })}
    >
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
        <Stack align="flex-start">
          <FooterListHeader>{t('footer.contact')}</FooterListHeader>
          <Text fontWeight="400" fontSize="xs" mb={2} color="gray.50">
            José Madrid Pérez
          </Text>
          <FooterListLink href={`mailto:${'1956josemadrid@gmail.com'}`}>{t('footer.sendAMail')}</FooterListLink>
        </Stack>

        <Stack align="flex-start">
          <FooterListHeader>{t('footer.categories')}</FooterListHeader>
          {categories.map(({ label, url }, index) => (
            <FooterListLink key={index} href={url}>
              {label}
            </FooterListLink>
          ))}
        </Stack>

        <Stack>
          <FooterListHeader>{t('footer.inOtherMedia')}</FooterListHeader>
          <Stack direction="row" spacing={6} paddingBottom="2">
            {socials.map(({ label, href, icon: Icon }, index) => (
              <FooterSocialButton key={index} label={label} href={href}>
                <Icon width={30} height={30} />
              </FooterSocialButton>
            ))}
          </Stack>
          <FooterListLink href="#">{t('footer.subscribe')}</FooterListLink>
        </Stack>
      </SimpleGrid>
    </Footer>
  )
}
