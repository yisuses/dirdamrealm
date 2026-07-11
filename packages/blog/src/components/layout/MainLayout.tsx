'use client'

import { Box } from '@chakra-ui/react'
import { ReactNode } from 'react'

import { CookieBanner, Footer, GlobalStyles, Header } from '@blog/components'
import { useGetData, useLocale } from '@blog/hooks'
import { buildCategoryPath } from '@blog/utils'
import { QUERY_ABOUT, getCategoriesKey } from '@blog/utils/constants'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const locale = useLocale()
  const categories = useGetData<Category[]>(getCategoriesKey(locale), [])
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
