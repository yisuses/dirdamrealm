import { Button, IconButton } from '@chakra-ui/button'
import { useDisclosure } from '@chakra-ui/hooks'
import { MoonIcon, SearchIcon, SunIcon } from '@chakra-ui/icons'
import { Box, Divider, Flex, HStack, Link, Text } from '@chakra-ui/layout'
import { useColorMode } from '@chakra-ui/system'
import { useTranslation } from 'next-i18next'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { Modal, SearchPosts } from '@components'
import { buildCategoryPath } from '@utils/urlBuilder'
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
          <NextImage
            src="/images/RMLogo.png"
            fill
            alt={t('header.rmLogo')}
            sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
          />
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

  const categoryHeaderLinks = categories.map(({ url, name, localizedName, code }, index) => (
    <Link
      as={NextLink}
      href={url}
      key={index}
      px={{ md: 2, lg: 3 }}
      pt="5px"
      fontFamily="Roboto"
      color={router.asPath === buildCategoryPath(code, name) ? 'orange.300' : 'white'}
      display="block"
      _focus={{
        boxShadow: 'none',
      }}
      _hover={{
        textDecoration: 'none',
        '::after': {
          width: '100%',
        },
      }}
      _active={{
        '::after': {
          width: 'calc(100% + 10px)',
          marginLeft: '-5px',
          transition: 'none',
        },
      }}
      _after={{
        content: '""',
        display: 'block',
        width: 0,
        height: '2px',
        marginTop: '3px',
        bg: 'orange.300',
        transition: 'width 0.2s',
      }}
    >
      {localizedName}
    </Link>
  ))

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
          <HStack as="nav" spacing={4} py={{ lg: 4, xl: 0 }} alignItems="flex-end">
            {categoryHeaderLinks}
          </HStack>
          <Box>{actionButtons}</Box>
        </Flex>
      </Flex>
    </Flex>
  )
}
