import { Box, Text } from '@chakra-ui/layout'
import { ReactNode } from 'react'

type RibbonProps = {
  children: ReactNode
}

export function Ribbon({ children }: RibbonProps) {
  const commonPseudoStyles = {
    position: 'absolute',
    zIndex: -1,
    content: "''",
    display: 'block',
    border: '5px solid #2980b9',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  }

  return (
    <Box
      position="absolute"
      zIndex={1}
      width={75}
      height={75}
      _before={{
        ...commonPseudoStyles,
        top: 0,
        right: 0,
      }}
      _after={{
        ...commonPseudoStyles,
        bottom: 0,
        left: 0,
      }}
      top="-10px"
      left="-10px"
    >
      <Text
        as="span"
        position="absolute"
        display="block"
        width={75}
        p="0px 0"
        backgroundColor="orange.300"
        boxShadow="0 5px 10px  rgba(0,0,0,.2)"
        color="#fff"
        fontSize="1rem"
        fontWeight={500}
        textShadow="0 1px 1px rgba(0,0,0,.2)"
        textTransform="uppercase"
        textAlign="center"
        right="10px"
        top="13px"
        transform="rotate(-45deg)"
        fontFamily="Roboto"
      >
        {children}
      </Text>
    </Box>
  )
}
