'use client'

import { Box, Button, Field, Flex, Heading, Input, Text, Textarea } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { intlFormatDistance } from 'date-fns'
import { useEffect, useRef } from 'react'
// eslint-disable-next-line import/no-named-as-default
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { addCommentValidate } from '@blog/api/comment'
import { getComments } from '@blog/api/public'
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

  const shownComments = data || comments
  const fieldStyles = {
    fontFamily: 'sans',
    fontSize: '15px',
    bg: 'bg',
    borderColor: 'border',
    borderRadius: '10px',
    _focusVisible: { borderColor: 'accent', outline: '2px solid', outlineColor: 'accent' },
  } as const

  return (
    <Flex as="section" direction="column" mt={14} pt={8} borderTop="1px solid" borderColor="border">
      <Heading as="h2" fontSize={{ base: '26px', md: '28px' }} fontWeight={500} mb={2}>
        {t('postPage.comments')}
        {shownComments.length > 0 && ` (${shownComments.length})`}
      </Heading>
      {shownComments.length > 0 ? (
        shownComments.map(({ id, author, createdAt, text }) => (
          <Flex key={id} gap={3.5} py={5} borderBottom="1px solid" borderColor="border" id={`comment-${id}`}>
            <Flex
              aria-hidden
              w={10}
              h={10}
              flex="none"
              borderRadius="full"
              bg="accent.soft"
              color="accent"
              alignItems="center"
              justifyContent="center"
              fontFamily="sans"
              fontWeight={600}
              textTransform="uppercase"
            >
              {author.trim()[0]}
            </Flex>
            <Box>
              <Text fontFamily="sans" fontSize="15px">
                <Text as="span" fontWeight={600}>
                  {author}
                </Text>
                <Text as="span" color="fg.muted" ms={2}>
                  {intlFormatDistance(new Date(createdAt), new Date(), { locale })}
                </Text>
              </Text>
              <Text mt={1} fontSize="18px" whiteSpace="pre-line">
                {text}
              </Text>
            </Box>
          </Flex>
        ))
      ) : (
        <Text color="fg.muted">{t('postPage.noComments')}</Text>
      )}
      <Box mt={7} p={6} bg="bg.panel" border="1px solid" borderColor="border" borderRadius="14px">
        <form onSubmit={handleSubmit(submitNewComment)}>
          <Field.Root invalid={!!errors.author}>
            <Field.Label fontFamily="sans" fontWeight={500}>
              {t('postPage.newComment.name')}
            </Field.Label>
            <Input
              type="text"
              {...fieldStyles}
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
            <Field.Label fontFamily="sans" fontWeight={500}>
              {t('postPage.newComment.comment')}
            </Field.Label>
            <Textarea
              resize="vertical"
              rows={3}
              aria-invalid={errors.text ? 'true' : 'false'}
              {...fieldStyles}
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
            mt={2}
            loading={isPending}
            loadingText={t('postPage.newComment.adding')}
            colorPalette="gold"
            rounded="full"
            px={6}
            fontWeight={600}
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
