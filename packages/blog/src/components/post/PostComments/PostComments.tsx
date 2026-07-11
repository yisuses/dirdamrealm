'use client'

import { Box, Button, Field, Flex, Heading, Input, Text, Textarea } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import intlFormatDistance from 'date-fns/intlFormatDistance'
import { useEffect, useRef } from 'react'
// eslint-disable-next-line import/no-named-as-default
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { addCommentValidate, getComments } from '@blog/api/comment'
import { useColorModeValue } from '@blog/components/ui/color-mode'
import { useLocale } from '@blog/hooks'

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
  const locale = useLocale()
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
  const { mutate, isPending } = useMutation<unknown, unknown, SubmitCommentValues>({
    mutationFn: ({ author, text, captcha }) => addCommentValidate({ postId, author, text, captcha }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postCommentsKey })
      refetch()
    },
  })

  useEffect(() => {
    register('captcha', { required: t('postPage.newComment.required') })
  }, [register])

  // Hoisted color-mode values — in Chakra v3 useColorModeValue is a hook (next-themes),
  // so it must not be called inside loops/conditionals (was breaking on theme toggle).
  const commentBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50')
  const authorColor = useColorModeValue('blue.600', 'blue.300')
  const dateColor = useColorModeValue('blackAlpha.500', 'whiteAlpha.500')
  const commentTextColor = useColorModeValue('black', 'white')
  const formBorderColor = useColorModeValue('blue.400', 'blue.200')
  const inputBg = useColorModeValue('inherit', 'gray.900')

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
          <Box key={id} bg={commentBg} borderRadius="md" my={2} p={5} boxShadow="sm" id={`comment-${id}`}>
            <Text fontSize="lg" fontWeight="bold" color={authorColor}>
              {author}
            </Text>
            <Text fontWeight="bold" color={dateColor}>
              {intlFormatDistance(new Date(createdAt), new Date(), { locale })}
            </Text>
            <Text fontWeight="normal" mt={5} mb={2} color={commentTextColor}>
              {text}
            </Text>
          </Box>
        ))
      ) : (
        <Text>{t('postPage.noComments')}</Text>
      )}
      <Box padding="16px" border="1px solid" borderColor={formBorderColor} borderRadius="md" my="8px">
        <form onSubmit={handleSubmit(submitNewComment)}>
          <Field.Root invalid={!!errors.author}>
            <Field.Label>{t('postPage.newComment.name')}</Field.Label>
            <Input
              type="text"
              background={inputBg}
              aria-invalid={errors.author ? 'true' : 'false'}
              {...register('author', {
                required: t('postPage.newComment.required'),
                minLength: { value: 4, message: t('postPage.newComment.minLength') },
                maxLength: { value: 40, message: t('postPage.newComment.maxNameLength') },
              })}
            />
            {errors?.author?.message && <Field.ErrorText>{`${errors.author.message}`}</Field.ErrorText>}
          </Field.Root>
          <Field.Root invalid={!!errors.text} my={4}>
            <Field.Label>{t('postPage.newComment.comment')}</Field.Label>
            <Textarea
              resize="none"
              aria-invalid={errors.text ? 'true' : 'false'}
              size="sm"
              fontSize="md"
              background={inputBg}
              borderRadius="md"
              {...register('text', {
                required: t('postPage.newComment.required'),
                minLength: { value: 4, message: t('postPage.newComment.minLength') },
              })}
            />
            {errors?.text?.message && <Field.ErrorText>{`${errors.text.message}`}</Field.ErrorText>}
          </Field.Root>
          <Field.Root invalid={!!errors.captcha} my={4}>
            <ReCAPTCHA
              size="normal"
              ref={captchaRef}
              sitekey={process.env.RECAPTCHA_KEY as string}
              hl={locale}
              onChange={value => setValue('captcha', value, { shouldValidate: true })}
            />
            {errors?.captcha?.message && <Field.ErrorText>{`${errors.captcha.message}`}</Field.ErrorText>}
          </Field.Root>
          <Button
            mt={4}
            loading={isPending}
            loadingText={t('postPage.newComment.adding')}
            colorPalette="blue"
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
