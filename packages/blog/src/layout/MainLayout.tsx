import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { GlobalStyles, WheFooter, WheHeader } from '@/components'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const categories = [
    { label: 'Deportes', href: '/deportes' },
    { label: 'Cultura', href: '/cultura' },
    { label: 'Economía', href: '/economia' },
    { label: 'Tecnología', href: '/tecnologia' },
  ]

  return (
    <>
      <GlobalStyles />
      <WheHeader categories={categories} />
      <Box
        as="main"
        minH={{ base: 'calc(100vh - 332px)', lg: 'calc(100vh - 352px)' }}
        p={{ base: 0 }}
        maxW={{ base: 'full', lg: '1440px' }}
        margin="0 auto"
      >
        {children}
      </Box>
      <WheFooter categories={categories} />
    </>
  )
}
