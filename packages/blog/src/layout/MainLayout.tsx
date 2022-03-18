import { Box, useColorModeValue } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Header } from '@whe/common'
import Image from 'next/image'
import { ReactNode } from 'react'
import { GlobalStyles, NavLink, WheFooter } from '@/components'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
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

  const categories = [
    { label: 'Deportes', href: '/deportes' },
    { label: 'Cultura', href: '/cultura' },
    { label: 'Economía', href: '/economia' },
    { label: 'Tecnología', href: '/tecnologia' },
  ]
  const categoryLinks = categories.map(({ href, label }, index) => (
    <NavLink href={href} key={index}>
      <>{label}</>
    </NavLink>
  ))

  return (
    <>
      <GlobalStyles />
      <Header links={categoryLinks} logo={logo} />
      <Box
        as="main"
        minH={{ base: 'calc(100vh - 332px)', lg: 'calc(100vh - 352px)' }}
        p={{ base: 0, lg: 4 }}
        maxW={{ base: 'full', lg: '1440px' }}
        margin="0 auto"
      >
        {children}
      </Box>
      <WheFooter categories={categories} />
    </>
  )
}

const LogoContainer = styled.div`
  .desktop {
    display: none;
  }
  .mobile {
    display: inline-block;
  }

  ${({ theme }) => theme.media.up.lg} {
    .desktop {
      display: inline-block;
    }
    .mobile {
      display: none;
    }
  }
`
