import { HamburgerIcon } from '@chakra-ui/icons'
import {
  MenuProps,
  MenuButtonProps,
  useDisclosure,
  useColorModeValue,
  Box,
  CloseButton,
  Drawer,
  DrawerContent,
  Flex,
  Text,
  IconButton,
  VStack,
} from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

type HeaderDropdownProps = Omit<MenuProps, 'children'> & {
  menuItems: ReactNode[]
  buttonProps?: MenuButtonProps
}

export const WheHeaderMenu = ({ menuItems }: HeaderDropdownProps) => {
  const { t } = useTranslation('common')
  const { isOpen, onOpen, onClose } = useDisclosure()

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
          <Box
            transition="3s ease"
            bg={useColorModeValue('white', 'gray.900')}
            w={{ base: 'full' }}
            pos="fixed"
            h="full"
          >
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
              <Text
                display={{ base: 'flex' }}
                color={useColorModeValue('black', 'white')}
                fontFamily="spartan"
                fontWeight="700"
                fontSize={{ base: '14px', md: '20px', lg: '22px' }}
                height={{ base: '60px', lg: '80px' }}
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
              {menuItems.map((menuItem, index) => (
                <Box key={index}>{menuItem}</Box>
              ))}
            </VStack>
          </Box>
        </DrawerContent>
      </Drawer>
      <IconButton
        size="sm"
        color="white"
        display={{ base: 'flex', md: 'none' }}
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
