'use client'

import { Button } from '@chakra-ui/react'
import { LuChevronDown } from 'react-icons/lu'

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
  const selectedOption = options.find(option => option.value === value) ?? options[0]

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <Button
          aria-label={label}
          variant="outline"
          fontWeight={500}
          width="100%"
          justifyContent="space-between"
          color="fg"
          bg="bg.panel"
          borderColor="border"
          borderRadius="10px"
          _hover={{ borderColor: 'accent', bg: 'bg.panel' }}
          _open={{ borderColor: 'accent', color: 'accent' }}
          transition="color 0.2s ease-in-out, border-color 0.2s ease-in-out"
        >
          {selectedOption?.label}
          <LuChevronDown />
        </Button>
      </MenuTrigger>
      <MenuContent fontFamily="sans" borderRadius="10px">
        {options.map(option => (
          <MenuItem
            key={option.value || 'all'}
            value={option.value}
            onClick={() => onChange(option.value)}
            fontWeight={option.value === value ? 600 : 400}
            color={option.value === value ? 'accent' : undefined}
            _hover={{ color: 'accent' }}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuContent>
    </MenuRoot>
  )
}
