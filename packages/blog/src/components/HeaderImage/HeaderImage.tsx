import { Box } from '@chakra-ui/react'
import Image from 'next/image'

interface HeaderImageProps {
  src: string
}

export function HeaderImage({ src }: HeaderImageProps) {
  return (
    <Box height={{ base: 200, md: 400, lg: 600 }} position="relative">
      <Image src={src} layout="fill" height={600} width="100%" objectFit="cover" />
    </Box>
  )
}
