import { ChevronDownIcon } from '@chakra-ui/icons'
import { Button, Menu, MenuButton, MenuItem, MenuList, useColorModeValue } from '@chakra-ui/react'

interface CategorySelectProps {
  categories: Category[]
  /** Selected category code. Empty string means "all categories". */
  value: string
  /** Label shown for the "all categories" option. */
  allLabel: string
  /** Accessible label for the control. */
  label: string
  onChange: (categoryCode: string) => void
}

export function CategorySelect({ categories, value, allLabel, label, onChange }: CategorySelectProps) {
  const restingColor = useColorModeValue('gray.900', 'gray.50')
  const borderColor = useColorModeValue('gray.750', 'gray.50')

  const options = [
    { code: '', name: allLabel },
    ...categories.map(({ code, localizedName }) => ({ code, name: localizedName })),
  ]
  const selectedOption = options.find(option => option.code === value) ?? options[0]!

  return (
    <Menu matchWidth>
      <MenuButton
        as={Button}
        aria-label={label}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        fontFamily="Lora"
        fontWeight={500}
        width="100%"
        maxW="320px"
        justifyContent="space-between"
        color={restingColor}
        borderColor={borderColor}
        borderRadius="none"
        _hover={{ borderColor: 'orange.300', color: 'orange.300' }}
        _active={{ borderColor: 'orange.300' }}
        _expanded={{ borderColor: 'orange.300', color: 'orange.300' }}
        transition="color 0.2s ease-in-out, border-color 0.2s ease-in-out"
      >
        {selectedOption.name}
      </MenuButton>
      <MenuList maxW="320px" fontFamily="Lora" borderRadius="none">
        {options.map(option => (
          <MenuItem
            key={option.code || 'all'}
            onClick={() => onChange(option.code)}
            fontWeight={option.code === value ? 700 : 400}
            color={option.code === value ? 'orange.300' : undefined}
            _hover={{ color: 'orange.300' }}
            _focus={{ color: 'orange.300' }}
          >
            {option.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
