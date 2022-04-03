import { IconButton, Icon, Text } from '@chakra-ui/react'
import { Header } from '@whe/common'
import { GB, ES } from 'country-flag-icons/react/3x2'
import { useTranslation } from 'next-i18next'
import Image, { ImageProps } from 'next/image'
import { useRouter } from 'next/router'
import { NavLink } from '../NavLink/NavLink'
import { LogoContainer } from './WheHeader.styles'
import { WheHeaderMenu } from './WheHeaderMenu'

interface WheHeaderProps {
  categories: {
    href: string
    label: string
  }[]
}

export function WheHeader({ categories }: WheHeaderProps) {
  const router = useRouter()
  const { t } = useTranslation('common')

  const logoProps: Partial<ImageProps> = {
    alt: t('header.logo'),
    objectFit: 'contain',
    layout: 'fixed',
  }
  let logo = (
    <LogoContainer>
      <span className="desktop">
        <Image {...logoProps} src="/images/WE-logo-DESKTOP_WHITE.svg" width="256px" height="80px" />
      </span>
      <span className="mobile">
        <Image {...logoProps} src="/images/WE-logo-MOBILE_WHITE.svg" width="45px" height="45px" />
      </span>
    </LogoContainer>
  )

  logo = (
    <>
      <Text
        display={{ base: 'none', md: 'flex' }}
        color="white"
        fontFamily="spartan"
        fontWeight="700"
        fontSize={{ base: '14px', md: '20px', lg: '22px' }}
        height={{ base: '60px', lg: '80px' }}
        alignItems="center"
      >
        WHITE EMOTION
      </Text>
      <Text
        color="white"
        fontFamily="spartan"
        fontWeight="700"
        fontSize={{ base: '14px', md: '20px', lg: '22px' }}
        height={{ base: '60px', lg: '80px' }}
        alignItems="center"
        display={{ base: 'flex', md: 'none' }}
      >
        W.E.
      </Text>
    </>
  )

  const categoryLinks = categories.map(({ href, label }, index) => (
    <NavLink href={href} key={index}>
      <>{label}</>
    </NavLink>
  ))

  const language = (
    <IconButton
      size="sm"
      icon={router.locale === 'es' ? <Icon as={ES} /> : <Icon as={GB} />}
      aria-label={t('header.changeLanguage')}
      bg="transparent"
      onClick={() => {
        router.push(router.asPath, undefined, { locale: router.locale === 'es' ? 'en' : 'es' })
      }}
    />
  )

  const menu = <WheHeaderMenu menuItems={categoryLinks} />

  return <Header links={categoryLinks} logo={logo} menu={menu} language={language} />
}
