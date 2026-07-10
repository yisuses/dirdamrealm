import { Box, CloseButton, Flex, IconButton, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next/pages'
import NextLink from 'next/link'
import { LuMenu } from 'react-icons/lu'

import { useColorModeValue } from '@blog/components/ui/color-mode'
import { DrawerBody, DrawerContent, DrawerRoot } from '@blog/components/ui/drawer'

type HeaderDropdownProps = {
  categories: {
    url: string
    code: string
    name: string
    localizedName: string
  }[]
}

export const HeaderMenu = ({ categories }: HeaderDropdownProps) => {
  const { t } = useTranslation('common')
  const { open, onOpen, onClose } = useDisclosure()
  const panelBg = useColorModeValue('white', 'gray.900')
  const titleColor = useColorModeValue('black', 'white')

  const menuLinks = categories.map(({ url, localizedName }, index) => (
    <NextLink href={url} key={index} onClick={onClose}>
      {localizedName}
    </NextLink>
  ))

  menuLinks.push(
    <NextLink href="/archive" key="archive" onClick={onClose}>
      {t('header.archive')}
    </NextLink>,
  )

  return (
    <>
      <DrawerRoot
        open={open}
        placement="start"
        size="xs"
        onOpenChange={details => {
          if (!details.open) onClose()
        }}
      >
        <DrawerContent>
          <DrawerBody p={0}>
            <Box transition="3s ease" bg={panelBg} w="full" h="full">
              <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text
                  display="flex"
                  color={titleColor}
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
              <VStack gap="24px" align="flex-start" mx="8">
                {menuLinks.map((menuItem, index) => (
                  <Box key={index}>{menuItem}</Box>
                ))}
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
      <IconButton
        size="sm"
        color="white"
        display={{ base: 'flex', lg: 'none' }}
        onClick={onOpen}
        variant="ghost"
        aria-label={t('header.menuButtonClosed')}
        bg="transparent"
        _hover={{ bg: 'whiteAlpha.300' }}
        _active={{ bg: 'whiteAlpha.300' }}
        mr="10px"
      >
        <LuMenu />
      </IconButton>
    </>
  )
}
