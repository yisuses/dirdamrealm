import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Text, Box, Flex, Heading } from '@chakra-ui/layout'
import { Textarea } from '@chakra-ui/textarea'
import intlFormatDistance from 'date-fns/intlFormatDistance'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { addComment, getComments } from '@api/comment'

interface PostCommentsProps {
  postId: number
  comments: Commentary[]
  postIds: number[]
}

interface SubmitCommentValues {
  name: string
  text: string
  postId: number
}

export function PostComments({ postId, comments, postIds }: PostCommentsProps) {
  const { t } = useTranslation('postPage')
  const queryClient = useQueryClient()
  const { locale } = useRouter()
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<SubmitCommentValues>({ defaultValues: { name: '', text: '', postId } })

  const { data, refetch } = useQuery({
    initialData: comments,
    queryKey: ['postComments', postIds],
    queryFn: () => getComments({ ids: postIds }),
    enabled: false,
  })
  const { mutate, isLoading } = useMutation<unknown, unknown, SubmitCommentValues>({
    mutationFn: ({ name, text }) => addComment({ postId, author: name, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postIds] })
      refetch()
    },
  })

  return (
    <Flex direction="column">
      <Heading fontFamily="Lora" mb={6}>
        {t('postPage.comments')}
      </Heading>
      <form onSubmit={handleSubmit(values => mutate(values, { onSuccess: () => reset() }))}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>{t('postPage.newComment.name')}</FormLabel>
          <Input
            type="text"
            {...register('name', {
              required: t('postPage.newComment.required'),
              minLength: { value: 4, message: t('postPage.newComment.minLength') },
            })}
          />
          {errors?.name?.message && <FormErrorMessage>{`${errors.name.message}`}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!errors.text}>
          <FormLabel>{t('postPage.newComment.comment')}</FormLabel>
          <Textarea
            resize="none"
            size="sm"
            {...register('text', {
              required: t('postPage.newComment.required'),
              minLength: { value: 4, message: t('postPage.newComment.minLength') },
            })}
          />
          {errors?.text?.message && <FormErrorMessage>{`${errors.text.message}`}</FormErrorMessage>}
        </FormControl>
        <Button
          disabled={isLoading}
          isLoading={isLoading}
          loadingText="Adding"
          colorScheme="blue"
          variant="outline"
          type="submit"
        >
          {t('postPage.newComment.addComment')}
        </Button>
      </form>
      {(data || comments).length > 0 ? (
        (data || comments).map(comment => (
          <Box key={comment.id} bg="blackAlpha.50" borderRadius="md" my={2} p={5} boxShadow="sm">
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              {comment.author}
            </Text>
            <Text fontWeight="bold" color="blackAlpha.500">
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
