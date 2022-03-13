import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons'
import { Menu, MenuButton, IconButton, MenuList, MenuItem, useDisclosure } from '@chakra-ui/react'
import { ReactNode } from 'react'

type HeaderDropdownProps = {
  categories: ReactNode[]
}

export const HeaderDropdown = ({ categories }: HeaderDropdownProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Menu>
      <MenuButton as={IconButton} display={{ md: 'none' }} variant="link" cursor="pointer" minW={0}>
        <IconButton
          size={'sm'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          onClick={isOpen ? onClose : onOpen}
          bg="transparent"
        />
      </MenuButton>
      <MenuList minWidth="max-content" fontSize="sm" bg="white">
        {categories.map((category, index) => (
          <MenuItem key={index}>{category}</MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
