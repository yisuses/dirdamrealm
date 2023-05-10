import { Button } from '@chakra-ui/button'
import { useColorModeValue } from '@chakra-ui/color-mode'
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Text, Box, Flex, Heading } from '@chakra-ui/layout'
import { Textarea } from '@chakra-ui/textarea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import intlFormatDistance from 'date-fns/intlFormatDistance'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useRef, useEffect } from 'react'
// eslint-disable-next-line import/no-named-as-default
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
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
  captcha: string | null
}

export function PostComments({ postId, comments, postIds }: PostCommentsProps) {
  const { t } = useTranslation('postPage')
  const queryClient = useQueryClient()
  const { locale } = useRouter()
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SubmitCommentValues>({ defaultValues: { postId, author: '', text: '', captcha: null } })

  const captchaRef = useRef<ReCAPTCHA>(null)
  const postCommentsKey = ['postComments', postIds.join()]
  const { data, refetch } = useQuery({
    initialData: comments,
    queryKey: postCommentsKey,
    queryFn: () => getComments({ ids: postIds }),
    enabled: false,
  })
  const { mutate, isLoading } = useMutation<unknown, unknown, SubmitCommentValues>({
    mutationFn: ({ author, text, captcha }) => addCommentValidate({ postId, author, text, captcha }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postCommentsKey })
      refetch()
    },
  })

  useEffect(() => {
    register('captcha', { required: t('postPage.newComment.required') })
  }, [register])

  const submitNewComment = (values: SubmitCommentValues) => {
    const captcha = captchaRef?.current?.getValue()
    if (captcha) {
      mutate(values, {
        onSuccess: () => {
          captchaRef?.current?.reset()
          reset()
        },
      })
    }
  }

  return (
    <Flex direction="column">
      <Heading fontFamily="Lora" mb={6}>
        {t('postPage.comments')}
      </Heading>
      {(data || comments).length > 0 ? (
        (data || comments).map(({ id, author, createdAt, text }) => (
          <Box
            key={id}
            bg={useColorModeValue('blackAlpha.50', 'whiteAlpha.50')}
            borderRadius="md"
            my={2}
            p={5}
            boxShadow="sm"
            id={`comment-${id}`}
          >
            <Text fontSize="lg" fontWeight="bold" color={useColorModeValue('blue.600', 'blue.300')}>
              {author}
            </Text>
            <Text fontWeight="bold" color={useColorModeValue('blackAlpha.500', 'whiteAlpha.500')}>
              {intlFormatDistance(new Date(createdAt), new Date(), { locale })}
            </Text>
            <Text fontWeight="normal" mt={5} mb={2} color={useColorModeValue('black', 'white')}>
              {text}
            </Text>
          </Box>
        ))
      ) : (
        <Text>{t('postPage.noComments')}</Text>
      )}
      <Box
        padding="16px"
        border="1px solid"
        borderColor={useColorModeValue('blue.400', 'blue.200')}
        borderRadius="md"
        my="8px"
      >
        <form onSubmit={handleSubmit(submitNewComment)}>
          <FormControl isInvalid={!!errors.author}>
            <FormLabel>{t('postPage.newComment.name')}</FormLabel>
            <Input
              type="text"
              background={useColorModeValue('inherit', 'gray.900')}
              aria-invalid={errors.author ? 'true' : 'false'}
              {...register('author', {
                required: t('postPage.newComment.required'),
                minLength: { value: 4, message: t('postPage.newComment.minLength') },
                maxLength: { value: 40, message: t('postPage.newComment.maxNameLength') },
              })}
            />
            {errors?.author?.message && <FormErrorMessage>{`${errors.author.message}`}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={!!errors.text} my={4}>
            <FormLabel>{t('postPage.newComment.comment')}</FormLabel>
            <Textarea
              resize="none"
              aria-invalid={errors.text ? 'true' : 'false'}
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
          <FormControl isInvalid={!!errors.captcha} my={4}>
            <ReCAPTCHA
              size="normal"
              ref={captchaRef}
              sitekey={publicRuntimeConfig.RECAPTCHA_KEY}
              hl={locale}
              onChange={value => setValue('captcha', value, { shouldValidate: true })}
            />
            {errors?.captcha?.message && <FormErrorMessage>{`${errors.captcha.message}`}</FormErrorMessage>}
          </FormControl>
          <Button
            mt={4}
            isLoading={isLoading}
            loadingText={t('postPage.newComment.adding')}
            colorScheme="blue"
            type="submit"
            opacity={isDirty ? 1 : 0.5}
            pointerEvents={isDirty ? 'inherit' : 'none'}
          >
            {t('postPage.newComment.addComment')}
          </Button>
        </form>
      </Box>
    </Flex>
  )
}
