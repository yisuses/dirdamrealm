import { Button } from '@chakra-ui/button'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Text, Box, Flex, Heading } from '@chakra-ui/layout'
import { Textarea } from '@chakra-ui/textarea'
import intlFormatDistance from 'date-fns/intlFormatDistance'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useRef } from 'react'
// eslint-disable-next-line import/no-named-as-default
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { getComments, addCommentValidate } from '@api/comment'

const { publicRuntimeConfig } = getConfig()

interface PostCommentsProps {
  postId: number
  comments: Commentary[]
  postIds: number[]
}

interface SubmitCommentValues {
  author: string
  text: string
  postId: number
  captcha: string
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
  } = useForm<SubmitCommentValues>({ defaultValues: { postId, author: '', text: '', captcha: '' } })

  const captchaRef = useRef<ReCAPTCHA>(null)
  const { data, refetch } = useQuery({
    initialData: comments,
    queryKey: ['postComments', postIds],
    queryFn: () => getComments({ ids: postIds }),
    enabled: false,
  })
  const { mutate, isLoading } = useMutation<unknown, unknown, SubmitCommentValues>({
    mutationFn: ({ author, text, captcha }) => addCommentValidate({ postId, author, text, captcha }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postIds] })
      refetch()
    },
  })

  const submitNewComment = (values: SubmitCommentValues) => {
    const captcha = captchaRef?.current?.getValue()
    if (captcha) {
      mutate(
        { ...values, captcha },
        {
          onSuccess: () => {
            captchaRef?.current?.reset()
            reset()
          },
        },
      )
    }
  }

  return (
    <Flex direction="column">
      <Heading fontFamily="Lora" mb={6}>
        {t('postPage.comments')}
      </Heading>
      <Box
        padding="16px"
        border="1px solid"
        borderColor={useColorModeValue('blue.400', 'blue.200')}
        borderRadius="md"
        mb="8px"
      >
        <form onSubmit={handleSubmit(submitNewComment)}>
          <FormControl isInvalid={!!errors.author}>
            <FormLabel>{t('postPage.newComment.name')}</FormLabel>
            <Input
              type="text"
              background={useColorModeValue('inherit', 'gray.900')}
              {...register('author', {
                required: t('postPage.newComment.required'),
                minLength: { value: 4, message: t('postPage.newComment.minLength') },
              })}
            />
            {errors?.author?.message && <FormErrorMessage>{`${errors.author.message}`}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={!!errors.text} my={4}>
            <FormLabel>{t('postPage.newComment.comment')}</FormLabel>
            <Textarea
              resize="none"
              size="sm"
              fontSize="md"
              background={useColorModeValue('inherit', 'gray.900')}
              borderRadius="md"
              {...register('text', {
                required: t('postPage.newComment.required'),
                minLength: { value: 4, message: t('postPage.newComment.minLength') },
              })}
            />
            {errors?.text?.message && <FormErrorMessage>{`${errors.text.message}`}</FormErrorMessage>}
          </FormControl>
          <ReCAPTCHA size="normal" ref={captchaRef} sitekey={publicRuntimeConfig.RECAPTCHA_KEY} hl={locale} />
          <Button
            mt={4}
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Adding"
            colorScheme="blue"
            type="submit"
          >
            {t('postPage.newComment.addComment')}
          </Button>
        </form>
      </Box>
      {(data || comments).length > 0 ? (
        (data || comments).map(comment => (
          <Box
            key={comment.id}
            bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
            borderRadius="md"
            my={2}
            p={5}
            boxShadow="sm"
          >
            <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('blue.600', 'blue.300')}>
              {comment.author}
            </Text>
            <Text fontWeight="bold" color={useColorModeValue('blackAlpha.500', 'whiteAlpha.500')}>
              {intlFormatDistance(new Date(comment.createdAt), new Date(), { locale })}
            </Text>
            <Text fontWeight="normal" mt={5} mb={2} color={useColorModeValue('black', 'white')}>
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
