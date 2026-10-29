'use client'

import { Box, Flex, Grid, Heading, Link, List, Spinner, Text } from '@chakra-ui/react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { parseISO } from 'date-fns'
import NextLink from 'next/link'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getAllPosts, getCategories } from '@blog/api/public'
import { PageHeading, SelectMenu, Tag } from '@blog/components/common'
import { useLocale, useLocalizeHref } from '@blog/hooks'
import { buildPostPath, formatPostDate } from '@blog/utils'
import {
  ARCHIVE_POSTS_KEY,
  CATEGORIES_STALE_TIME_MS,
  getArchivePostsKey,
  getCategoriesKey,
} from '@blog/utils/constants'

type ArchiveMonthNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

type ArchiveMonth = {
  month: ArchiveMonthNumber
  posts: Post[]
}

type ArchiveYear = {
  year: number
  months: ArchiveMonth[]
}

export function ArchivePage() {
  const { t } = useTranslation('archivePage')
  const locale = useLocale()
  const localizeHref = useLocalizeHref()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: getCategoriesKey(locale),
    queryFn: () => getCategories({ locale }),
    staleTime: CATEGORIES_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  // The whole (unfiltered) post list feeds the year selector, so its options stay stable
  // regardless of the selected category. It reuses the SSR-prefetched ARCHIVE_POSTS_KEY,
  // so no extra request is made.
  const { data: allPosts = [] } = useQuery({
    queryKey: ARCHIVE_POSTS_KEY,
    queryFn: () => getAllPosts({ locale }),
    staleTime: CATEGORIES_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  // Default (no category) reuses the SSR-prefetched ARCHIVE_POSTS_KEY; picking a category
  // triggers a fresh axios fetch scoped to that category, cached under its own query key.
  // keepPreviousData keeps the current list on screen while the next one loads, so switching
  // category never flashes the "no posts" message before results arrive.
  const {
    data: archivePosts = [],
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: selectedCategory ? getArchivePostsKey(selectedCategory) : ARCHIVE_POSTS_KEY,
    queryFn: () => getAllPosts({ locale, category: selectedCategory || undefined }),
    placeholderData: keepPreviousData,
    staleTime: CATEGORIES_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })

  const years = useMemo(
    () => Array.from(new Set(allPosts.map(post => parseISO(post.publishedAt).getFullYear()))).sort((a, b) => b - a),
    [allPosts],
  )

  // Year filtering is applied client-side on top of the (category-scoped) list already loaded.
  const filteredPosts = useMemo(
    () =>
      selectedYear
        ? archivePosts.filter(post => parseISO(post.publishedAt).getFullYear() === Number(selectedYear))
        : archivePosts,
    [archivePosts, selectedYear],
  )

  const postsByYear = useMemo<ArchiveYear[]>(() => {
    if (filteredPosts.length === 0) {
      return []
    }

    const sortedPosts = [...filteredPosts].sort(
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
            posts: groupedPosts[year]![month],
          })),
      }))
  }, [filteredPosts])

  return (
    <Box maxW="948px" mx="auto" px={{ base: 4, md: 6 }} mb={20}>
      <PageHeading
        kicker={t('archivePage.kicker')}
        title={t('archivePage.title')}
        description={allPosts.length ? t('archivePage.count', { count: allPosts.length }) : undefined}
      >
        <Flex mt={6} gap={3} flexWrap="wrap">
          <Box width={{ base: '100%', sm: '260px' }}>
            <SelectMenu
              value={selectedCategory}
              onChange={setSelectedCategory}
              label={t('archivePage.filterByCategory')}
              options={[
                { value: '', label: t('archivePage.allCategories') },
                ...categories.map(({ code, localizedName }) => ({ value: code, label: localizedName })),
              ]}
            />
          </Box>
          <Box width={{ base: '100%', sm: '200px' }}>
            <SelectMenu
              value={selectedYear}
              onChange={setSelectedYear}
              label={t('archivePage.filterByYear')}
              options={[
                { value: '', label: t('archivePage.allYears') },
                ...years.map(year => ({ value: String(year), label: String(year) })),
              ]}
            />
          </Box>
        </Flex>
      </PageHeading>
      {isFetching && postsByYear.length === 0 ? (
        <Flex justifyContent="center" mt={10}>
          <Spinner color="accent" size="lg" borderWidth="3px" aria-label={t('archivePage.loading')} />
        </Flex>
      ) : postsByYear.length > 0 ? (
        <Box opacity={isPlaceholderData ? 0.5 : 1} transition="opacity 0.2s ease-in-out">
          {postsByYear.map(({ year, months }) => (
            <Box as="section" key={year} mt={12}>
              <Flex alignItems="baseline" gap={3.5} pb={2.5} borderBottom="1px solid" borderColor="fg">
                <Heading as="h2" fontSize={{ base: '38px', md: '44px' }} fontWeight={500} lineHeight={1}>
                  {year}
                </Heading>
                <Text fontFamily="sans" fontSize="14px" color="fg.muted">
                  {t('archivePage.count', { count: months.reduce((total, { posts }) => total + posts.length, 0) })}
                </Text>
              </Flex>
              {months.map(({ month, posts }) => (
                <Grid
                  key={month}
                  templateColumns={{ base: '1fr', md: '140px 1fr' }}
                  gap={{ base: 1.5, md: 4 }}
                  py={4.5}
                  borderBottom="1px solid"
                  borderColor="border"
                >
                  <Heading
                    as="h3"
                    fontFamily="sans"
                    fontSize="13px"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    color="accent"
                    pt={{ md: 1.5 }}
                  >
                    {t(`archivePage.months.${month}`)}
                  </Heading>
                  <List.Root listStyleType="none" gap={1}>
                    {posts.map(({ id, publishedAt, title, categories: postCategories }) => (
                      <List.Item
                        key={id}
                        display="grid"
                        gridTemplateColumns={{ base: '44px 1fr', md: '56px 1fr auto' }}
                        gap={4}
                        alignItems="baseline"
                        py={1}
                      >
                        <Text
                          as="span"
                          fontFamily="sans"
                          fontSize="14px"
                          color="fg.muted"
                          fontVariantNumeric="tabular-nums"
                        >
                          {formatPostDate(publishedAt).slice(0, 2)}
                        </Text>
                        <Link
                          asChild
                          fontSize={{ base: '18px', md: '19px' }}
                          lineHeight="1.35"
                          color="fg"
                          _hover={{ color: 'accent', textDecoration: 'none' }}
                        >
                          <NextLink href={localizeHref(buildPostPath(id, title))}>{title}</NextLink>
                        </Link>
                        {postCategories?.[0] && (
                          <Tag
                            display={{ base: 'none', md: 'inline' }}
                            label={postCategories[0].localizedName}
                            color="fg.muted"
                            fontSize="11px"
                            fontWeight={500}
                          />
                        )}
                      </List.Item>
                    ))}
                  </List.Root>
                </Grid>
              ))}
            </Box>
          ))}
        </Box>
      ) : (
        <Text mt={6} color="fg.muted">
          {t('archivePage.noPosts')}
        </Text>
      )}
    </Box>
  )
}
