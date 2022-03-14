import { Box, useColorModeValue } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Header } from '@whe/common'
import Image from 'next/image'
import { ReactNode } from 'react'
import { GlobalStyles, NavLink } from '@/components'

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

  const categoryLinks = [
    { label: 'Deportes', href: '/deportes' },
    { label: 'Cultura', href: '/cultura' },
    { label: 'Economía', href: '/economia' },
    { label: 'Tecnología', href: '/tecnologia' },
  ].map((category, index) => (
    <NavLink href={category.href} key={index}>
      <>{category.label}</>
    </NavLink>
  ))

  return (
    <>
      <GlobalStyles />
      <Header categories={categoryLinks} logo={logo} />
      <Box as="main" height="100vh" p={{ base: 0, md: 4 }} maxW={{ base: 'full', lg: '1440px' }} margin="0 auto">
        {children}
      </Box>
      <footer>FOOTER</footer>
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
