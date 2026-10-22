'use client'

import { Flex, IconButton, Portal, Table, Tooltip } from '@chakra-ui/react'
import { LuInfo } from 'react-icons/lu'

interface ColumnHeaderProps {
  label: string
  /** What the column means, in plain words: shown above the header on hover, focus or tap. */
  hint: string
}

export function ColumnHeader({ label, hint }: ColumnHeaderProps) {
  return (
    <Table.ColumnHeader>
      <Flex align="center" gap={1}>
        {label}
        <Tooltip.Root openDelay={150} positioning={{ placement: 'top' }}>
          <Tooltip.Trigger asChild>
            <IconButton aria-label={`¿Qué es «${label}»?`} variant="ghost" size="xs" rounded="full" color="gray.700">
              <LuInfo />
            </IconButton>
          </Tooltip.Trigger>
          <Portal>
            <Tooltip.Positioner>
              <Tooltip.Content fontSize="md" maxW="xs" px={3} py={2}>
                <Tooltip.Arrow>
                  <Tooltip.ArrowTip />
                </Tooltip.Arrow>
                {hint}
              </Tooltip.Content>
            </Tooltip.Positioner>
          </Portal>
        </Tooltip.Root>
      </Flex>
    </Table.ColumnHeader>
  )
}
