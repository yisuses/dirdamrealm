import { Text } from '@chakra-ui/layout'
import { ReactNode } from 'react'

interface FooterListHeaderProps {
  children: ReactNode
}

export const FooterListHeader = ({ children }: FooterListHeaderProps) => {
  return (
    <Text fontWeight="700" fontSize="lg" mb={2} color="white">
      {children}
    </Text>
  )
}
