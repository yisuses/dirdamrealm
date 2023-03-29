import { Box } from '@chakra-ui/layout'
import { ReactNode } from 'react'

import { GlobalStyles, Footer, Header, CookieBanner } from '@components'
import { useGetData } from '@hooks'
import { buildCategoryPath } from '@utils'
import { QUERY_ABOUT, QUERY_CATEGORIES } from '@utils/constants'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const categories = useGetData<Category[]>(QUERY_CATEGORIES, [])
    .filter(category => category.main)
    .map(category => ({
      localizedName: category.localizedName,
      name: category.name,
      code: category.code,
      url: buildCategoryPath(category.code, category.localizedName),
    }))
  const about = useGetData<About>(QUERY_ABOUT)

  return (
    <>
      <GlobalStyles />
      <CookieBanner />
      <Header categories={categories} />
      <Box
        as="main"
        minH={{ base: 'calc(100vh - 272px)', md: 'calc(100vh - 250px)' }}
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
