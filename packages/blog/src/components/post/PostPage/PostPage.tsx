/* eslint-disable import/no-duplicates */
import { useColorModeValue } from '@chakra-ui/color-mode'
import { Text, Box, Divider as DividerLine, Flex, Center, Heading, Stack } from '@chakra-ui/layout'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useState, useEffect } from 'react'
import { BlogPosting } from 'schema-dts'

import { Content, HeaderImage, Metadata, PostGrid, SocialButton, Tag } from '@components/common'
import { useGetLocalePublicUrl } from '@hooks/useGetLocalePublicUrl'
import {
  fixedEncodeURIComponent,
  publicUrl,
  buildPostPath,
  getImageUrlFromMedia,
  getImageDataFromMedia,
  getReadingTime,
  getPlainText,
} from '@utils'
import FacebookIcon from '../../../../public/icon/facebook.svg'
import LinkedinIcon from '../../../../public/icon/linkedin.svg'
import ShareIcon from '../../../../public/icon/share.svg'
import TwitterIcon from '../../../../public/icon/twitter.svg'

export interface PostPageProps {
  post: Post
  sameCategoryPosts: Post[] | undefined
  about: About
}

type ShareButtonProps = {
  label: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  href?: string
  onClick?: () => void
}

export function PostPage({ post, about, sameCategoryPosts }: PostPageProps) {
  const { t } = useTranslation('postPage')
  const { asPath } = useRouter()

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
  const postUrl = fixedEncodeURIComponent(generateLocalePublicUrl(asPath))
  const postSocialTitle = encodeURIComponent(t('postPage.shareTitle', { title }))

  const shareButtonsData: ShareButtonProps[] = [
    {
      label: t('postPage.share', { socialNetwork: 'Twitter' }),
      href: `https://twitter.com/intent/tweet?text=${postSocialTitle}&url=${postUrl}`,
      icon: TwitterIcon,
    },
    {
      label: t('postPage.share', { socialNetwork: 'Facebook' }),
      href: `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`,
      icon: FacebookIcon,
    },
    {
      label: t('postPage.share', { socialNetwork: 'Linkedin' }),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`,
      icon: LinkedinIcon,
    },
  ]

  if (nativeNavigator && nativeNavigator.share !== undefined) {
    shareButtonsData.push({
      label: t('postPage.share', { socialNetwork: '...' }),
      icon: ShareIcon,
      onClick: () => nativeNavigator.share({ url: generateLocalePublicUrl(asPath) }),
    })
  }

  const socialButtons = shareButtonsData.map(({ label, href, icon: Icon, onClick }, index) => (
    <SocialButton key={index} label={label} href={href} onClick={onClick}>
      <Icon width={24} height={24} />
    </SocialButton>
  ))

  const extraMetaTags = [
    { name: 'og:updated_time', content: publishedAt },
    { name: 'article:published_time', content: publishedAt },
    { name: 'article:modified_time', content: updatedAt || '' },
    { name: 'article:section', content: categories?.[0].localizedName || '' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: summary },
    { name: 'twitter:creator', content: writer?.twitter || about.twitter || '' },
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
    mainEntityOfPage: generateLocalePublicUrl(buildPostPath(id.toString(), title)),
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
                <Text>{format(parseISO(publishedAt), 'dd.MM.yyyy')}</Text>
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
        </Flex>
      </Flex>

      {sameCategoryPosts && sameCategoryPosts?.length > 0 && (
        <Flex flexDir="column" mt={{ base: '60px' }} mb="60px" px="20px">
          <Heading fontFamily="Lora">{t('postPage.sameCategoryPosts')}</Heading>
          <PostGrid posts={sameCategoryPosts} />
        </Flex>
      )}
    </>
  )
}
