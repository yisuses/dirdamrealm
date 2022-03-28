import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons'
import { Menu, MenuButton, IconButton, MenuList, MenuItem, Button, MenuProps, MenuButtonProps } from '@chakra-ui/react'
import { useTranslation } from 'next-i18next'
import { ReactNode } from 'react'

type HeaderDropdownProps = Omit<MenuProps, 'children'> & {
  menuItems: ReactNode[]
  buttonProps?: MenuButtonProps
}

export const WheHeaderDropdown = ({ menuItems, buttonProps, ...rest }: HeaderDropdownProps) => {
  const { t } = useTranslation('common')

  return (
    <Menu {...rest}>
      {({ isOpen }) => (
        <>
          <MenuButton
            {...buttonProps}
            as={Button}
            _focus={{ boxShadow: 'none' }}
            size="sm"
            variant="link"
            display={{ md: 'none' }}
            cursor="pointer"
            minW={0}
          >
            <IconButton
              as="span"
              size="sm"
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={t(`header.${isOpen ? 'menuButtonOpen' : 'menuButtonClosed'}`)}
              bg="transparent"
              _focus={{ boxShadow: 'none' }}
            />
          </MenuButton>
          <MenuList minWidth="max-content" fontSize="sm" bg="white">
            {menuItems.map((menuItem, index) => (
              <MenuItem key={index}>{menuItem}</MenuItem>
            ))}
          </MenuList>
        </>
      )}
    </Menu>
  )
}
