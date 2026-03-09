import { Button, IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { ChevronDownIcon, MoonIcon, SearchIcon, SunIcon } from '@chakra-ui/icons'
import { Box, Divider, Flex, Text } from '@chakra-ui/layout'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/menu'
import { useColorMode } from '@chakra-ui/system'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { HeaderLogo, Modal, SearchPosts } from '@blog/components'
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
  const router = useRouter()
  const { t } = useTranslation('common')
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen: isSearchModalOpen, onOpen: onOpenSearchModal, onClose: onCloseSearchModal } = useDisclosure()

  const logo = (
    <NextLink href="/">
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

  const categoryHeaderLinks = categories.map(({ url, name, localizedName, code }) => ({
    url,
    name,
    localizedName,
    code,
  }))
  const archiveLabel = t('header.archive')
  const isArchiveActive = router.asPath === '/archive/'

  const categoryDropdownLinks = categoryHeaderLinks.map(({ url, name, localizedName, code }, index) => {
    const isActive = router.asPath === buildCategoryPath(code, name)

    return (
      <MenuItem
        key={index}
        as={NextLink}
        href={url}
        px={4}
        py={2}
        bg="blackAlpha.800"
        color={isActive ? 'orange.300' : 'white'}
        borderRadius={0}
        border="none"
        fontFamily="Roboto"
        _focus={{ boxShadow: 'none' }}
        _hover={{ bg: 'blackAlpha.700' }}
        _active={{ bg: 'transparent' }}
      >
        {localizedName}
      </MenuItem>
    )
  })

  const actionButtons = (
    <>
      <IconButton
        size="sm"
        icon={<SearchIcon color="white" />}
        aria-label="Search"
        bg="transparent"
        onClick={onOpenSearchModal}
        _hover={{ bg: 'whiteAlpha.300' }}
        px={{ base: 2, sm: 4 }}
      />
      <IconButton
        size="sm"
        icon={colorMode === 'light' ? <MoonIcon color="white" /> : <SunIcon />}
        aria-label="Toggle theme"
        bg="transparent"
        onClick={toggleColorMode}
        _hover={{ bg: 'whiteAlpha.300' }}
        px={{ base: 2, sm: 4 }}
      />
      <Button
        size="sm"
        fontFamily="Roboto"
        aria-label={t('header.changeLanguage')}
        bg="transparent"
        onClick={() => {
          router.push(router.asPath, undefined, { locale: router.locale === 'es' ? 'en' : 'es' })
        }}
        color="white"
        _hover={{ backgroundColor: 'transparent' }}
        _active={{ backgroundColor: 'transparent' }}
        px={{ base: 2, sm: 4 }}
      >
        {router.locale === 'es' ? 'ES' : 'EN'}
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
        <Divider orientation="horizontal" w={400} display={{ base: 'none', lg: 'block', xl: 'none' }} />
        <Flex
          alignItems="center"
          display={{ base: 'none', lg: 'flex' }}
          justifyContent={{ lg: 'space-between', xl: 'flex-end' }}
        >
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              color="white"
              rightIcon={<ChevronDownIcon />}
              bg="transparent"
              px={{ md: 2, lg: 3 }}
              fontFamily="Roboto"
              _hover={{ background: 'whiteAlpha.200' }}
              _active={{ background: 'whiteAlpha.300' }}
              _focus={{ boxShadow: 'none' }}
            >
              {t('footer.categories')}
            </MenuButton>
            <MenuList bg="white" borderColor="blackAlpha.800" borderRadius={0} minW="160px" py={0}>
              {categoryDropdownLinks}
            </MenuList>
          </Menu>
          <Button
            as={NextLink}
            href="/archive"
            size="sm"
            bg="transparent"
            px={{ md: 2, lg: 3 }}
            color={isArchiveActive ? 'orange.300' : 'white'}
            fontFamily="Roboto"
            _hover={{ textDecoration: 'none', background: 'whiteAlpha.200' }}
            _active={{ background: 'transparent' }}
            _focus={{ boxShadow: 'none' }}
          >
            {archiveLabel}
          </Button>
          <Box>{actionButtons}</Box>
        </Flex>
      </Flex>
    </Flex>
  )
}
