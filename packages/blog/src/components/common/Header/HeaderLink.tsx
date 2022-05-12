import { Link, Text } from '@chakra-ui/layout'
import { ReactNode } from 'react'

interface HeaderLinkProps {
  children: ReactNode
  href?: string
}

export const HeaderLink = ({ children, href }: HeaderLinkProps) => (
  <Link
    px={{ md: 2, lg: 3 }}
    fontWeight="700"
    fontSize={{ md: 12 }}
    _hover={{
      textDecoration: 'none',
      '::after': {
        width: '100%',
      },
    }}
    _active={{
      '::after': {
        width: 'calc(100% + 10px)',
        marginLeft: '-5px',
        transition: 'none',
      },
    }}
    href={href}
    _after={{
      content: '""',
      display: 'block',
      width: 0,
      height: '2px',
      marginTop: '3px',
      bg: 'orange.300',
      transition: 'width 0.2s',
    }}
    pt="5px"
  >
    <Text color="white">{children}</Text>
  </Link>
)
