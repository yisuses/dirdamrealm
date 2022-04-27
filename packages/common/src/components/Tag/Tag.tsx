import { Tag as ChakraTag, TagProps as ChakraTagProps, TagLabel } from '@chakra-ui/tag'

interface TagProps extends ChakraTagProps {
  label: string
}

export function Tag({ label, size, ...rest }: TagProps) {
  return (
    <ChakraTag aria-label={label} size={size} {...rest} variant="outline" boxShadow="none" bgColor="blackAlpha.500">
      <TagLabel fontFamily="Roboto" textTransform="uppercase" color="white" fontSize={10} fontWeight={700}>
        {label}
      </TagLabel>
    </ChakraTag>
  )
}
