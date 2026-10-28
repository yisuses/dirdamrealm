import { Box, Text } from '@chakra-ui/react'

/** Says, on the preview link, that this is not what readers see yet. Only the panel's users get it. */
export function PreviewBanner() {
  return (
    <Box role="note" bg="orange.100" color="orange.950" borderBottomWidth={1} borderColor="orange.300" px={4} py={3}>
      <Text textAlign="center" fontSize="lg">
        <b>Vista previa.</b> Así se verá la entrada al publicarla. Los lectores todavía no ven estos cambios.
      </Text>
    </Box>
  )
}
