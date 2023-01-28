import { Text, Box, Flex, Heading } from '@chakra-ui/layout'
import intlFormatDistance from 'date-fns/intlFormatDistance'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

interface PostCommentsProps {
  comments: Commentary[]
}

export function PostComments({ comments }: PostCommentsProps) {
  const { t } = useTranslation('postPage')
  const { locale } = useRouter()

  return (
    <Flex direction="column">
      <Heading fontFamily="Lora" mb={6}>
        {t('postPage.comments')}
      </Heading>
      {comments.length > 0 ? (
        comments.map(comment => (
          <Box key={comment.id} bg="gray.100" borderRadius="md" my={2} p={5} boxShadow="sm">
            <Text fontSize="lg" fontWeight="bold">
              {comment.author}
            </Text>
            <Text fontWeight="bold" color="cyan.600">
              {intlFormatDistance(new Date(comment.createdAt), new Date(), { locale })}
            </Text>
            <Text fontWeight="normal" mt={5} mb={2}>
              {comment.text}
            </Text>
          </Box>
        ))
      ) : (
        <Text>{t('postPage.noComments')}</Text>
      )}
    </Flex>
  )
}
