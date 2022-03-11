import { Box, useMediaQuery } from '@chakra-ui/react'
import { Header } from '@whe/common'
import { ReactNode } from 'react'
import { GlobalStyles } from '@/components'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [isLargerThan1024] = useMediaQuery('(min-width: 1024px)')

  return (
    <>
      <GlobalStyles />
      <Header
        categories={['Deportes', 'Cultura', 'Economía', 'Tecnología']}
        logoSMpath="/images/WE-logo-MOBILE.png"
        logoLGpath="/images/WE-logo-DESKTOP.png"
        size={isLargerThan1024 ? 'lg' : 'sm'}
      />
      <Box as="main" height="100vh" p={{ base: 0, md: 4 }} maxW={{ base: 'full', lg: '1440px' }} margin="0 auto">
        {children}
      </Box>

      <footer>FOOTER</footer>
    </>
  )
}
