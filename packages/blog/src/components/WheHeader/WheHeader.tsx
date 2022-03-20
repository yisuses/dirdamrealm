import { useColorModeValue, IconButton, Icon } from '@chakra-ui/react'
import { Header } from '@whe/common'
import { GB, ES } from 'country-flag-icons/react/3x2'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { NavLink } from '../NavLink/NavLink'
import { LogoContainer } from './WheHeader.styles'

interface WheHeaderProps {
  categories: {
    href: string
    label: string
  }[]
}

export function WheHeader({ categories }: WheHeaderProps) {
  const router = useRouter()

  const logo = (
    <LogoContainer>
      <span className="desktop">
        <Image
          alt="White Emotion Logo"
          src={useColorModeValue('/images/WE-logo-DESKTOP_DARK.svg', '/images/WE-logo-DESKTOP_WHITE.svg')}
          width="256px"
          height="80px"
          objectFit="contain"
          layout="fixed"
        />
      </span>
      <span className="mobile">
        <Image
          alt="White Emotion Logo"
          src={useColorModeValue('/images/WE-logo-MOBILE_DARK.svg', '/images/WE-logo-MOBILE_WHITE.svg')}
          width="45px"
          height="45px"
          objectFit="contain"
          layout="fixed"
        />
      </span>
    </LogoContainer>
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
      aria-label="Toggle theme"
      bg="transparent"
      onClick={() => {
        router.push(router.asPath, undefined, { locale: router.locale === 'es' ? 'en' : 'es' })
      }}
    />
  )

  return <Header links={categoryLinks} logo={logo} language={language} />
}
