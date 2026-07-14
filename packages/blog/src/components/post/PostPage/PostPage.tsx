'use client'

/* eslint-disable import/no-duplicates */
import { Box, Center, Separator as DividerLine, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import FacebookLogo from '@iconify/icons-ion/logo-facebook'
import LinkedinLogo from '@iconify/icons-ion/logo-linkedin'
import TwitterLogo from '@iconify/icons-ion/logo-twitter'
import ShareLogo from '@iconify/icons-ion/share-social-sharp'
import { Icon, IconifyIcon } from '@iconify/react'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Content, HeaderImage, PostGrid, SocialButton, Tag } from '@blog/components/common'
import { useColorModeValue } from '@blog/components/ui/color-mode'
import { useGetData } from '@blog/hooks'
import { fixedEncodeURIComponent, formatPostDate, getReadingTime, publicUrl } from '@blog/utils'
import { getLatestPostsKey, getPostCommentsKey, getPostKey } from '@blog/utils/constants'

import { PostComments } from '../PostComments'

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

/* eslint-disable import/no-duplicates */

type ShareButtonProps = {
  label: string
  icon: IconifyIcon
  href?: string
  onClick?: () => void
}

export function PostPage() {
  const { t } = useTranslation('postPage')
  const { postId } = useParams<{ postId: string }>()
  const pathname = usePathname()

  const postKey = getPostKey(Number(postId))
  const post = useGetData<Post>(postKey)

  // Hooks (incl. useColorModeValue → next-themes) must run before any early return.
  const dividerBorderColor = useColorModeValue('blackAlpha.800', 'white')

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

  const { id, title, content, publishedAt, categories, writer } = post

  const parsedDate = formatPostDate(publishedAt)

  // usePathname already includes the locale prefix for non-default locales, so no extra prefixing.
  const postUrl = publicUrl(pathname || '')
  const encodedPostUrl = fixedEncodeURIComponent(postUrl)
  const postSocialTitle = encodeURIComponent(t('postPage.shareTitle', { title }))

  const shareButtonsData: ShareButtonProps[] = [
    {
      label: t('postPage.share', { socialNetwork: 'Twitter' }),
      href: `https://twitter.com/intent/tweet?text=${postSocialTitle}&url=${encodedPostUrl}`,
      icon: TwitterLogo,
    },
    {
      label: t('postPage.share', { socialNetwork: 'Facebook' }),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedPostUrl}`,
      icon: FacebookLogo,
    },
    {
      label: t('postPage.share', { socialNetwork: 'Linkedin' }),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedPostUrl}`,
      icon: LinkedinLogo,
    },
  ]

  if (nativeNavigator && nativeNavigator.share !== undefined) {
    shareButtonsData.push({
      label: t('postPage.share', { socialNetwork: '...' }),
      icon: ShareLogo,
      onClick: () => nativeNavigator.share({ url: postUrl }),
    })
  }

  const socialButtons = shareButtonsData.map(({ label, href, icon, onClick }, index) => (
    <SocialButton key={index} label={label} href={href} onClick={onClick}>
      <Icon icon={icon} width={24} height={24} />
    </SocialButton>
  ))

  const dividerLine = <DividerLine orientation="horizontal" w="20px" mx="16px" borderColor={dividerBorderColor} />

  return (
    <>
      <HeaderImage post={post} />

      <Flex justifyContent="center" mx="16px" mt={{ base: '40px' }}>
        <Flex direction="column" justifyContent="flex-start" width="100%" maxW="65ch">
          <Box>
            <Heading
              as="h1"
              fontSize={{ base: '32px', md: '52px' }}
              lineHeight={{ base: '44px', md: '64px' }}
              textAlign={{ base: 'center', md: 'left' }}
              fontFamily="Lora"
            >
              {title}
            </Heading>
            <Flex
              fontSize="14px"
              direction={{ base: 'column', md: 'row' }}
              mt={6}
              alignItems={{ base: 'flex-start', md: 'center' }}
            >
              <Flex
                mt={{ base: '8px', md: 0 }}
                height="fit-content"
                width={{ base: '100%', md: 'auto' }}
                grow={1}
                wrap="wrap"
                direction={{ base: 'column', md: 'row' }}
                alignItems={{ base: 'center' }}
              >
                <Text as="i" display="block">
                  {t('postPage.author', { name: writer?.name })}
                </Text>
                <Center h="22px">{dividerLine}</Center>
                <Text>{parsedDate}</Text>
                <Center h="22px">{dividerLine}</Center>
                <Text>{t('postPage.readingTime', { minutes: getReadingTime(content) })}</Text>
                <Center h="22px">{dividerLine}</Center>
                <Stack direction="row" gap={2} ml={{ base: 0 }}>
                  {socialButtons}
                </Stack>
              </Flex>
            </Flex>
          </Box>
          <Flex direction="column" width="100%" justifyContent="center" mt="52px">
            <Content content={content} />
          </Flex>
          <Flex direction="row">
            <Stack direction="row" gap={2} mt="40px">
              {categories?.map(category => (
                <Tag key={category.code} label={category.localizedName} />
              ))}
            </Stack>
            <Stack direction="row" gap={2} ml="auto" pt={8}>
              {socialButtons}
            </Stack>
          </Flex>
          <Center height="80px">
            <DividerLine orientation="horizontal" w="90%" borderColor="blackAlpha.500" />
          </Center>

          <PostComments postId={id} comments={comments} postIds={postCommentIds} />
        </Flex>
      </Flex>

      {sameCategoryPosts && sameCategoryPosts?.length > 0 && (
        <Flex flexDir="column" mt={{ base: '60px' }} mb="60px" px="20px">
          <Heading fontFamily="Lora">{t('postPage.sameCategoryPosts')}</Heading>
          <PostGrid posts={sameCategoryPosts} limit={4} />
        </Flex>
      )}
    </>
  )
}
