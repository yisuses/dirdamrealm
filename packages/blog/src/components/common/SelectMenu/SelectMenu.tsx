import { Button } from '@chakra-ui/react'
import { LuChevronDown } from 'react-icons/lu'

import { useColorModeValue } from '@blog/components/ui/color-mode'
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@blog/components/ui/menu'

export interface SelectMenuOption {
  value: string
  label: string
}

interface SelectMenuProps {
  options: SelectMenuOption[]
  /** Selected option value. */
  value: string
  /** Accessible label for the control. */
  label: string
  onChange: (value: string) => void
}

export function SelectMenu({ options, value, label, onChange }: SelectMenuProps) {
  const restingColor = useColorModeValue('gray.900', 'gray.50')
  const borderColor = useColorModeValue('gray.750', 'gray.50')

  const selectedOption = options.find(option => option.value === value) ?? options[0]

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button
          aria-label={label}
          variant="outline"
          fontFamily="Lora"
          fontWeight={500}
          width="100%"
          justifyContent="space-between"
          color={restingColor}
          borderColor={borderColor}
          borderRadius="none"
          _hover={{ borderColor: 'orange.300', color: 'orange.300' }}
          _open={{ borderColor: 'orange.300', color: 'orange.300' }}
          transition="color 0.2s ease-in-out, border-color 0.2s ease-in-out"
        >
          {selectedOption?.label}
          <LuChevronDown />
        </Button>
      </MenuTrigger>
      <MenuContent fontFamily="Lora" borderRadius="none">
        {options.map(option => (
          <MenuItem
            key={option.value || 'all'}
            value={option.value}
            onClick={() => onChange(option.value)}
            fontWeight={option.value === value ? 700 : 400}
            color={option.value === value ? 'orange.300' : undefined}
            _hover={{ color: 'orange.300' }}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  )
}
