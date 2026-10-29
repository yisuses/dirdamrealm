'use client'

import { Box, Flex, IconButton, Text, useDisclosure } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuMoon, LuSearch, LuSun } from 'react-icons/lu'

import { getCategories } from '@blog/api/public'
import { HeaderLogo, Modal, SearchPosts } from '@blog/components/common'
import { useColorMode } from '@blog/components/ui/color-mode'
import { DEFAULT_LOCALE, LOCALES } from '@blog/core/i18n/config'
import { useLocale, useLocalizeHref, useSwitchLocale } from '@blog/hooks'
import { CATEGORIES_STALE_TIME_MS, getCategoriesKey } from '@blog/utils/constants'
import { buildCategoryPath } from '@blog/utils/urlBuilder'

export interface HeaderProps {
  categories: {
    url: string
    code: string
    name: string
    localizedName: string
  }[]
}

const toolProps = {
  size: 'sm',
  variant: 'ghost',
  color: 'fg',
  fontFamily: 'sans',
  minW: 9,
  _hover: { bg: 'bg.muted', color: 'accent' },
} as const

export function Header({ categories }: HeaderProps) {
  const pathname = usePathname() || '/'
  const locale = useLocale()
  const localizeHref = useLocalizeHref()
  const switchLocale = useSwitchLocale()
  const { t } = useTranslation('common')
  const { toggleColorMode } = useColorMode()
  const queryClient = useQueryClient()
  const { open: isSearchModalOpen, onOpen: onOpenSearchModal, onClose: onCloseSearchModal } = useDisclosure()
  // Once the masthead scrolls away, the sticky bar shows a small logo of its own.
  const mastheadRef = useRef<HTMLAnchorElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting))
    observer.observe(mastheadRef.current!)
    return () => observer.disconnect()
  }, [])

  // Browser path without the (non-default) locale prefix, for active-link comparisons.
  const barePath = LOCALES.filter(l => l !== DEFAULT_LOCALE).reduce(
    (acc, l) => (acc === `/${l}` || acc.startsWith(`/${l}/`) ? acc.slice(l.length + 1) || '/' : acc),
    pathname,
  )

  const links = [
    { key: 'home', label: t('header.home'), href: localizeHref('/'), active: barePath === '/' },
    ...categories.map(({ url, code, name, localizedName }) => ({
      key: code,
      label: localizedName,
      href: url,
      active: barePath === buildCategoryPath(code, name),
    })),
    {
      key: 'archive',
      label: t('header.archive'),
      href: localizeHref('/archive/'),
      active: barePath === '/archive/',
    },
  ]

  const switchLanguage = async () => {
    const nextLocale: AppLocales = locale === 'es' ? 'en' : 'es'

    await queryClient.prefetchQuery({
      queryKey: getCategoriesKey(nextLocale),
      queryFn: () => getCategories({ locale: nextLocale }),
      staleTime: CATEGORIES_STALE_TIME_MS,
    })

    switchLocale(nextLocale)
  }

  return (
    <>
      <Modal title={t('header.search.title')} isOpen={isSearchModalOpen} onClose={onCloseSearchModal}>
        <SearchPosts
          inputTitle={t('header.search.inputTitle')}
          inputPlaceholder={t('header.search.inputPlaceholder')}
        />
      </Modal>

      <Box as="header" borderTop="4px solid" borderColor="accent">
        <Flex
          asChild
          justifyContent="center"
          alignItems="center"
          gap={{ base: '10px', md: '14px' }}
          py={{ base: 3, md: 4 }}
          px={4}
          width="fit-content"
          mx="auto"
        >
          <NextLink href={localizeHref('/')} ref={mastheadRef} aria-label={t('header.logo')}>
            <Box color="accent" width={{ base: '26px', md: '32px' }} flex="none">
              <HeaderLogo width="100%" />
            </Box>
            <Box>
              <Text
                fontFamily="heading"
                fontSize={{ base: '26px', md: '32px' }}
                lineHeight="1.1"
                fontWeight={500}
                letterSpacing="0.02em"
                color="fg"
              >
                White Emotion
              </Text>
              <Text fontStyle="italic" fontSize={{ base: '12.5px', md: '15px' }} lineHeight="1.3" color="fg.muted">
                {t('header.tagline')}
              </Text>
            </Box>
          </NextLink>
        </Flex>
      </Box>

      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex="sticky"
        borderTop="1px solid"
        borderTopColor="fg"
        borderBottom="1px solid"
        borderBottomColor="border"
        bg="color-mix(in srgb, var(--chakra-colors-bg) 92%, transparent)"
        backdropFilter="blur(10px)"
        boxShadow={stuck ? '0 6px 20px rgba(0,0,0,.08)' : 'none'}
        transition="box-shadow .2s"
      >
        <Flex
          maxW="1248px"
          mx="auto"
          px={{ base: 4, md: 6 }}
          height="46px"
          alignItems="center"
          gap={{ base: 3, md: 6 }}
        >
          <Box
            asChild
            color="accent"
            flex="none"
            width={stuck ? '20px' : 0}
            opacity={stuck ? 1 : 0}
            overflow="hidden"
            transition="width .25s, opacity .25s"
          >
            <NextLink href={localizeHref('/')} aria-hidden={!stuck} tabIndex={stuck ? undefined : -1}>
              <HeaderLogo width="20px" />
            </NextLink>
          </Box>
          <Flex
            flex={1}
            gap={{ base: 5, md: 6 }}
            justifyContent={{ base: 'flex-start', lg: 'center' }}
            overflowX="auto"
            fontFamily="sans"
            fontSize="15px"
            fontWeight={500}
            css={{
              scrollbarWidth: 'none',
              maskImage: { base: 'linear-gradient(to right, #000 85%, transparent)', lg: 'none' },
            }}
          >
            {links.map(({ key, label, href, active }) => (
              <Box
                asChild
                key={key}
                whiteSpace="nowrap"
                pt="11px"
                pb="9px"
                borderBottom="2px solid"
                borderBottomColor={active ? 'accent' : 'transparent'}
                color="fg"
                _hover={{ color: 'accent' }}
              >
                <NextLink href={href} aria-current={active ? 'page' : undefined}>
                  {label}
                </NextLink>
              </Box>
            ))}
          </Flex>
          <Flex flex="none" alignItems="center">
            <IconButton {...toolProps} aria-label="Search" onClick={onOpenSearchModal}>
              <LuSearch />
            </IconButton>
            <IconButton {...toolProps} aria-label="Toggle theme" onClick={toggleColorMode}>
              {/* Both icons, picked by CSS: the server can't know the saved theme. */}
              <Box asChild _dark={{ display: 'none' }}>
                <LuMoon />
              </Box>
              <Box asChild display="none" _dark={{ display: 'inline' }}>
                <LuSun />
              </Box>
            </IconButton>
            <IconButton
              {...toolProps}
              aria-label={t('header.changeLanguage')}
              fontWeight={600}
              onClick={switchLanguage}
            >
              {locale === 'es' ? 'ES' : 'EN'}
            </IconButton>
          </Flex>
        </Flex>
      </Box>
    </>
  )
}
