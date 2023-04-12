/* eslint-disable import/no-duplicates */
import { useColorModeValue } from '@chakra-ui/color-mode'
import { Text, Box, Divider as DividerLine, Flex, Center, Heading, Stack } from '@chakra-ui/layout'
import FacebookLogo from '@iconify/icons-ion/logo-facebook'
import LinkedinLogo from '@iconify/icons-ion/logo-linkedin'
import TwitterLogo from '@iconify/icons-ion/logo-twitter'
import ShareLogo from '@iconify/icons-ion/share-social-sharp'
import { Icon, IconifyIcon } from '@iconify/react'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState, useEffect } from 'react'
import { BlogPosting } from 'schema-dts'

import { Content, HeaderImage, Metadata, PostGrid, SocialButton, Tag } from '@components/common'
import { useGetData } from '@hooks'
import { useGetLocalePublicUrl } from '@hooks/useGetLocalePublicUrl'
import {
  fixedEncodeURIComponent,
  publicUrl,
  getImageUrlFromMedia,
  getImageDataFromMedia,
  getReadingTime,
  getPlainText,
} from '@utils'
import { DATE_FORMAT, getLatestPostsKey, getPostCommentsKey, getPostKey, QUERY_ABOUT } from '@utils/constants'
import { PostComments } from '../PostComments'

type ShareButtonProps = {
  label: string
  icon: IconifyIcon
  href?: string
  onClick?: () => void
}

export function PostPage() {
  const { t } = useTranslation('postPage')
  const {
    asPath,
    query: { postId },
  } = useRouter()

  const about = useGetData<About>(QUERY_ABOUT)

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

  const generateLocalePublicUrl = useGetLocalePublicUrl()
  const {
    id,
    title,
    content,
    coverImage,
    imgUrl,
    locale: postLocale,
    createdAt,
    publishedAt,
    updatedAt,
    categories,
    summary,
    writer,
  } = post

  const [parsedDate, setParsedDate] = useState<string>(publishedAt.split('T')[0])

  useEffect(() => {
    setParsedDate(format(parseISO(publishedAt), DATE_FORMAT))
  }, [publishedAt])

  const postUrl = generateLocalePublicUrl(asPath)
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

  const extraMetaTags = [
    { name: 'og:updated_time', content: parsedDate },
    { name: 'article:published_time', content: publishedAt },
    { name: 'article:modified_time', content: updatedAt || '' },
    { name: 'article:section', content: categories?.[0].localizedName || '' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: summary },
    { name: 'twitter:creator', content: writer?.twitter || about?.twitter || '' },
    {
      name: 'twitter:image',
      content: getImageUrlFromMedia({ media: coverImage, format: 'small', fallback: imgUrl }),
    },
    { name: 'twitter:image:alt', content: coverImage ? coverImage.caption : '' },
  ]

  const imageData = getImageDataFromMedia({ media: coverImage, format: 'medium' })

  const ldJson: BlogPosting = {
    '@type': 'BlogPosting',
    headline: title,
    name: title,
    alternativeHeadline: summary,
    dateCreated: createdAt,
    datePublished: publishedAt,
    dateModified: updatedAt,
    inLanguage: postLocale,
    isFamilyFriendly: true,
    copyrightYear: parseISO(publishedAt).getFullYear(),
    ...(coverImage && {
      image: {
        '@type': 'ImageObject',
        url: getImageUrlFromMedia({ media: coverImage, format: 'medium', fallback: imgUrl }),
        width: imageData?.width.toString() || '',
        height: imageData?.height.toString() || '',
      },
      thumbnailUrl: getImageUrlFromMedia({ media: coverImage, format: 'small' }),
    }),
    author: {
      '@type': 'Person',
      name: writer?.name,
      url: writer?.personalUrl || '',
    },
    creator: {
      '@type': 'Person',
      name: writer?.name,
      url: writer?.personalUrl || '',
    },
    publisher: {
      '@type': 'Organization',
      name: 'White Emotion',
      url: 'https://whemotion.com',
      logo: {
        '@type': 'ImageObject',
        url: publicUrl('/images/WElogo.png'),
        width: '500',
        height: '500',
      },
    },
    mainEntityOfPage: postUrl,
    // keywords: post.tags?.map(({ name }) => name) || [],
    articleSection: categories?.[0].localizedName || '',
    articleBody: getPlainText(content),
  }

  const dividerLine = (
    <DividerLine
      orientation="horizontal"
      w="20px"
      mx="16px"
      borderColor={useColorModeValue('blackAlpha.800', 'white')}
    />
  )

  return (
    <>
      <Metadata
        type="article"
        name={t('postPage.title', { postName: title })}
        description={summary}
        imageUrl={getImageUrlFromMedia({ media: coverImage, format: 'medium', fallback: imgUrl })}
        extraMetaTags={extraMetaTags}
        ldJson={[ldJson]}
      />

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
                <Stack direction="row" spacing={2} ml={{ base: 0 }}>
                  {socialButtons}
                </Stack>
              </Flex>
            </Flex>
          </Box>
          <Flex direction="column" width="100%" justifyContent="center" mt="52px">
            <Content content={content} />
          </Flex>
          <Flex direction="row">
            <Stack direction="row" spacing={2} mt="40px">
              {categories?.map(category => (
                <Tag key={category.code} label={category.localizedName} />
              ))}
            </Stack>
            <Stack direction="row" spacing={2} ml="auto" pt={8}>
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
