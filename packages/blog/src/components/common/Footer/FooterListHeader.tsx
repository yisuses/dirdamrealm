'use client'

import { Text } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface FooterListHeaderProps {
  children: ReactNode
}

export const FooterListHeader = ({ children }: FooterListHeaderProps) => {
  return (
    <Text
      fontFamily="sans"
      fontWeight={600}
      fontSize="13px"
      textTransform="uppercase"
      letterSpacing="0.1em"
      color="fg.muted"
      mb={3.5}
    >
      {children}
    </Text>
  )
}
