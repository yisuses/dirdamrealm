import { IconButton } from '@chakra-ui/button'
import { CloseButton } from '@chakra-ui/close-button'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { useDisclosure } from '@chakra-ui/hooks'
import { HamburgerIcon } from '@chakra-ui/icons'
import { Box, Flex, Text, VStack } from '@chakra-ui/layout'
import { MenuButtonProps, MenuProps } from '@chakra-ui/menu'
import { Drawer, DrawerContent } from '@chakra-ui/modal'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'

type HeaderDropdownProps = Omit<MenuProps, 'children'> & {
  categories: {
    url: string
    code: string
    name: string
    localizedName: string
  }[]
  buttonProps?: MenuButtonProps
}

export const HeaderMenu = ({ categories }: HeaderDropdownProps) => {
  const { t } = useTranslation('common')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const menuLinks = categories.map(({ url, localizedName }, index) => (
    <NextLink href={url} key={index} onClick={onClose} legacyBehavior={false}>
      {localizedName}
    </NextLink>
  ))

  return (
    <>
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="xs"
      >
        <DrawerContent>
          <Box transition="3s ease" bg={useColorModeValue('white', 'gray.900')} w="full" pos="fixed" h="full">
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
              <Text
                display="flex"
                color={useColorModeValue('black', 'white')}
                fontFamily="spartan"
                fontWeight="700"
                fontSize="14px"
                height="60px"
                alignItems="center"
              >
                WHITE EMOTION
              </Text>
              <CloseButton
                aria-label={t('header.menuButtonOpened')}
                display={{ base: 'flex', md: 'none' }}
                onClick={onClose}
              />
            </Flex>
            <VStack spacing="24px" align="flex-start" mx="8">
              {menuLinks.map((menuItem, index) => (
                <Box key={index}>{menuItem}</Box>
              ))}
            </VStack>
          </Box>
        </DrawerContent>
      </Drawer>
      <IconButton
        size="sm"
        color="white"
        display={{ base: 'flex', lg: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label={t('header.menuButtonClosed')}
        icon={<HamburgerIcon />}
        borderColor="transparent"
        mr="10px"
      />
    </>
  )
}
