import { Box, useMediaQuery } from '@chakra-ui/react'
import { Header } from '@whe/common'
import Image from 'next/image'
import { ReactNode } from 'react'
import { GlobalStyles } from '@/components'

interface MainLayoutProps {
  children: ReactNode
}

{
  /* <Image
maxHeight={size === 'sm' ? '45px' : '70px'}
objectFit="cover"
src={size === 'sm' ? logoSMpath : logoLGpath}
alt="White Emotion Logo"
/> */
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isLargerThan992] = useMediaQuery('(min-width: 992px)')

  const logo = (
    <Image
      alt="White Emotion Logo"
      src={isLargerThan992 ? '/images/WE-logo-DESKTOP.png' : '/images/WE-logo-MOBILE.png'}
      width={isLargerThan992 ? '256px' : '45px'}
      height={isLargerThan992 ? '80x' : '45px'}
      objectFit="contain"
      layout="fixed"
    />
  )
  return (
    <>
      <GlobalStyles />
      <Header
        categories={['Deportes', 'Cultura', 'Economía', 'Tecnología']}
        logo={logo}
        size={isLargerThan992 ? 'lg' : 'sm'}
      />
      <Box as="main" height="100vh" p={{ base: 0, md: 4 }} maxW={{ base: 'full', lg: '1440px' }} margin="0 auto">
        {children}
      </Box>

      <footer>FOOTER</footer>
    </>
  )
}
