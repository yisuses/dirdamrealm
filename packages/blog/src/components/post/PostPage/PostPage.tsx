/* eslint-disable import/no-duplicates */
import { Text, Box, Divider as DividerLine, Flex, Center, Heading } from '@chakra-ui/layout'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { useTranslation } from 'next-i18next'

import { Content, HeaderImage, Metadata } from '@components/common'
import { getReadingTime } from '@utils/getReadingTime'

export interface PostPageProps {
  post: Post
}

export function PostPage({ post }: PostPageProps) {
  const { t } = useTranslation('postPage')
  //TODO ldjson

  return (
    <>
      <Metadata name={t('postPage.title', { postName: post.title })} description={post.summary} />

      <HeaderImage post={post} />

      <Flex justifyContent="center" mx="16px" my={{ base: '40px', md: '100px' }}>
        <Flex direction="column" justifyContent="flex-start" width="100%" maxW="860px">
          <Box>
            <Heading
              as="h1"
              fontSize={{ base: '30px', md: '50px' }}
              lineHeight={{ base: '40px', md: '60px' }}
              fontFamily="Lora"
            >
              {post.title}
            </Heading>
            <Flex fontSize="14px" direction={{ base: 'column', md: 'row' }} mt={6}>
              <Text as="i" display="block">
                {t('postPage.author', { name: post.writer?.name })}
              </Text>
              <Flex ml={{ base: 0, md: '48px' }} mt={{ base: '8px', md: 0 }} height="fit-content">
                <Text>{format(parseISO(post.publishedAt), 'dd.MM.yyyy')}</Text>
                <Center h="22px">
                  <DividerLine
                    orientation="horizontal"
                    w={{ base: '20px', md: '40px', lg: '60px' }}
                    mx="20px"
                    borderColor="blackAlpha.800"
                  />
                </Center>
                <Text>{t('postPage.readingTime', { minutes: getReadingTime(post.content) })}</Text>
              </Flex>
            </Flex>
          </Box>
          <Flex direction="column" width="100%" justifyContent="center" mt="52px">
            <Content content={post.content} />
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}
