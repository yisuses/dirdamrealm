import { Box } from '@chakra-ui/layout'
import { ReactNode } from 'react'

import { GlobalStyles, Footer, Header } from '@components'
import { useGetMainCategories, useGetAbout } from '@hooks'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const categories = useGetMainCategories()
  const about = useGetAbout()
  return (
    <>
      <GlobalStyles />
      <Header categories={categories} />
      <Box
        as="main"
        minH={{ base: 'calc(100vh - 272px)' }}
        p={{ base: 0 }}
        maxW={{ base: 'full', lg: '1440px' }}
        margin="0 auto"
      >
        {children}
      </Box>
      {about && <Footer categories={categories} about={about} />}
    </>
  )
}
