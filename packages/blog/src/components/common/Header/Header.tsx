'use client'

import { Box, Button, Flex, IconButton, Separator, Text, useDisclosure } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { LuChevronDown, LuMoon, LuSearch, LuSun } from 'react-icons/lu'

import { getCategories } from '@blog/api'
import { HeaderLogo, Modal, SearchPosts } from '@blog/components'
import { useColorMode } from '@blog/components/ui/color-mode'
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@blog/components/ui/menu'
import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
import { useLocale, useLocalizeHref, useSwitchLocale } from '@blog/hooks'
import { CATEGORIES_STALE_TIME_MS, getCategoriesKey } from '@blog/utils/constants'
import { buildCategoryPath } from '@blog/utils/urlBuilder'

import { HeaderMenu } from './HeaderMenu'

export interface HeaderProps {
  categories: {
    url: string
    code: string
    name: string
    localizedName: string
  }[]
}

export function Header({ categories }: HeaderProps) {
  const pathname = usePathname() || '/'
  const locale = useLocale()
  const localizeHref = useLocalizeHref()
  const switchLocale = useSwitchLocale()
  const { t } = useTranslation('common')
  const { colorMode, toggleColorMode } = useColorMode()
  const queryClient = useQueryClient()
  const { open: isSearchModalOpen, onOpen: onOpenSearchModal, onClose: onCloseSearchModal } = useDisclosure()

  // Browser path without the (non-default) locale prefix, for active-link comparisons.
  const barePath =
    LOCALES.filter(l => l !== DEFAULT_LOCALE).reduce(
      (acc, l) => (acc === `/${l}` || acc.startsWith(`/${l}/`) ? acc.slice(l.length + 1) || '/' : acc),
      pathname,
    ) || '/'

  const logo = (
    <NextLink href={localizeHref('/')}>
      <Box
        py={{ base: '1rem', md: 0 }}
        height={{ base: '60px', lg: '80px' }}
        cursor="pointer"
        display="flex"
        alignItems="center"
      >
        <Box
          position="relative"
          width={{ base: '20px', md: '32px', lg: '40px' }}
          height={{ base: '25px', md: '40px', lg: '50px' }}
          mr={{ base: '10px', md: '20px' }}
        >
          <HeaderLogo color="#fafafa" />
        </Box>
        <Text
          fontFamily="spartan"
          fontWeight="700"
          color="white"
          fontSize={{ md: '18px', lg: '24px' }}
          height={{ base: '22px', lg: '60px' }}
          lineHeight={{ base: '30px', md: '30px', lg: '70px' }}
          letterSpacing={{ base: '0px', lg: '4px' }}
        >
          <span>WHITE EMOTION</span>
        </Text>
      </Box>
    </NextLink>
  )

  const archiveLabel = t('header.archive')
  const isArchiveActive = barePath === '/archive/'

  const actionButtons = (
    <>
      <IconButton
        size="sm"
        aria-label="Search"
        bg="transparent"
        onClick={onOpenSearchModal}
        _hover={{ bg: 'whiteAlpha.300' }}
        px={{ base: 2, sm: 4 }}
      >
        <LuSearch color="white" />
      </IconButton>
      <IconButton
        size="sm"
        aria-label="Toggle theme"
        bg="transparent"
        onClick={toggleColorMode}
        _hover={{ bg: 'whiteAlpha.300' }}
        px={{ base: 2, sm: 4 }}
      >
        {colorMode === 'light' ? <LuMoon color="white" /> : <LuSun color="white" />}
      </IconButton>
      <Button
        size="sm"
        fontFamily="Roboto"
        aria-label={t('header.changeLanguage')}
        bg="transparent"
        onClick={async () => {
          const nextLocale: AppLocales = locale === 'es' ? 'en' : 'es'

          await queryClient.prefetchQuery({
            queryKey: getCategoriesKey(nextLocale),
            queryFn: () => getCategories({ locale: nextLocale }),
            staleTime: CATEGORIES_STALE_TIME_MS,
          })

          switchLocale(nextLocale)
        }}
        color="white"
        _hover={{ bg: 'whiteAlpha.300' }}
        _active={{ bg: 'whiteAlpha.300' }}
        px={{ base: 2, sm: 4 }}
      >
        {locale === 'es' ? 'ES' : 'EN'}
      </Button>
    </>
  )

  return (
    <Flex width="100%" bg="blackAlpha.800" pr={{ base: 4, lg: 8 }} pl={{ base: 2, lg: 8 }} justifyContent="center">
      <Modal title={t('header.search.title')} isOpen={isSearchModalOpen} onClose={onCloseSearchModal}>
        <SearchPosts
          inputTitle={t('header.search.inputTitle')}
          inputPlaceholder={t('header.search.inputPlaceholder')}
        />
      </Modal>

      <Flex
        h="full"
        alignItems="center"
        justifyContent="space-between"
        w={{ base: '100%', lg: '1440px' }}
        maxW={{ base: '100%', lg: '1440px' }}
        direction={{ base: 'column', xl: 'row' }}
      >
        <Flex
          h="full"
          alignItems="center"
          justifyContent={{ base: 'space-between', lg: 'center' }}
          width={{ base: '100%', lg: 'fit-content' }}
        >
          <HeaderMenu categories={categories} />
          {logo}
          <Box display={{ base: 'block', lg: 'none' }} height="26px">
            {actionButtons}
          </Box>
        </Flex>
        <Separator orientation="horizontal" w={400} display={{ base: 'none', lg: 'block', xl: 'none' }} />
        <Flex
          alignItems="center"
          display={{ base: 'none', lg: 'flex' }}
          justifyContent={{ lg: 'space-between', xl: 'flex-end' }}
        >
          <MenuRoot>
            <MenuTrigger asChild>
              <Button
                size="sm"
                color="white"
                bg="transparent"
                px={{ md: 2, lg: 3 }}
                fontFamily="Roboto"
                _hover={{ background: 'whiteAlpha.200' }}
                _active={{ background: 'whiteAlpha.300' }}
                _focus={{ boxShadow: 'none' }}
              >
                {t('footer.categories')}
                <LuChevronDown />
              </Button>
            </MenuTrigger>
            <MenuContent bg="blackAlpha.900" borderColor="blackAlpha.800" borderRadius={0} minW="160px" p={0}>
              {categories.map(({ url, name, localizedName, code }) => (
                <MenuItem
                  key={code}
                  value={code}
                  asChild
                  bg="transparent"
                  color={barePath === buildCategoryPath(code, name) ? 'orange.300' : 'white'}
                  borderRadius={0}
                  fontFamily="Roboto"
                  _hover={{ bg: 'blackAlpha.700' }}
                >
                  <NextLink href={url}>{localizedName}</NextLink>
                </MenuItem>
              ))}
            </MenuContent>
          </MenuRoot>
          <Button
            asChild
            size="sm"
            bg="transparent"
            px={{ md: 2, lg: 3 }}
            color={isArchiveActive ? 'orange.300' : 'white'}
            fontFamily="Roboto"
            _hover={{ textDecoration: 'none', background: 'whiteAlpha.200' }}
            _active={{ background: 'transparent' }}
            _focus={{ boxShadow: 'none' }}
          >
            <NextLink href={localizeHref('/archive')}>{archiveLabel}</NextLink>
          </Button>
          <Box>{actionButtons}</Box>
        </Flex>
      </Flex>
    </Flex>
  )
}
