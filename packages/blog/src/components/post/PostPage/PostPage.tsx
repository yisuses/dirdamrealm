'use client'

import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6'
import { LuShare2 } from 'react-icons/lu'

import { Content, HeaderImage, PostGrid, SocialButton, Tag } from '@blog/components/common'
import { useGetData } from '@blog/hooks'
import { fixedEncodeURIComponent, formatPostDate, getReadingTime, publicUrl } from '@blog/utils'
import { getLatestPostsKey, getPostCommentsKey, getPostKey } from '@blog/utils/constants'

import { PostComments } from '../PostComments'

type ShareButtonProps = {
  label: string
  icon: IconType
  href?: string
  onClick?: () => void
}

export function PostPage() {
  const { t } = useTranslation('postPage')
  const { postId } = useParams<{ postId: string }>()
  const pathname = usePathname()

  const postKey = getPostKey(Number(postId))
  const post = useGetData<Post>(postKey)

  if (!post) {
    return null
  }

  const latestPostsCategoryKey = getLatestPostsKey(post.categories?.[0]?.code)
  const latestCategoryPosts = useGetData<Post[]>(latestPostsCategoryKey)
  const sameCategoryPosts = latestCategoryPosts?.filter(categoryPost => categoryPost.id !== post.id)

  const postCommentIds = post.localizations
    ? [...post.localizations.map(localization => localization.id), post.id]
    : [post.id]
  const comments = useGetData<Commentary[]>(getPostCommentsKey(postCommentIds), [])

  const [nativeNavigator, setNativeNavigator] = useState<Navigator>()
  useEffect(() => {
    setNativeNavigator(navigator)
  }, [])

  const { id, title, summary, content, publishedAt, categories, writer } = post

  const parsedDate = formatPostDate(publishedAt)

  // usePathname already includes the locale prefix for non-default locales, so no extra prefixing.
  const postUrl = publicUrl(pathname || '')
  const encodedPostUrl = fixedEncodeURIComponent(postUrl)
  const postSocialTitle = encodeURIComponent(t('postPage.shareTitle', { title }))

  const shareButtonsData: ShareButtonProps[] = [
    {
      label: t('postPage.share', { socialNetwork: 'X' }),
      href: `https://twitter.com/intent/tweet?text=${postSocialTitle}&url=${encodedPostUrl}`,
      icon: FaXTwitter,
    },
    {
      label: t('postPage.share', { socialNetwork: 'Facebook' }),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedPostUrl}`,
      icon: FaFacebookF,
    },
    {
      label: t('postPage.share', { socialNetwork: 'Linkedin' }),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedPostUrl}`,
      icon: FaLinkedinIn,
    },
  ]

  if (nativeNavigator && nativeNavigator.share !== undefined) {
    shareButtonsData.push({
      label: t('postPage.share', { socialNetwork: '...' }),
      icon: LuShare2,
      onClick: () => nativeNavigator.share({ url: postUrl }),
    })
  }

  const socialButtons = shareButtonsData.map(({ label, href, icon: ShareIcon, onClick }) => (
    <SocialButton key={label} label={label} href={href} onClick={onClick}>
      <ShareIcon size={15} />
    </SocialButton>
  ))

  const mainCategory = categories?.[0]
  const initials = (writer?.name ?? '')
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')

  return (
    <>
      <HeaderImage post={post} />
      <Box as="article" maxW="748px" mx="auto" px={{ base: 4, md: 6 }} mt={{ base: 8, md: 12 }}>
        {mainCategory && <Tag label={mainCategory.localizedName} />}
        <Heading
          as="h1"
          fontSize={{ base: '36px', md: '50px' }}
          lineHeight="1.1"
          fontWeight={500}
          letterSpacing="-0.01em"
          mt={3}
          mb={3.5}
        >
          {title}
        </Heading>
        {summary && (
          <Text fontSize={{ base: '20px', md: '23px' }} lineHeight="1.5" fontStyle="italic" color="fg.muted" mb={5.5}>
            {summary}
          </Text>
        )}
        <Flex alignItems="center" gap={3} py={4} borderY="1px solid" borderColor="border" flexWrap="wrap">
          {initials && (
            <Flex
              aria-hidden
              w={10}
              h={10}
              borderRadius="full"
              bg="accent.soft"
              color="accent"
              alignItems="center"
              justifyContent="center"
              fontFamily="sans"
              fontWeight={600}
              flex="none"
            >
              {initials}
            </Flex>
          )}
          <Box fontFamily="sans">
            {writer?.name && (
              <Text fontSize="15px" fontWeight={500}>
                {writer.name}
              </Text>
            )}
            <Text fontSize="14px" color="fg.muted">
              {parsedDate} · {t('postPage.readingTime', { minutes: getReadingTime(content) })}
            </Text>
          </Box>
          <Stack direction="row" gap={2} ml="auto" display={{ base: 'none', sm: 'flex' }}>
            {socialButtons}
          </Stack>
        </Flex>
        <Box mt={{ base: 8, md: 10 }} fontSize={{ base: '18px', md: '19px' }} lineHeight="1.7">
          <Content content={content} />
        </Box>
        <Flex alignItems="center" gap={3} mt={10} pt={6} borderTop="1px solid" borderColor="border" flexWrap="wrap">
          <Flex gap={4} flexWrap="wrap">
            {categories?.map(category => (
              <Tag key={category.code} label={category.localizedName} />
            ))}
          </Flex>
          <Stack direction="row" gap={2} ml="auto">
            {socialButtons}
          </Stack>
        </Flex>
        <PostComments postId={id} comments={comments} postIds={postCommentIds} />
      </Box>
      {sameCategoryPosts && sameCategoryPosts?.length > 0 && (
        <Box as="section" maxW="1248px" mx="auto" px={{ base: 4, md: 6 }} mt={{ base: 16, md: 24 }}>
          <Heading as="h2" fontSize={{ base: '26px', md: '30px' }} fontWeight={500} mb={6}>
            {t('postPage.sameCategoryPosts')}
          </Heading>
          <PostGrid posts={sameCategoryPosts} limit={3} />
        </Box>
      )}
    </>
  )
}
