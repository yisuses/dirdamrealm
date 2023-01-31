import { Button } from '@chakra-ui/button'
import { FormControl, FormLabel, FormHelperText, FormErrorMessage } from '@chakra-ui/form-control'
import { Input } from '@chakra-ui/input'
import { Text, Box, Flex, Heading } from '@chakra-ui/layout'
import { Textarea } from '@chakra-ui/textarea'
import intlFormatDistance from 'date-fns/intlFormatDistance'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface PostCommentsProps {
  comments: Commentary[]
}

export function PostComments({ comments }: PostCommentsProps) {
  const { t } = useTranslation('postPage')
  const { locale } = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm()

  function onSubmit(values) {
    return new Promise(resolve => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2))
        resolve(true)
      }, 3000)
    })
  }

  return (
    <Flex direction="column">
      <Heading fontFamily="Lora" mb={6}>
        {t('postPage.comments')}
      </Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Your name</FormLabel>
          <Input
            type="text"
            {...register('name', {
              required: 'This is required',
              minLength: { value: 4, message: 'Minimum length should be 4' },
            })}
          />
          {errors?.name?.message && <FormErrorMessage>{`${errors.name.message}`}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!errors.text}>
          <FormLabel>Text</FormLabel>
          <Textarea
            resize="none"
            size="sm"
            {...register('text', {
              required: 'This is required',
              minLength: { value: 4, message: 'Minimum length should be 4' },
            })}
          />
          {errors?.text?.message ? (
            <FormErrorMessage>{`${errors.text.message}`}</FormErrorMessage>
          ) : (
            <FormHelperText>What do you think?</FormHelperText>
          )}
        </FormControl>
        <Button isLoading={isSubmitting} loadingText="Adding" colorScheme="blue" variant="outline" type="submit">
          Add comment
        </Button>
      </form>
      {comments.length > 0 ? (
        comments.map(comment => (
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
