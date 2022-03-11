import { Box, useMediaQuery } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { Header } from '@whe/common'
import Image from 'next/image'
import { ReactNode } from 'react'
import { GlobalStyles } from '@/components'
import { getUpMedia } from '@/themes/emotion.theme'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isBiggerThanLG] = useMediaQuery(getUpMedia('lg'))

  const logo = (
    <MyImage>
      <span className="desktop">
        <Image
          alt="White Emotion Logo"
          src={'/images/WE-logo-DESKTOP.png'}
          width={'256px'}
          height={'80px'}
          objectFit="contain"
          layout="fixed"
        />
      </span>
      <span className="mobile">
        <Image
          alt="White Emotion Logo"
          src={'/images/WE-logo-MOBILE.png'}
          width={'45px'}
          height={'45px'}
          objectFit="contain"
          layout="fixed"
        />
      </span>
    </MyImage>
  )

  return (
    <>
      <GlobalStyles />
      <Header
        categories={['Deportes', 'Cultura', 'Economía', 'Tecnología']}
        logo={logo}
        size={isBiggerThanLG ? 'lg' : 'sm'}
      />
      <Box as="main" height="100vh" p={{ base: 0, md: 4 }} maxW={{ base: 'full', lg: '1440px' }} margin="0 auto">
        {children}
      </Box>

      <footer>FOOTER</footer>
    </>
  )
}

const MyImage = styled.div`
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
