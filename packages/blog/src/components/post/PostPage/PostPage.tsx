/* eslint-disable import/no-duplicates */
import { Text, Box, Divider as DividerLine, Flex, Center } from '@chakra-ui/layout'
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

      <Flex direction="row" width="100%" justifyContent="flex-start" mt="100px">
        <Flex fontSize={14} mr="70px" ml="50px" height="fit-content">
          <Text>{format(parseISO(post.publishedAt), 'dd.MM.yyyy')}</Text>
          <Center h="20px">
            <DividerLine orientation="horizontal" w="80px" mx="20px" borderColor="blackAlpha.800" />
          </Center>
          <Text>{t('postPage.readingTime', { minutes: getReadingTime(post.content) })}</Text>
        </Flex>
        <Box w="860px">
          <Content content={post.content} />
        </Box>
      </Flex>
    </>
  )
}
