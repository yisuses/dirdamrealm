import { Box, Text } from '@chakra-ui/layout'
import { ReactNode } from 'react'

type RibbonProps = {
  children: ReactNode
}

export function Ribbon({ children }: RibbonProps) {
  return (
    <Box position="absolute" overflow="hidden" zIndex={1} width={75} height={75} top="0" left="0">
      <Text
        as="span"
        position="absolute"
        display="block"
        width={75}
        p="0"
        backgroundColor="orange.300"
        boxShadow="0 5px 10px rgba(0,0,0,.2)"
        color="#fff"
        fontSize="1rem"
        fontWeight={500}
        textShadow="0 1px 1px rgba(0,0,0,.2)"
        textTransform="uppercase"
        textAlign="center"
        right="19px"
        top="6px"
        transform="rotate(-45deg)"
        fontFamily="Roboto"
      >
        {children}
      </Text>
    </Box>
  )
}
