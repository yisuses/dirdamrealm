import { Box, Flex, Heading, Link, List, ListItem, Text } from '@chakra-ui/layout'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { parseISO } from 'date-fns'
import type { GetServerSideProps, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { useMemo } from 'react'
import { ItemList, WebPage } from 'schema-dts'

import { getAllPosts } from '@blog/api/post'
import { WithErrorProps, withErrorComponent } from '@blog/components'
import { Metadata } from '@blog/components/common'
import { getServerTranslations } from '@blog/core/i18n'
import { useGetData, useGetLocalePublicUrl } from '@blog/hooks'
import { buildPostPath, formatPostDate, handlePageError } from '@blog/utils'
import { ARCHIVE_POSTS_KEY } from '@blog/utils/constants'

type ArchiveMonthNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

type ArchiveMonth = {
  month: ArchiveMonthNumber
  posts: Post[]
}

type ArchiveYear = {
  year: number
  months: ArchiveMonth[]
}

const ArchivePage: NextPage = () => {
  const { t } = useTranslation('archivePage')
  const generateLocalePublicUrl = useGetLocalePublicUrl()
  const archivePosts = useGetData<Post[]>(ARCHIVE_POSTS_KEY, [])

  const postsByYear = useMemo<ArchiveYear[]>(() => {
    if (archivePosts.length === 0) {
      return []
    }

    const sortedPosts = [...archivePosts].sort(
      (a, b) => parseISO(b.publishedAt).getTime() - parseISO(a.publishedAt).getTime(),
    )

    const groupedPosts = sortedPosts.reduce<Record<number, Record<ArchiveMonthNumber, Post[]>>>(
      (acc, post) => {
        const parsedDate = parseISO(post.publishedAt)
        const year = parsedDate.getFullYear()
        const month = parsedDate.getMonth() as ArchiveMonthNumber

        acc[year] = acc[year] || {}
        ;(acc[year][month] = acc[year][month] || []).push(post)

        return acc
      },
      {} as Record<number, Record<number, Post[]>>,
    )

    return Object.keys(groupedPosts)
      .map(Number)
      .sort((a, b) => b - a)
      .map(year => ({
        year,
        months: Object.keys(groupedPosts[year]!)
          .map(month => Number(month) as ArchiveMonthNumber)
          .sort((a, b) => b - a)
          .map(month => ({
            month,
            posts: groupedPosts[year]![month] || [],
          })),
      }))
  }, [archivePosts])

  const archiveLdItems = useMemo<ItemList>(() => {
    let position = 1

    const itemListElement = postsByYear.flatMap(({ months }) =>
      months.flatMap(({ posts }) =>
        posts.map(post => {
          const item = {
            '@type': 'ListItem',
            position,
            url: generateLocalePublicUrl(buildPostPath(post.id, post.title)),
          }
          position += 1
          return item
        }),
      ),
    )

    return {
      '@type': 'ItemList',
      itemListElement: itemListElement as ItemList['itemListElement'],
    }
  }, [generateLocalePublicUrl, postsByYear])

  const ldJsonPage = useMemo<WebPage>(
    () => ({
      '@type': 'WebPage',
      headline: t('archivePage.title'),
      url: generateLocalePublicUrl('/archive'),
    }),
    [generateLocalePublicUrl, t],
  )

  return (
    <>
      <Metadata
        name={t('archivePage.title')}
        description={t('archivePage.description')}
        ldJson={[ldJsonPage, archiveLdItems]}
      />

      <Flex justifyContent="center" mx="16px" mt={{ base: '40px', md: '72px' }}>
        <Box maxW="65ch" width="100%" marginBottom={20}>
          <Heading as="h1" fontSize={{ base: '52px', md: '64px' }} fontFamily="spartan" letterSpacing="4px">
            {t('archivePage.title')}
          </Heading>

          {postsByYear.length > 0 ? (
            postsByYear.map(({ year, months }, index) => (
              <Box key={year} mt={10}>
                <Heading as="h2" fontSize={{ base: '38px', md: '46px' }} fontFamily="Lora">
                  {year}
                </Heading>

                {months.map(({ month, posts }) => (
                  <Box key={month} mt={4} pl={3}>
                    <Heading as="h3" fontSize={{ base: '22px', md: '28px' }} fontFamily="Roboto" color="orange.300">
                      {t(`archivePage.months.${month}`)}
                    </Heading>

                    <List mt={3} spacing={2} pl={{ base: '22px', md: '28px' }}>
                      {posts.map(({ id, publishedAt, title }) => (
                        <ListItem key={id} display="flex" alignItems="baseline" gap={3}>
                          <Text minW={{ base: '110px', md: '95px' }} fontSize={{ base: 'sm', md: 'md' }}>
                            {formatPostDate(publishedAt)}
                          </Text>
                          <Link as={NextLink} href={buildPostPath(id, title)} _hover={{ color: 'orange.300' }}>
                            {title}
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}

                {index !== postsByYear.length - 1 && (
                  <Box mt={8} mb={8} h="1px" width="100%" bg="gray.300" maxW="100%" />
                )}
              </Box>
            ))
          ) : (
            <Text mt={6}>{t('archivePage.noPosts')}</Text>
          )}
        </Box>
      </Flex>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Record<string, unknown> | WithErrorProps> = async ({
  locale,
  res,
}) => {
  const queryClient = new QueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: ARCHIVE_POSTS_KEY,
      queryFn: () => getAllPosts({ locale: locale as AppLocales }),
    })

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        ...(locale && (await getServerTranslations(locale, ['common', 'archivePage']))),
      },
    }
  } catch (error) {
    return handlePageError(error as Error, res)
  }
}

export default withErrorComponent(ArchivePage)
