import { Flex, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  description?: ReactNode
  action?: ReactNode
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align={{ base: 'stretch', md: 'flex-end' }}
      gap={4}
      direction={{ base: 'column', md: 'row' }}
    >
      <Stack gap={2}>
        <Heading as="h1" size="3xl" fontFamily="Roboto">
          {title}
        </Heading>
        {description && <Text color="gray.700">{description}</Text>}
      </Stack>
      {action}
    </Flex>
  )
}
